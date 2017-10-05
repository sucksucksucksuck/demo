<?php

namespace App\Http\Controllers\Web\Order;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 *  所有订单详情
 */
class AllInfo extends AbsOrder
{
    public $permission = [
        'execute' => 1
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['215']??0;
    }

    /**
     *  所有订单详情
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $id = intval($request->input('id'));    //订单号

        if (!$id) return ['errcode' => 1001, 'msg' => '请输入订单id！！！'];
        $prefix = DB::getTablePrefix();

        // id=商品期数订单id，buy=购买数量，periods=期数，unit_price=商品单价，status = ( 1=>未开奖,2=>等待开奖,3=>已开奖，4=>已关闭 )，order_status=(1=>待确认,2=>已确认填写收货地址,3=>已发货,4=>已签收(完成))
        $data = DB::table('order as o')
            ->leftJoin('periods as p', 'p.id', '=', 'o.periods_id')
            ->leftJoin('goods as g', 'g.id', '=', 'o.goods_id')
            ->leftJoin('user as u', 'u.id', '=', 'o.user_id')
            ->leftJoin('user_amount_log as ual', 'ual.order_no', '=', 'o.order_no')
            ->leftJoin('user_red as ur', 'ur.id', '=', 'ual.user_red_id')
            ->where(['o.id' => $id])
            ->select('p.id', 'p.lottery_show_at', 'p.unit_price', 'p.lucky_code', 'p.buy', 'p.status', 'p.periods', 'p.order_status', 'p.contact_name', 'p.contact_phone', 'p.contact_id', 'p.payment_no', 'payment_channel', 'payment_bank', 'payment_fee', 'p.remark', 'p.order_type', 'p.payment_type', 'p.deliver_at', 'p.amount', 'p.real_amount', 'p.goods_type',
                'g.title', 'g.icon', 'g.url',
                'u.nickname',
                'o.ip', DB::raw("(select sum(num) from {$prefix}order as o2 where o2.user_id = {$prefix}p.user_id and o2.periods_id = {$prefix}p.id) as num_sum"), 'o.num', 'o.goods_id', 'o.id as order_id', 'o.user_id', 'o.amount as o_amount', 'o.winning','o.order_no',
                'ual.amount as ual_amount', 'ual.order_no',
                'ur.amount as red_amount', 'ur.title as red_title'
            )
            ->first();
        if ($data->order_no) {
            $data->pay_order_id = DB::table('order')->where('order_no', $data->order_no)->pluck('id');
        } else {
            $data->pay_order_id = [$data->order_id];
        }
        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }
}
