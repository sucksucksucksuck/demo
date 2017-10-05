<?php

namespace App\Jobs;

use App\Common\Helper;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class Lottery implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    var $periods;
    var $time;

    /**
     * Lottery constructor.
     * @param $periods
     * @param $delay
     */
    public function __construct($periods)
    {
        Cache::increment('lottery_count');
        $this->queue = 'lottery';
        $this->periods = $periods;
    }

    private function lottery($time)
    {
        $this->time = $time;
        $total = DB::table('order')
            ->where('create_at', '<=', $this->time)
            ->selectRaw("sum(DATE_FORMAT(create_at,'%H%i%s%f')/1000) % ? as total", [$this->periods->total])
            ->orderBy('create_at', 'desc')
            ->take(config('app.global.OrderCount', 100))
            ->first()->total;
        $lucky_code = intval($total) + 10000001;
        $lucky_data = DB::table('lucky_code')->where(['lucky_code' => $lucky_code, 'periods_id' => $this->periods->id])->first();
        return $lucky_data;
    }

    private function cheat(&$lucky_data, &$update_data)
    {
        if ($lucky_data && $this->periods->lottery_type == 2) {
            if ($lucky_data->user_type == 0) {
                $ideal_value = DB::table('lucky_code')
                    ->where('user_type', '<>', '0')
                    ->where(['periods_id' => $this->periods->id])
                    ->orderByRaw('ABS(lucky_code - ?) asc', $lucky_data->lucky_code)
                    ->first();
                if (!$ideal_value) {
                    //作弊失败 机器人未购买商品
                    $update_data['lottery_use'] = 3;
                    return;
                }
            } else {
                $update_data['lottery_use'] = 1;
                //不需要作弊用 开奖正确
                return;
            }
        } else if ($lucky_data && $this->periods->lottery_type == 3) {
            if ($lucky_data->user_id != $this->periods->appoint) {
                $ideal_value = DB::table('lucky_code')
                    ->where(['periods_id' => $this->periods->id, 'user_id' => $this->periods->appoint])
                    ->orderByRaw('ABS(lucky_code - ?) asc', $lucky_data->lucky_code)
                    ->first();
                if (!$ideal_value) {
                    //作弊失败 该用户未购买商品
                    $update_data['lottery_use'] = 3;
                    return;
                }
            } else {
                $update_data['lottery_use'] = 1;
                //不需要作弊用 开奖正确
                return;
            }
        } else {
            //不需要作弊用 开奖正确
            $update_data['lottery_use'] = 1;
            return;
        }
        $lucky_data = $ideal_value;
        $update_data['lottery_use'] = 4;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        try {
            Helper::globalConfig();
            //每次开奖延时3到5秒之间
            // usleep(mt_rand(3000000, 5000000));
            DB::beginTransaction();
            $count = DB::table('order')->where(['periods_id' => $this->periods->id, 'status' => 0])->count();
            if ($count > 0) {
                throw new \Exception('有幸运码未全部生产完生成成功!');
            }
            $this->periods = DB::table('periods')->find($this->periods->id);
            if ($this->periods->status == 3) {
                return;
                // throw new \Exception('已经开过奖');
            }
            $update_data = ['lottery_use' => 1, 'status' => 3];
            $lucky_data = $this->lottery(date('Y-m-d H:i:s.') . Helper::getMicrotime());
            $this->cheat($lucky_data, $update_data);
            if ($lucky_data) {
                $update_data['lottery_at'] = $this->time;
                //$update_data['lottery_show_at'] = $this->time;
                $update_data['user_id'] = $lucky_data->user_id;
                $update_data['order_id'] = $lucky_data->order_id;
                $update_data['lucky_code'] = $lucky_data->lucky_code;
                $update_data['user_type'] = $lucky_data->user_type;
                $update_data['lottery_show_at'] = DB::raw('if(lottery_at > lottery_show_at,lottery_at,lottery_show_at)');
                if ($lucky_data->user_type == 1) {
                    $update_data['order_status'] = 5;
                }
                DB::table('periods')->where(['id' => $lucky_data->periods_id])->update($update_data);
                DB::table('order')->where(['id' => $lucky_data->order_id])->update(['winning' => 1]);
                DB::table('user')->where(['id' => $lucky_data->user_id])->increment('winning_amount', $this->periods->amount);
                $key = "lucky_code_{$this->periods->id}";
                Cache::forget($key);
            } else {
                throw new \Exception('未知错误!');
            }
            //Log::debug('进入一次开奖 编号为[' . $this->periods['id'] . ']执行完毕当前时间是[' . date('Y-m-d H:i:s') . ']');
        } catch (\Exception $e) {
            DB::rollBack();
            if (isset($this->periods)) {
                Log::error('开奖 编号为[' . $this->periods->id . ']出现异常[' . $e->getMessage() . ']');
            } else {
                Log::error('开奖 编号为[编号未知]出现异常[' . $e->getMessage() . ']');
            }
        } finally {
            DB::commit();
            Cache::decrement('lottery_count');
            $this->delete();
        }
        //
    }
}
