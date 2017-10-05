<?php

namespace App\Http\Controllers\Web\Order;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Cache;

/**
 *  实物订单详情
 */
class EntityInfo extends AbsOrder
{
    public $permission = [
        'execute' => 1,
        'edit' => 2,
        'delivery' => 3,
        'conversion' => 4
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['211']??0;
    }

    /**
     *  订单详情
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $id = intval($request->input('id'));    //订单号
        $operation = intval($request->input('operation'));

        if (!$id) return ['errcode' => 1001, 'msg' => '请输入订单id！！！'];

        if ($operation == 1) {
            $value = Cache::get('periods_' . $id);
            if ($value && $value['user_id'] != $this->user->id) {
                return ['errcode' => 1002, 'msg' => '该订单正在修改！！！', 'data' => $value];
            } else {
                Cache::put('periods_' . $id, ['user_id' => $this->user->id, 'username' => $this->user->truename], 5);
            }
        }

        $prefix = DB::getTablePrefix();
        // id=商品期数订单id，buy=购买数量，periods=期数，unit_price=商品单价，status = ( 1=>未开奖,2=>等待开奖,3=>已开奖，4=>已关闭 )，order_status=(1=>待确认,2=>已确认填写收货地址,3=>已发货,4=>已签收(完成))
        $data = DB::table('periods as p')
            ->leftJoin('goods as g', 'g.id', '=', 'p.goods_id')
            ->leftJoin('user as u', 'u.id', '=', 'p.user_id')
            ->leftJoin('order as o', 'o.id', '=', 'p.order_id')
            ->leftJoin('user_amount_log as ual', 'ual.order_no', '=', 'o.order_no')
            ->leftJoin('user_red as ur', 'ur.id', '=', 'ual.user_red_id')
            ->where([['p.id', $id], ['p.user_type', '!=', 1], ['p.order_type', 2], ['p.order_status', '>', 1], ['p.status', 3]])
            ->select('p.id', 'p.user_id', 'p.lottery_show_at', 'p.unit_price', 'p.lucky_code', 'p.buy', 'p.status', 'p.periods', 'p.order_status', 'p.order_id', 'p.contact_name', 'p.contact_phone', 'p.contact_id', 'p.payment_no', 'payment_channel', 'payment_bank', 'payment_fee', 'p.remark', 'p.goods_id', 'p.order_type', 'p.payment_type', 'p.deliver_at', 'p.amount', 'p.goods_id', 'p.real_amount','p.confirm_at',
                'g.title', 'g.icon', 'g.url',
                'u.nickname',
                'o.ip', DB::raw("(select sum(num) from {$prefix}order as o2 where o2.user_id = {$prefix}p.user_id and o2.periods_id = {$prefix}p.id) as num_sum"), 'o.num', 'o.create_at as o_create_at', 'o.amount as o_amount',
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

    /**
     *  编辑订单
     * @param Request $request
     * @return array
     */
    public function edit(Request $request)
    {
        $id = intval($request->input('id'));    //订单号
        $remark = $request->input('remark');
        $re = null;
        $data = [];

        if (!$id) return ['errcode' => 1001, 'msg' => '请输入订单id！！！'];
        if ($remark && strlen($remark) > 255) {
            throw new \Exception('备注字符太长了！！！', 1002);
        }
        $data['remark'] = $remark??'';

        $re = DB::table('periods')->where([['order_type', 2], ['status', 3], ['user_type', '!=', 1], ['id', $id]])->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$id}，实物订单编辑", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改完成！', 'data' => $re];
        } else {
            return ['errcode' => 1003, 'msg' => '没有数据被修改！'];
        }
    }

    /**
     *  发货
     * @param Request $request
     * @return array
     */
    public function delivery(Request $request)
    {
        $id = intval($request->input('id'));//订单号
        $contact_name = $request->input('contact_name', '');
        $contact_id = $request->input('contact_id', '');
        $contact_phone = $request->input('contact_phone', '');
        $payment_channel = $request->input('payment_channel', '');
        $payment_fee = $request->input('payment_fee', 0);
        $payment_no = $request->input('payment_no', '');
        $remark = $request->input('remark', '');
        $order_status = $request->input('order_status', 0);
        $payment_type = $request->input('payment_type', 4);
        $order_type = $request->input('order_type');
        $real_amount = $request->input('real_amount');
        $data = [];
        $log = ['保存信息', '发货成功', '拒绝发货'];
        $log_index = 0;

        if (!$id) return ['errcode' => 1001, 'msg' => '请输入id！！！'];
        if (!preg_match('/^-?\d{1,5}\.?\d{0,5}$/', $payment_fee, $reg)) {
            return ['errcode' => 1002, 'msg' => '额外费用超出范围! （-99999.99999 ~ 99999.99999）'];
        }

        $get_order = DB::table('periods')->select('order_status', 'real_amount', 'amount','payment_type')->where('id', $id)->first();
        $where = [['order_type', 2], ['status', 3], ['user_type', '!=', 1], ['id', $id]];
        //发货
        if ($order_status == 3) {
            if ($payment_type == 4 && (!$contact_name || !$contact_id || !$contact_phone)) {
                return ['errcode' => 1003, 'msg' => '请填写完整数据！！！'];
            }
            if ($payment_type == 4) {
                $log_index = 1;
                $data['order_status'] = 3;
                if (is_numeric($real_amount)) $data['real_amount'] = $real_amount;
                $data['payment_channel'] = $payment_channel;
                $data['payment_fee'] = $payment_fee;
                $data['payment_no'] = $payment_no;
            } else {
                $log_index = 2;
                $data['order_status'] = 5;
                if (is_numeric($real_amount)) $data['real_amount'] = 0;
            }
            $where[] = ['order_status', '<', 3];
            $data['admin_id'] = $this->user->id;
            $data['deliver_at'] = date('Y-m-d H:i:s');
            $data['payment_type'] = $payment_type;
        } else {
            if($get_order->order_status >= 3 && $get_order->payment_type == 4) {
                if (is_numeric($real_amount)) $data['real_amount'] = $real_amount;
                $data['payment_channel'] = $payment_channel;
                $data['payment_fee'] = $payment_fee;
                $data['payment_no'] = $payment_no;
            }
            if($remark)$data['payment_type'] = 5;
        }

        //发货后不能修改用户信息
        if ($get_order->order_status < 3) {
            $data['contact_name'] = $contact_name;
            $data['contact_id'] = $contact_id;
            $data['contact_phone'] = $contact_phone;
        }
        if ($order_type) $data['order_type'] = $order_type;
        $data['remark'] = $remark;


        $re = DB::table('periods')->where($where)->update($data);

        if ($re) {
            if ($order_status == 3) {
                DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$id}，实物订单发货，" . $log[$log_index], 'type' => 3, 'ip' => $request->getClientIp()]);
            }
            return ['errcode' => 0, 'msg' => '操作成功！', 'data' => $re];
        } else {
            return ['errcode' => 2101, 'msg' => '没有数据被修改！'];
        }
    }

    /**
     *  类型转换
     * @param Request $request
     * @return array
     */
    public function conversion(Request $request)
    {
        $id = intval($request->input('id'));//订单号
        $contact_name = $request->input('contact_name', '');
        $contact_id = $request->input('contact_id', '');
        $remark = $request->input('remark', '');
        if (!$id) return ['errcode' => 1001, 'msg' => '请输入id！！！'];

        $where = [['order_type', 2], ['status', 3], ['user_type', '!=', 1], ['id', $id], ['order_status', '<', 3]];
        $data['order_type'] = 1;
        $data['contact_name'] = $contact_name;
        $data['contact_id'] = $contact_id;
        if ($remark) $data['remark'] = $remark;

        $re = DB::table('periods')->where($where)->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$id}，实物订单转换虚拟", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '转换成功！'];
        } else {
            return ['errcode' => 1003, 'msg' => '没有数据被修改！'];
        }
    }

}
