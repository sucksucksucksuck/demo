<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/3/15
 * Time: 11:02
 * Description: 中奖纪录
 */

namespace App\Http\Controllers\Api\Order;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

//中奖记录
class Winning extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    var $default_params = ['page' => 1, 'page_size' => 10];
    static public $order_status = [
        1 => '待确认地址',
        2 => '订单确认',
        3 => '已发货',
        4 => '已签收(完成)',
        5 => '夺宝完成',
        6 => '再次确认信息'
    ];

    public function execute(array $params)
    {
        $params = array_merge($this->default_params, $params);
        $prefix = DB::getTablePrefix();
        $query = DB::table('periods')
            ->leftJoin('order', 'periods.order_id', '=', 'order.id')
            ->leftJoin('user', 'periods.user_id', '=', 'user.id')
            ->leftJoin('goods', 'periods.goods_id', '=', 'goods.id')
            ->where(['periods.user_id' => $this->user->id])
            ->where(['order.winning' => 1])
            ->select([
                'order.num',
                'order.create_at',
                'order.goods_id',
                'periods.lucky_code',
                'periods.user_id',
                'periods.periods',
                'periods.id',
                'periods.buy',
                'periods.total',
                'periods.order_status',
                'periods.goods_type',
                'periods.lottery_show_at',
                'periods.lottery_at',
                'periods.share_id',
                DB::raw("(select SUM(num) from {$prefix}order where periods_id = {$prefix}periods.id and user_id = {$prefix}periods.user_id) as num2"),
                'goods.title',
                'goods.icon'])
            ->orderBy(DB::raw("if( {$prefix}periods.order_status = 1, 1, 5)", 'asc'))
            ->orderBy('periods.lottery_show_at', 'desc')
            ->forPage($params['page'], $params['page_size']);
        if ($this->request->ip() != config('app.old_ip')) {
            $time = date('Y-m-d', strtotime('-30 day'));
            $query->where('periods.create_at', '>', $time);
        }
        $info = $query->get();
        $new_winning = [];
        foreach ($info as &$d) {
            $d->order_status2 = self::$order_status[$d->order_status];
            if (isset($params['system']) && $params['system'] == 'old') {
                $d->order_status = ($d->order_status - 1);
            }
            if (isset($params['winning_time'])) {
                if ($d->lottery_at > $params['winning_time']) {
                    array_push($new_winning, ['periods_id' => $d->id, 'goods_id' => $d->goods_id, 'periods' => $d->periods, 'user_id' => $d->user_id, 'title' => $d->title]);
                }
            }
        }
        return ['errcode' => 0, 'msg' => '', 'data' => $info, 'new_winning' => $new_winning];
    }
}