<?php

namespace App\Jobs;

use App\Common\GatewayClient;
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
 * 订单队列
 * Class Order
 * @package App\Jobs
 */
class Order implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    var $buy_info;
    //var $task_count = 20;
    var $create_lucky_code = [];
    var $lottery = [];

    /**
     * Order constructor.
     * @param $buy_info
     */
    public function __construct($buy_info)
    {
        Cache::increment('order_count');//订单计数 当太多订单后机器人会自动停止
        Cache::add('build_order', 1, 1);//设定有新的订单,如果脚本卡死 自动停止 机器人
        $this->queue = 'order';
        $this->buy_info = $buy_info;
        //$this->onQueue('order');
        //
    }

    public function isLottery($goods)
    {
        $periods = DB::table('periods')->where(['goods_id' => $this->buy_info['goods_id']])->orderBy('create_at', 'desc')->first();
        if (!$periods || $periods->status != 1 || $periods->buy >= $periods->total) {
            if ($periods && $periods->status == 1) {
                $last_lottery_show_at = intval(Cache::get('last_lottery_show_at', 0));
                $wait = config('app.global.LotteryWait', 10);
                $lottery_show_at = time() + $wait;
                //如果相差小于秒 需要重新设置一下
                if ($last_lottery_show_at && $last_lottery_show_at + 3 > $lottery_show_at) {
                    $lottery_show_at = $last_lottery_show_at + 3;
                }
                //记录上次设置的时间
                Cache::put('last_lottery_show_at', $lottery_show_at, 1);
                $update = ['lottery_show_at' => date('Y-m-d H:i:s', $lottery_show_at), 'status' => 2];
                DB::table('periods')->where(['id' => $periods->id])->update($update);
                $this->lottery[] = (new Lottery($periods))->onQueue('lottery')->delay(intval($wait / 2));
            }
            $periods_id = Helper::incrementGoodsPeriods($this->buy_info['goods_id'], $goods, ['down_shelf_at' => date('Y-m-d H:i:s')]);
            return $periods = DB::table('periods')->find($periods_id);
        }
        if ($periods) {
            return $periods;
        }
        return false;
    }

    public function send($goods, $periods, $order_data)
    {
        if ($this->buy_info['user_type'] != 1) {
            $user = DB::table('user')->find($this->buy_info['user_id']);
            $send_data = [
                'action' => 'goods_monitor',
                'payload' => [
                    'periods' => [
                        'id' => $periods->id,
                        'goods_id' => $periods->goods_id,
                        'buy' => $periods->buy + $order_data['num'],
                        'total' => $periods->total,
                        'periods' => $periods->periods,
                        'lottery_type' => $periods->lottery_type
                    ],
                    'monitor' => [
                        'id' => $order_data['id'],
                        'periods_id' => $order_data['periods_id'],
                        'user_id' => $user->id,
                        'user_type' => $user->type,
                        'nickname' => $user->nickname,
                        'goods_id' => $goods->id,
                        'title' => $goods->title,
                        'periods' => $order_data['periods'],
                        'num' => $order_data['num'],
                        'create_at' => date('Y-m-d H:i:s'),
                        'total_buy' => $user->recharge_amount + $user->exchange_amount - $user->residual_amount,
                        'total_winning' => $user->winning_amount,
                        'today_buy' => DB::table('order')->where(['user_id' => $user->id])->where('create_at', '>=', date('Y-m-d'))->sum('num'),
                        'today_winning' => DB::table('periods')->where(['user_id' => $user->id])->where('create_at', '>=', date('Y-m-d'))->sum('amount'),
                    ]]
            ];
            GatewayClient::sendToGroup('GoodsMonitor', $send_data);
            // SocketClient::sendToGoodsMonitor($send_data);
        }
    }

    /**
     * @param $buy_count
     * @throws \Exception
     */
    public function buy($buy_count)
    {
        if ($buy_count < 0) {
            throw new \Exception('购买数量不能是负数');
        }
        $goods = DB::table('goods')->where(['id' => $this->buy_info['goods_id']])->first();
        $periods = $this->isLottery($goods);
        if ($periods) {
            $continue = 0;
            $total = $periods->total;
            $surplus = $total - $periods->buy;
            //判断当前购买数量是否大于剩余数量
            if ($surplus > 0 && $surplus < $buy_count) {
                $continue = $buy_count - $surplus;
                $buy_count = $surplus;
            }
            if ($continue > 0) {
                $this->buy_info['buy_count'] = $continue;
            }
            //需要插入订单的数据
            $order_data = [
                'user_id' => $this->buy_info['user_id'],
                'num' => $buy_count,
                'periods_id' => $periods->id,
                'goods_id' => $periods->goods_id,
                'periods' => $periods->periods,
                'status' => 0,
                'order_no' => $this->buy_info['order_no'],
                'user_type' => $this->buy_info['user_type'],
                'amount' => $buy_count * $periods->unit_price,
                'ip' => $this->buy_info['ip']
            ];
            $order_data['id'] = DB::table('order')->insertGetId($order_data);
            $order_data['total'] = $total;//调用创建幸运码使用
            DB::table('periods')->where(['id' => $periods->id])->increment('buy', $buy_count);
            $queue = 'create_lucky_code' . str_pad($periods->id % Helper::getNumProcs('create-lucky-code'), 2, '0', STR_PAD_LEFT);
            $this->create_lucky_code[] = (new CreateLuckyCode($order_data['id']))->onQueue($queue);
            if ($this->buy_info['user_type'] == 1) {
                DB::table('goods')->where(['id' => $this->buy_info['goods_id']])->update(['last_buy_at' => date('Y-m-d H:i:s')]);
            }
            //
            if ($buy_count + $periods->buy >= $total) {
                $this->isLottery($goods);
            }
            $this->send($goods, $periods, $order_data);
            if ($this->buy_info['user_type'] == 0) {
                if (!$goods) {
                    $goods = DB::table('goods')->where(['id' => $this->buy_info['goods_id']])->first();
                }
                DB::connection('anyou')->table('ding')->insertGetId([
                        'orde' => $goods->title,
                        'uid' => $this->buy_info['user_id'],
                        'cpid2' => $goods->type,
                        'jine' => $buy_count,
                        'cnum' => $buy_count,
                        'stime' => time(),
                        'atime' => time(),
                        'xbei' => '',
                        'yunf' => 0,
                        'zfbid' => '',
                        'zfbxm' => '',
                        'cpid' => 66
                    ]
                );
            }
            if ($continue > 0) {
                $this->buy($continue);
            }
        }
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $buy_count = $this->buy_info['buy_count'];
//        if ($this->buy_info['user_type'] == 0) {
//            if (DB::table('user_amount_log')->where(['order_no' => $this->buy_info['order_no']])->count() == 0) {
//                return;
//            }
//        }
        try {
            DB::beginTransaction();//开始事务
            DB::connection('anyou')->beginTransaction();
            Helper::globalConfig();
            $this->buy($this->buy_info['buy_count']);
            for ($i = 0; $i < count($this->create_lucky_code); $i++) {
                dispatch($this->create_lucky_code[$i]);
            }
            for ($i = 0; $i < count($this->lottery); $i++) {
                dispatch($this->lottery[$i]);
            }
        } catch (\Exception $e) {
            if ($e->getCode() == 100) {
                $back_amount = $this->buy_info['buy_count'] * $this->buy_info['unit_price'];
            } else {
                DB::connection('anyou')->rollBack();
                DB::rollBack();
                $back_amount = $buy_count * $this->buy_info['unit_price']; //返还金额（红包也在返还金额中）
            }
            if ($this->buy_info['order_no']) {
                //设置用户金额变更 //返还金额（红包也在返还金额中）
                DB::table('user')->where(['id' => $this->buy_info['user_id']])->increment('residual_amount', $back_amount);
                if (isset($this->buy_info['system']) && $this->buy_info['system'] == 'old') {
                    DB::connection('anyou')->table('vip')->where(['uid' => $this->buy_info['user_id']])->increment('jine', $back_amount);
                }
                //生成日志
                DB::table('user_amount_log')->insert([
                    'user_id' => $this->buy_info['user_id'],
                    'log' => '退还',
                    'amount' => $back_amount,
                    'type' => 2,
                    'order_no' => $this->buy_info['order_no'],
                    'user_red_id' => 0
                ]);
            }
            Log::error('购买错误,msg=' . $e->getMessage());
        } finally {
            DB::connection('anyou')->commit();
            DB::commit();
            Cache::decrement('order_count');
            $this->delete();
        }
        // usleep(mt_rand(10000, 100000));//延时1毫秒
    }
}
