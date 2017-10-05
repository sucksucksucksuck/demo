<?php

namespace App\Http\Controllers\Web\Order;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 *  机器人订单
 */
class Robot extends AbsOrder
{
    public $permission = [
        'execute' => 1
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['206']??0;
    }

    /**
     *  商品期数列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $user_id = $this->forArr($request->input('user_id'));
        $id = $this->forArr($request->input('id'));
        $order_id = $this->forArr($request->input('order_id'));
        $goods_id = $this->forArr($request->input('goods_id'));
        $order_status = intval($request->input('order_status'));
        $category_id = intval($request->input('category_id'));
        $title = trim($request->input('title'));
        $min_price = trim($request->input('min_price'));
        $max_price = trim($request->input('max_price'));
        $sort_field = $request->input('sort_field','p.lottery_show_at');
        $sort = $request->input('sort','desc');
        $periods = $request->input('periods');
        $order_type = $request->input('order_type');

        //$sort_field_arr = array('category'=>'d.title');
        //if( !empty( $sort_field_arr[$sort_field] ) ) $sort_field = $sort_field_arr[$sort_field];

        $query = DB::table('periods as p')
            ->leftJoin('goods as g','g.id', '=', 'p.goods_id')
            ->leftJoin('user as u','u.id', '=', 'p.user_id')
            ->leftJoin('order as o','o.id', '=', 'p.order_id');

        if($user_id)
            $query->whereIn('p.user_id', $user_id);
        if ($id)
            $query->whereIn('p.id', $id);
        if ($order_id)
            $query->whereIn('p.order_id', $order_id);
        if ($goods_id)
            $query->whereIn('p.goods_id',$goods_id);
        if ($order_status)
            $query->where('p.order_status', $order_status);
        if ($category_id)
            $query->where('g.category_id', $category_id);
        if ($title)
            $query->where('g.title', 'like', "%" . $title . "%");
        if ($min_price)
            $query->where('p.amount', '>=',$min_price);
        if ($max_price)
            $query->where('p.amount','<=', $max_price);
        if ($periods)
            $query->where('p.periods', intval($periods));
        if ($order_type)
            $query->where('p.order_type', $order_type);

        $query->where([['p.status',3],['p.user_type',1]]);

        $total = $query->count();
        // id=商品期数订单id，buy=购买数量，periods=期数，unit_price=商品单价，status = ( 1=>未开奖,2=>等待开奖,3=>已开奖，4=>已关闭 )，order_status=(1=>待确认,2=>已确认填写收货地址,3=>已发货,4=>已签收(完成))，amount=商品实际金额
        $list = $query
            ->select('p.id','p.order_id','p.goods_id','p.user_id','p.lottery_show_at','p.unit_price','p.lucky_code','p.buy','p.status','p.periods','p.order_status','p.amount','p.share_id','p.deliver_at','p.real_amount',
                'g.title','g.icon','g.total',
                'u.nickname',
                'o.ip','o.create_at as o_create_at','o.num'
            )
            ->orderBy($sort_field , $sort)
            ->forPage($this->page, $this->page_size)
            ->get();
        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

}
