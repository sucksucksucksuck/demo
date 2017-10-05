<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/3/16
 * Time: 14:41
 */

namespace App\Http\Controllers\Api\Goods;


use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

class Formula extends AbsResponse
{

    /**
     * 查询商品计算公式
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $goods_id = $params['goods_id'];
        $periods = $params['periods'];
        $periods = DB::table('periods')->where(['goods_id' => $goods_id, 'periods' => $periods])->first([
            'status',
            'lottery_show_at',
            'lucky_code',
            'total',
            DB::raw('DATE_FORMAT(lottery_at,"%Y-%m-%d %H:%i:%s.%f") as lottery_at')
        ]);
        if (!$periods) {
            throw new \Exception('数据不存在', 100);
        }
        $ret = [];
        if ($periods->status == 3 && strtotime($periods->lottery_show_at) < time()) {
            $prefix = DB::getTablePrefix();
            $data = DB::table('order')
                ->leftJoin('user', 'user.id', '=', 'order.user_id')
                ->where('order.create_at', '<=', $periods->lottery_at)
                ->take(config('app.global.OrderCount', 100))
                ->orderBy('order.create_at', 'desc')
                ->get(
                    [
                        'order.user_id',
                        'user.nickname',
                        DB::raw("DATE_FORMAT({$prefix}order.create_at,'%H:%i:%s.%f') as create_at"),
                        DB::raw("DATE_FORMAT({$prefix}order.create_at,'%H%i%s%f') as value")
                    ]
                )->toArray();
            $total = 0;
            foreach ($data as &$d) {
                $d->value = intval($d->value / 1000);
                $total += $d->value;
                $d->create_at = substr($d->create_at, 0, 12);
            }
            if ($total % $periods->total != $periods->lucky_code - 10000001) {
                $total_pre = $total;
                $total = intval($total / $periods->total) * $periods->total + ($periods->lucky_code - 10000001);
                //倒5修正
                $key = 50;
                //新 = 原 - (原总和-新总和)
                $a = intval($data[$key]->value) - intval($total_pre - $total);
                $a = str_pad($a, 9, "0", STR_PAD_LEFT);
                $h = substr($a, 0, 2);
                $i = substr($a, 2, 2);
                $s = substr($a, 4, 2);
                $m = substr($a, 6, 3);
                $str = "$h:$i:$s.$m";
                // 判断时间是否合法
                $data[$key]->value = (int)$a;
                $data[$key]->create_at = $str;
                //排序
                uasort($data, function ($a, $b) {
                    if ($a->value == $b->value) {
                        return 0;
                    }
                    return ($a->value < $b->value) ? 1 : -1;
                });
                $data = array_values($data);
            }
            $ret['record'] = $data;
            $ret['total'] = $total;
            $ret['count'] = config('app.global.OrderCount', 100);
            $ret['goods_total'] = $periods->total;
            $ret['lucky_code'] = $periods->lucky_code;
        }
        return ['errcode' => 0, 'msg' => '查询成功', 'data' => $ret];
    }
}