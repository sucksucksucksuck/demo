<?php

namespace App\Http\Controllers\Web\Order;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 *  所有订单
 */
class All extends AbsOrder
{
    public $permission = [
        'execute' => 1,
        'placeholder_1' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['205']??0;
    }

    /**
     *  商品期数列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $user_info = [];

        $user_id = $request->input('user_id');
        $periods_id = $this->forArr($request->input('periods_id'));
        $order_id = $this->forArr($request->input('order_id'));
        $goods_id = $this->forArr($request->input('goods_id'));
        $order_status = intval($request->input('order_status'));
        $winning = $request->input('winning');
        $category_id = intval($request->input('category_id'));
        $title = trim($request->input('title'));
        $min_price = trim($request->input('min_price'));
        $max_price = trim($request->input('max_price'));
        $sort_field = $request->input('sort_field', 'o.id');
        $sort = $request->input('sort', 'desc');
        $periods = $request->input('periods');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');
        $order_type = $request->input('order_type');
        $contact_name = $request->input('contact_name');
        $user_type = $request->input('user_type', '');
        $order_no = $request->input('order_no');

        $query = DB::table('order as o')
            ->leftJoin('periods as p', 'p.id', '=', 'o.periods_id')
            ->leftJoin('goods as g', 'g.id', '=', 'p.goods_id')
            ->leftJoin('user as u', 'u.id', '=', 'o.user_id');

        if ($user_id)
            $query->where('o.user_id', $user_id);
        if ($order_id)
            $query->whereIn('o.id', $order_id);
        if ($periods_id)
            $query->whereIn('o.periods_id', $periods_id);
        if ($goods_id)
            $query->whereIn('o.goods_id', $goods_id);
        if ($order_status) {
            $winning = 1;
            $query->where('p.order_status', $order_status);
        }
        if ($category_id)
            $query->where('g.category_id', $category_id);
        if ($title)
            $query->where('g.title', 'like', "%" . $title . "%");
        if ($min_price)
            $query->where('p.amount', '>=', $min_price);
        if ($max_price)
            $query->where('p.amount', '<=', $max_price);
        if ($periods)
            $query->where('o.periods', intval($periods));
        if ($start_time)
            $query->where('o.create_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query->where('o.create_at', '<=', trim($end_time) . ' 23:59:59');
        if ($order_type)
            $query->where('p.order_type', $order_type);
        if ($contact_name) {
            $winning = 1;
            $query->where(function ($query) use ($contact_name) {
                $query->where('p.contact_id', 'like', "%{$contact_name}%");
                $query->orWhere(function ($query) use ($contact_name) {
                    $query->where('p.contact_name', 'like', "%{$contact_name}%");
                });
                $query->orWhere(function ($query) use ($contact_name) {
                    $query->where('p.contact_phone', 'like', "%{$contact_name}%");
                });
            });
        }
        if ($user_type !== '')
            $query->where('o.user_type', $user_type);
        if ($order_no)
            $query->where('o.order_no', $order_no);
        if (is_numeric($winning))
            $query->where('o.winning', $winning);

        // id=商品期数订单id，buy=购买数量，periods=期数，unit_price=商品单价，status = ( 1=>未开奖,2=>等待开奖,3=>已开奖，4=>已关闭 )，order_status=(1=>待确认,2=>已确认填写收货地址,3=>已发货,4=>已签收(完成))，amount=商品实际金额
        $list = $query
            ->select('p.id', 'p.lottery_show_at', 'p.unit_price', 'p.lucky_code', 'p.buy', 'p.status', 'p.order_status', 'p.payment_type', 'p.contact_name', 'p.contact_phone', 'p.contact_id', 'p.deliver_at', 'p.amount', 'p.real_amount',
                'g.title', 'g.icon', 'g.total',
                'o.ip', 'o.user_id', 'o.create_at as o_create_at', 'o.num', 'o.id as order_id', 'o.periods', 'o.goods_id', 'o.winning', 'o.order_no',
                'u.nickname'
            )
            ->orderBy($sort_field, $sort)
            ->forPage($this->page, $this->page_size)
            ->get();

        if ($user_id) {
            $this_val = pow(2, intval($this->permission['placeholder_1']) - 1);
            $val = $this->getPagePermission();
            if ($this->user->permission === null || ($this_val & $val) == $this_val) {
                $user_info = DB::table('user')->select('nickname', 'recharge_amount', 'residual_amount', 'winning_amount', 'exchange_amount')->where('id', $user_id)->first()??[];
                if ($user_info) {
                    $user_info->use_amount = $user_info->recharge_amount + $user_info->exchange_amount - $user_info->residual_amount;
                }
            }
        }
        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['user_info' => $user_info, 'rows' => $list, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }
}
