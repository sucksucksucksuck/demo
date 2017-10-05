<?php

namespace App\Http\Controllers\Web\Order;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Web\AbsResponse;
use Cache;
use App\Common\Helper;

abstract class AbsOrder extends AbsResponse
{
    /**
     *  夺宝号列表
     */
    public function lucky(Request $request)
    {
        $periods_id = intval($request->input('id'));    //期数订单号
        $order_id = intval($request->input('order_id'));
        $user_id = intval($request->input('user_id'));

        if(!$periods_id && !$order_id && !$user_id)return ['errcode' => 1001, 'msg' => '请输入条件！！！'];

        $where=[];
        if($periods_id)$where[]=['periods_id',$periods_id];
        if($order_id)$where[]=['order_id',$order_id];
        if($user_id)$where[]=['user_id',$user_id];

        $query = DB::table('lucky_code');
        $list = $query
            ->select('lucky_code')
            ->where($where)
            ->forPage($this->page, $this->page_size)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => 0, 'search' => ['page' => $this->page, 'page_size' => $this->page_size ]]];
    }

    /**
     *  解除订单锁定
     */
    public function unlock(Request $request)
    {
        $id = intval($request->input('id'));
        if(!$id)return ['errcode' => 1001, 'msg' => '请输入订单id！！！'];

        Cache::forget('periods_'.$id);

        return ['errcode' => 0, 'msg' => '解锁成功！！！'];
    }

}
