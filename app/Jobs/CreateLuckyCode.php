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

/**
 * 幸运码队列生成
 * Class CreateLuckyCode
 * @package App\Jobs
 */
class CreateLuckyCode implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    var $order_id;

    public function __construct($order_id)
    {
        $this->queue = 'create_lucky_code';
        $this->order_id = $order_id;
        $this->delay = 2;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        if (!$this->order_id) {
            return;
        }
        try {
            ini_set('memory_limit', '256M');
            //Helper::globalConfig();
            //Log::debug("+++++++++++++++++++++++++++++");
            DB::beginTransaction();
            //获取缓存中的幸运码
            $order = DB::table('order')->find($this->order_id);
            if (!$order || $order->status == 1) {
                return;
                //throw new \Exception('已经生成过幸运码', 400);
            }
            //Log::info("当前订单" . print_r($order, true));
            $periods = DB::table('periods')->find($order->periods_id);
            $key = "lucky_code_{$order->periods_id}";
            $lucky_code = Cache::get($key, []);
            //Log::info("剩余" . print_r($lucky_code, true));
            //Log::info("购买数量" . $order->num);
            if (empty($lucky_code)) {
                $use_lucky_code = DB::table('lucky_code')->where(['periods_id' => $order->periods_id])->select('lucky_code')->get();
                $use_lucky_code_keys = [];
                if ($use_lucky_code) {
                    for ($i = 0; $i < $use_lucky_code->count(); $i++) {
                        $use_lucky_code_keys[strval($use_lucky_code[$i]->lucky_code)] = true;
                    }
                }
                for ($i = 0; $i < $periods->total; $i++) {
                    $code = strval(10000001 + $i);
                    if (!isset($use_lucky_code_keys[$code])) {
                        $lucky_code[] = $code;
                    }
                }
                unset($use_lucky_code);
                unset($use_lucky_code_keys);
            }
            //Log::info("生成成功");
            shuffle($lucky_code);
            $this_lucky_code = array_splice($lucky_code, 0, $order->num);
            //  return;
            // unset($this_lucky_code);
            $data_arr = array_chunk($this_lucky_code, 3000);
            foreach ($data_arr as $data) {
                $create_data = [];
                foreach ($data as $code) {
                    $create_data[] = [
                        'user_id' => $order->user_id,
                        'order_id' => $order->id,
                        'periods_id' => $order->periods_id,
                        'lucky_code' => $code,
                        'user_type' => $order->user_type
                    ];
                }
                DB::table('lucky_code')->insert($create_data);
                unset($create_data);
            }
            DB::table('order')->where(['id' => $order->id])->update(['status' => 1]);
            //Log::info("购买成功");
            if (empty($lucky_code)) {
                Cache::forget($key);
            } else {
                Cache::forever($key, $lucky_code);
            }
            //Log::info("结束");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('幸运码生成错误, code = ' . $e->getCode() . ',msg=' . $e->getMessage() . 'order_id=' . $this->order_id);
        } finally {
            DB::commit();
            $this->delete();
        }
    }
}
