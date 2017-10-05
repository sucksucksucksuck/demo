<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/2/6
 * Time: 13:40
 */

namespace App\Console\Commands;

use App\Jobs\Order;
use Illuminate\Console\Command;

use App\Common\Helper;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * 机器人购买
 * Class RobotBuy
 * @package App\Jobs
 */
class RobotBuy extends Command
{
    protected $signature = 'robot_buy';
    protected $description = '检查是否有未开奖的商品';

    private function probability($arr)
    {
        $total = 0;
        for ($i = 0; $i < count($arr); $i++) {
            $total += $arr[$i] * 1000;
        }
        $result = 1;
        if ($total > 1) {
            $result = mt_rand(1, $total - 1);
        }
        $total = 0;
        for ($i = 0; $i < count($arr); $i++) {
            $total += $arr[$i] * 1000;
            if ($result < $total) {
                return $i;
            }
        }
        return 0;
    }

    private function buy()
    {
        //return;
        // $time = date('Y-m-d H:i:s');
        $time = time();
        $goods = DB::table('goods')
            ->take(config('app.global.SinglePeopleBuy', 20))
            ->whereIn('status', ['1,2'])
            ->where(['robot_buy' => 1])
            ->whereNotNull('robot_buy_setting')
            ->whereRaw('UNIX_TIMESTAMP(last_buy_at) + get_goods_interval (robot_buy_setting) < ?', [$time])
            ->orderByRaw('UNIX_TIMESTAMP(last_buy_at) + get_goods_interval (robot_buy_setting) ASC')
            //   ->whereRaw('FROM_UNIXTIME(UNIX_TIMESTAMP(create_at) +  ?) < ?', [mt_rand(1, 3), $time])
            ->get();
        if ($goods->count() > 0) {
            $users = DB::table('user')
                ->where(['type' => 1])
                ->inRandomOrder()
                ->take($goods->count())
                ->get();
            for ($i = 0; $i < $goods->count(); $i++) {
                $periods = DB::table('periods')->where(['goods_id' => $goods[$i]->id, 'status' => 1])->first();
                if ($periods) {
                    $surplus = $periods->total - $periods->buy;
                    $max = (int)($periods->total / 3);
                } else {
                    $surplus = $goods[$i]->total;
                    $max = (int)($goods[$i]->total / 3);
                }
                if ($max > 5000) {
                    $max = 5000;
                }
                // Log::debug('随机比例=' . $index);
                $robot_buy_setting = json_decode($goods[$i]->robot_buy_setting, true);
                $buy_count = 1;
                if (isset($robot_buy_setting['model'])) {
                    $probability = [];
                    foreach ($robot_buy_setting['model'] as $model) {
                        $probability[] = $model['chance'];
                    }
                    $index = $this->probability($probability);
                    $chance_min = $robot_buy_setting['model'][$index]['min'];
                    $chance_max = $robot_buy_setting['model'][$index]['max'];
                    if ($surplus < $chance_min) {
                        $buy_count = mt_rand(1, $surplus);
                    } else if ($surplus < $chance_max) {
                        $buy_count = mt_rand($chance_min, $surplus);
                    } else if ($chance_min <= $chance_max) {
                        $buy_count = mt_rand($chance_min, $chance_max);
                    }
                }
                if ($buy_count > $max) {
                    if ($max > 0) {
                        $buy_count = mt_rand(1, $max);
                    }
                }
                usleep(mt_rand(1000000, 2000000));
                $job = new Order([
                    'user_id' => $users[$i]->id,
                    'goods_id' => $goods[$i]->id,
                    'unit_price' => $goods[$i]->unit_price,
                    'buy_count' => $buy_count,
                    'user_type' => $users[$i]->type,
                    //'red_id'=>1,
                    'order_no' => '',
                    'ip' => Helper::isEmpty($users[$i]->last_login_ip, $users[$i]->create_ip)
                ]);
                $queue = 'order_' . str_pad($goods[$i]->id % Helper::getNumProcs('order'), 2, '0', STR_PAD_LEFT);
                $job->onQueue($queue);
                dispatch($job);
            }
        }
    }

    function handle()
    {
        //Log::info('RobotBuy');
        Helper::globalConfig();
        //$this->comment('[' . date('Y-m-d H:i:s') . ']开始机器人购买！');
        $speed = config("app.global.BuySpeed", 1);
        if (config('app.global.RobotBuy', false)) {
            for ($i = 0; $i < $speed; $i++) {
                $order_count = Cache::get('order_count', 0);
                if ($order_count > 100) {
                    $this->comment('[' . date('Y-m-d H:i:s') . ']当前订单过多暂停机器人购买,数量=' . $order_count);
                    return;
                }
                $lottery_count = Cache::get('lottery_count', 0);
                if ($lottery_count > 10) {
                    $this->comment('[' . date('Y-m-d H:i:s') . ']当前未开奖商品过多，暂停机器人购买');
                    return;
                }
                $build_order = Cache::get('build_order', 0);
                if ($build_order > 0 && $build_order == 0) {
                    $this->comment('[' . date('Y-m-d H:i:s') . ']订单服务器挂了,请运行supervisorctl restart all');
                    return;
                }
                try {
                    $this->buy();
                } catch (\Exception $e) {
                    $this->comment($e->getMessage());
                }
                if ($speed > 1) {
                    sleep((int)(60 / $speed));
                }
            }
        }
    }

}