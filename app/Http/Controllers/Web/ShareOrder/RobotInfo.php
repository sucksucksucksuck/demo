<?php

namespace App\Http\Controllers\Web\ShareOrder;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 *  机器人订单
 */
class RobotInfo extends AbsOrder
{
    public $permission = [
        'execute' => 1,
        'edit' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['403']??0;
    }

    /**
     *  订单详情
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        /*$id = intval($request->input('id'));    //订单号

        if(!$id)return ['errcode' => 1001, 'msg' => '请输入订单id！！！'];

        // id=商品期数订单id，buy=购买数量，periods=期数，unit_price=商品单价，status = ( 1=>未开奖,2=>等待开奖,3=>已开奖，4=>已关闭 )，order_status=(1=>待确认,2=>已确认填写收货地址,3=>已发货,4=>已签收(完成))
        $data = DB::table('periods as p')
            ->leftJoin('goods as g','g.id', '=', 'p.goods_id')
            ->leftJoin('user as u','u.id', '=', 'p.user_id')
            ->leftJoin('order as o','o.id', '=', 'p.order_id')
            ->where([['p.id', $id],['p.user_type',1],['p.status',3]])
            ->select('p.id','p.user_id','p.lottery_show_at','p.unit_price','p.lucky_code','p.buy','p.status','p.periods','p.order_status','p.order_id','p.remark','p.amount','p.goods_id','p.real_amount',
                'g.title','g.icon',
                'u.nickname',
                'o.num'
            )
            ->first();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data ];*/
    }

    /**
     *  编辑订单
     * @param Request $request
     * @return array
     */
    public function edit(Request $request){
        /*$id = intval($request->input('id'));    //订单号
        $order_status = intval($request->input('order_status'));
        $contact_name = $request->input('contact_name');
        $contact_phone = $request->input('contact_phone');
        $contact_id = $request->input('contact_id');
        $contact_no = $request->input('contact_no');
        $amount = $request->input('amount');
        $remark = $request->input('remark');
        $re = null;
        $data = [];

        if(!$id)return ['errcode' => 1001, 'msg' => '请输入订单id！！！'];

        if($order_status)
            $data['order_status'] = $order_status;
        if($contact_name)
            $data['contact_name'] = $contact_name;
        if($contact_phone)
            $data['contact_phone'] = $contact_phone;
        if($contact_id)
            $data['contact_id'] = $contact_id;
        if($contact_no)
            $data['contact_no'] = $contact_no;
        if(is_numeric($amount))
            $data['amount'] = $amount;
        if($remark)
            $data['remark'] = $remark;

        if($data)
            $re = DB::table('periods')->where([['id', $id],['user_type',1],['status',3]])->update($data);

        if($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$id}，机器人订单编辑", 'type' => 3,'ip'=>$request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改完成！', 'data' => $re];
        }else{
            return ['errcode' => 0, 'msg' => '没有数据被修改！' ];
        }*/
    }

}
