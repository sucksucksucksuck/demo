<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/2/28
 * Time: 14:37
 */

namespace App\Http\Controllers\Api\Order;


use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

class Car extends AbsResponse
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

    public function execute(array $params)
    {
        $car = cache('car_' . $this->user->id);
        $data = [];
        $amount = 0;
        if ($car) {
            $periods = DB::table('periods')
                ->leftJoin('goods', 'goods.id', '=', 'periods.goods_id')
                ->whereIn('periods.goods_id', array_keys($car))
                ->where(['periods.status' => 1])
                ->select(['periods.goods_id', 'periods.total', 'periods.buy', 'periods.periods', 'goods.icon', 'goods.title', 'periods.unit_price'])
                ->get();
            $new_car = [];
            foreach ($periods as $p) {
                $count = $car[strval($p->goods_id)];
                $surplus = $p->total - $p->buy;
                if ($surplus < $count) {
                    $count = $surplus;
                }
                $new_car[strval($p->goods_id)] = $count;
                $data[] = [
                    'goods_id' => $p->goods_id,
                    'total' => $p->total,
                    'title' => $p->title,
                    'buy' => $p->buy,
                    'count' => $count,
                    'periods' => $p->periods,
                    'unit_price' => $p->unit_price,
                    'icon' => $p->icon
                ];
                $amount += $count * $p->unit_price;
            }
            cache(['car_' . $this->user->id => $new_car], 24 * 7);
        }
        if (!isset($params['system'])) {
            $user_residual_amount = $this->user->residual_amount;
        } else {
            $user_residual_amount = 0;
        }
        return ['errcode' => 0, 'msg' => '', 'data' => ['car' => $data, 'amount' => $amount, 'count' => count($data), 'user_residual_amount' => $user_residual_amount]];
    }

    public function op(array $params)
    {
        $goods_ids = explode(',', $params['goods_id']); //兼容当购物车有一个或多个商品
        $counts = explode(',', $params['count']); //当购物车有一个或多个商品
        $type = intval($params['type']);
        $car = cache('car_' . $this->user->id);
        for($i = 0;$i < count($goods_ids);$i++){
            $goods = DB::table('goods')->find($goods_ids[$i]);
            if (!$goods) {
                throw new \Exception('商品不存在', 100);
            }
            if ($goods->status == 3 && $type != 3) { //下架商品允许在购物车中删除
                throw new \Exception('商品已下架', 100);
            }
            if ($car && isset($car[strval($goods_ids[$i])])) {
                if ($type == 1) {
                    $car[strval($goods_ids[$i])] += 1;
                } else if ($type == 3) {
                    unset($car[strval($goods_ids[$i])]);
                } else if ($type == 4) {
                    $car[strval($goods_ids[$i])] = $car[strval($goods_ids[$i])] + $counts[$i];
                } else { //type = 2
                    $car[strval($goods_ids[$i])] = $counts[$i];
                }
            } else if ($car && count($car) >= 30) {
                throw new \Exception('最多只允许加30个商品', 100);
            } else {
                if (!$car) {
                    $car = [];
                }
                $car[strval($goods_ids[$i])] = $counts[$i];
            }
        }
        cache(['car_' . $this->user->id => $car], 24 * 7);
        return $this->execute($params);
    }
}