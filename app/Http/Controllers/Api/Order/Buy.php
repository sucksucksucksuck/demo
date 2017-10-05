<?php

namespace App\Http\Controllers\Api\Order;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use App\Http\Controllers\Event\Common;
use App\Jobs\Order;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/2/28
 * Time: 13:39
 */
class Buy extends AbsResponse
{

    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        } else if ($this->user->type == 1) {
            throw new \Exception('账号已经被禁用了!', 300);
        } else if ($this->user->status == 2) {
            throw new \Exception('账号已经被禁用了!', 300);
        }
    }

    /**
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $red_id = $params['red_id'] ?? false;
        $goods_id = $params['goods_id'] ?? false;
        $car = cache('car_' . $this->user->id);
        if (!$car) {
            throw new \Exception('购物车里面没有商品无法支付', 100);
        }
        $periods = DB::table('periods')
            ->leftJoin('goods', 'goods.id', '=', 'periods.goods_id')
            ->whereIn('periods.goods_id', array_keys($car))
            ->where(['periods.status' => 1])
            ->select(['periods.goods_id', 'periods.total', 'periods.buy', 'periods.periods', 'goods.icon', 'goods.title', 'goods.unit_price'])
            ->get();
        $amount = 0;
        foreach ($periods as $p) {
            if ($goods_id) {
                if ($goods_id == $p->goods_id) {
                    $count = $car[strval($p->goods_id)];
                    if ($count < 1) {
                        continue;
                    }
                    $amount = $count * $p->unit_price;
                } else {
                    continue;
                }
            } else {
                $count = $car[strval($p->goods_id)];
                if ($count < 1) {
                    continue;
                }
                $amount += $count * $p->unit_price;
            }
        }
        $red_amount = 0;
        if ($red_id) {
            $user_red = DB::table('user_red')->where(['user_id' => $this->user->id, 'status' => 1])
                ->where('end_at', '>', date('Y-m-d H:i:s'))
                ->where('begin_at', '<=', date('Y-m-d H:i:s'))
                ->find($red_id);
            if (!$user_red) {
                throw new \Exception('未找到能使用的红包', 100);
            } else {
                $red = DB::table('red')->find($user_red->red_id);
                //Log::debug("use_amount={$red->use_amount},amount={$amount}");
                if ($red->use_amount > $amount) {
                    throw new \Exception('购买的金额不足', 100);
                }
                $red_amount = $user_red->amount;
                DB::table('user_red')->where(['id' => $user_red->id])->update(['status' => 2, 'use_at' => date('Y-m-d H:i:s')]);
                //已使用的红包+1
                DB::table('user_red as u')
                    ->leftJoin('red as r', 'u.red_id', '=', 'r.id')
                    ->where(['u.id' => $user_red->id])
                    ->increment('use_count', 1);
            }
        }
        $use_amount = $amount - $red_amount;
        if ($use_amount < 0) {
            $use_amount = 0;
        }
        if ($use_amount > $this->user->residual_amount) {
            throw new \Exception('金额不足', 100);
        }
        $order_no = cache('order_no');
        if (!$order_no) {
            $order_no = date('ymdHis') . '001';
        } else {
            $order_no = sprintf('%.0f', floatval($order_no) + mt_rand(2, 10));
        }
        cache(['order_no' => $order_no], 24 * 60);
        if ($use_amount < 0) {
            $use_amount = 0;
        }
        DB::table('user_amount_log')->insert([
            'user_id' => $this->user->id,
            'log' => '购买',
            'amount' => -$use_amount,
            'type' => 1,
            'order_no' => $order_no,
            'user_red_id' => $red_id
        ]);

        //设置用户金额变更
        DB::table('user')->where(['id' => $this->user->id])->decrement('residual_amount', $use_amount, [
                'nickname' => $this->user->nickname,
                'icon' => $this->user->icon,
                'last_login_ip' => $this->user->last_login_ip,
                'last_login_at' => $this->user->last_login_at,
                'create_ip' => $this->user->create_ip,
                'type' => $this->user->type,
                'reg' => $this->user->reg,
                'channel' => $this->user->channel
            ]
        );
        //if (isset($params['system']) && $params['system'] == 'old') {
        DB::connection('anyou')->table('vip')->where(['uid' => $this->user->id])->decrement('jine', $use_amount);
        //}
        Common::consumer($this->user->id, $use_amount);
        foreach ($periods as $p) {
            if ($goods_id) {
                if ($goods_id == $p->goods_id) {
                    $buy_count = $car[strval($p->goods_id)];
                    if ($buy_count < 1) {
                        continue;
                    }
                    $job = new Order([
                        'user_id' => $this->user->id,
                        'goods_id' => $p->goods_id,
                        'unit_price' => $p->unit_price,
                        'buy_count' => $buy_count,
                        'user_type' => $this->user->type,
                        'order_no' => $order_no,
                        'system' => $params['system']??'new',
                        'ip' => $params['ip'] ?? $this->request->ip()
                    ]);
                    $queue = 'order_high_' . str_pad($p->goods_id % Helper::getNumProcs('order'), 2, '0', STR_PAD_LEFT);
                    //  Log::debug($queue);
                    $job->onQueue($queue);
                    dispatch($job);
                } else {
                    continue;
                }
            } else {
                $buy_count = $car[strval($p->goods_id)];
                if ($buy_count < 1) {
                    continue;
                }
                $job = new Order([
                    'user_id' => $this->user->id,
                    'goods_id' => $p->goods_id,
                    'unit_price' => $p->unit_price,
                    'buy_count' => $buy_count,
                    'user_type' => $this->user->type,
                    'order_no' => $order_no,
                    'system' => $params['system'] ?? 'new',
                    'ip' => $params['ip'] ?? $this->request->ip()
                ]);
                $queue = 'order_high_' . str_pad($p->goods_id % Helper::getNumProcs('order'), 2, '0', STR_PAD_LEFT);
                //  Log::debug($queue);
                $job->onQueue($queue);
                dispatch($job);
            }
        }
        if ($goods_id) {
            unset($car[strval($goods_id)]);
            cache(['car_' . $this->user->id => $car], 24 * 7);
        } else {
            Cache::forget('car_' . $this->user->id);
        }
        return ['errcode' => 0, 'msg' => '购买成功'];
    }
}