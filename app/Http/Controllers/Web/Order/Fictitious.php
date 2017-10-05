<?php

namespace App\Http\Controllers\Web\Order;

use App\Common\Helper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 *  虚拟订单
 */
class Fictitious extends AbsOrder
{
    public $permission = [
        'execute' => 1,
        'excel' => 2,
        'complete' => 3,
        'orderStatus' => 4
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['203']??0;
    }

    /**
     *  商品期数列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $order_id_arr = [];
        $order_list2 = [];

        $user_id = $this->forArr($request->input('user_id'));
        $id = $this->forArr($request->input('id'));
        $order_id = $this->forArr($request->input('order_id'));
        $goods_id = $this->forArr($request->input('goods_id'));
        $order_status = intval($request->input('order_status'));
        $category_id = intval($request->input('category_id'));
        $title = trim($request->input('title'));
        $min_price = trim($request->input('min_price'));
        $max_price = trim($request->input('max_price'));
        $sort_field = $request->input('sort_field', 'p.lottery_show_at');
        $sort = $request->input('sort', 'desc');
        $periods = $request->input('periods');
        $contact_name = $request->input('contact_name');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');
        $goods_type = $request->input('goods_type');
        $payment_type = $request->input('payment_type');

        $query = DB::table('periods as p')
            ->leftJoin('goods as g', 'g.id', '=', 'p.goods_id')
            ->leftJoin('user as u', 'u.id', '=', 'p.user_id');

        if ($user_id)
            $query->whereIn('p.user_id', $user_id);
        if ($id)
            $query->whereIn('p.id', $id);
        if ($order_id)
            $query->whereIn('p.order_id', $order_id);
        if ($goods_id)
            $query->whereIn('p.goods_id', $goods_id);
        if ($order_status)
            $query->where('p.order_status', $order_status);
        if ($category_id)
            $query->where('g.category_id', $category_id);
        if ($title)
            $query->where('g.title', 'like', "%" . $title . "%");
        if ($min_price)
            $query->where('p.amount', '>=', $min_price);
        if ($max_price)
            $query->where('p.amount', '<=', $max_price);
        if ($periods)
            $query->where('p.periods', intval($periods));
        if ($contact_name)
            $query->where(function ($query) use ($contact_name) {
                $query->where('p.contact_id', 'like', "%{$contact_name}%");
                $query->orWhere(function ($query) use ($contact_name) {
                    $query->where('p.contact_name', 'like', "%{$contact_name}%");
                });
            });
        if ($start_time)
            $query->where('p.lottery_show_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query->where('p.lottery_show_at', '<=', trim($end_time) . ' 23:59:59');
        if (is_numeric($goods_type))
            $query->where('p.goods_type', $goods_type == 0 ? '=' : '>', 0);
        if ($payment_type)
            $query->where('p.payment_type', $payment_type);

        $query->where([['p.order_type', 1], ['p.status', 3], ['p.user_type', '=', 0], ['p.order_status', '>', 1], ['p.order_status', '!=', 6]]);
        $query->where(function ($query){
            $query->whereNotIn('p.amount', config('dui_ba.amount'));
            $query->orWhere(function ($query){
                $query->whereIn('p.amount', config('dui_ba.amount'))->where('goods_type',0);
            });
        });

        $total = $query->count();
        // id=商品期数订单id，buy=购买数量，periods=期数，unit_price=商品单价，status = ( 1=>未开奖,2=>等待开奖,3=>已开奖，4=>已关闭 )，order_status=(1=>待确认,2=>已确认填写收货地址,3=>已发货,4=>已签收(完成))，amount=商品实际金额
        $list = $query
            ->select('p.id', 'p.order_id', 'p.goods_id', 'p.user_id', 'p.lottery_show_at', 'p.unit_price', 'p.lucky_code', 'p.buy', 'p.status', 'p.periods', 'p.order_status', 'p.amount', 'p.contact_name', 'p.contact_id', 'p.payment_type', 'p.deliver_at', 'p.real_amount','p.confirm_at',
                'g.title', 'g.icon', 'g.total',
                'u.nickname'//,
            //'o.ip','o.create_at as o_create_at','o.num'
            )
            ->orderBy($sort_field, $sort)
            ->forPage($this->page, $this->page_size)
            ->get();

        //获取关联数据
        foreach ($list as $k => $v) {
            $order_id_arr[] = $v->order_id;
        }
        $order_list = DB::table('order')->select('id', 'ip', 'create_at as o_create_at', 'num')->whereIn('id', $order_id_arr)->get();
        foreach ($order_list as $k => $v) {
            $order_list2[$v->id] = $v;
        }
        foreach ($list as $k => $v) {
            $list[$k]->ip = $order_list2[$v->order_id]->ip??'';
            $list[$k]->o_create_at = $order_list2[$v->order_id]->o_create_at??'';
            $list[$k]->num = $order_list2[$v->order_id]->num??0;
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    /**
     *  导出表格
     * @param Request $request
     * @return void
     */
    public function excel(Request $request)
    {
        Helper::excelUnlock($this);
        try {
            $user_id = $this->forArr($request->input('user_id'));
            $id = $this->forArr($request->input('id'));
            $order_id = $this->forArr($request->input('order_id'));
            $goods_id = $this->forArr($request->input('goods_id'));
            $order_status = intval($request->input('order_status'));
            $category_id = intval($request->input('category_id'));
            $title = trim($request->input('title'));
            $min_price = trim($request->input('min_price'));
            $max_price = trim($request->input('max_price'));
            $start_time = $request->input('start_time');
            $end_time = $request->input('end_time');
            $deliver_start_time = $request->input('deliver_start_time');
            $deliver_end_time = $request->input('deliver_end_time');
            $periods = $request->input('periods');
            $admin_id = $request->input('admin_id');
            $goods_type = $request->input('goods_type');

            $query = DB::table('periods as p')
                ->leftJoin('goods as g', 'g.id', '=', 'p.goods_id')
                ->leftJoin('user as u', 'u.id', '=', 'p.user_id')
                ->leftJoin('order as o', 'o.id', '=', 'p.order_id')
                ->leftJoin('admin as a', 'a.id', '=', 'p.admin_id');

            if ($user_id)
                $query->whereIn('p.user_id', $user_id);
            if ($order_id)
                $query->whereIn('p.order_id', $order_id);
            if ($id)
                $query->whereIn('p.id', $id);
            if ($goods_id)
                $query->whereIn('p.goods_id', $goods_id);
            if ($order_status)
                $query->where('p.order_status', $order_status);
            if ($category_id)
                $query->where('g.category_id', $category_id);
            if ($title)
                $query->where('g.title', 'like', "%" . $title . "%");
            if ($min_price)
                $query->where('p.amount', '>=', $min_price);
            if ($max_price)
                $query->where('p.amount', '<=', $max_price);
            if ($start_time)
                $query->where('p.lottery_show_at', '>=', trim($start_time) . ' 00:00:00');
            if ($end_time)
                $query->where('p.lottery_show_at', '<=', trim($end_time) . ' 23:59:59');
            if ($deliver_start_time)
                $query->where('p.deliver_at', '>=', trim($deliver_start_time) . ' 00:00:00');
            if ($deliver_end_time)
                $query->where('p.deliver_at', '<=', trim($deliver_end_time) . ' 23:59:59');
            if ($periods)
                $query->where('p.periods', intval($periods));
            if ($admin_id)
                $query->where('p.admin_id', intval($admin_id));
            if (is_numeric($goods_type))
                $query->where('p.goods_type', $goods_type == 0 ? '=' : '>', 0);

            $query->where([['p.order_type', 1], ['p.status', 3], ['p.user_type', '=', 0], ['p.order_status', '>', 1], ['p.order_status', '!=', 6]]);
            $query->where(function ($query){
                $query->whereNotIn('p.amount', config('dui_ba.amount'));
                $query->orWhere(function ($query){
                    $query->whereIn('p.amount', config('dui_ba.amount'))->where('goods_type',0);
                });
            });

            // id=商品期数订单id，buy=购买数量，periods=期数，unit_price=商品单价，status = ( 1=>未开奖,2=>等待开奖,3=>已开奖，4=>已关闭 )，order_status=(1=>待确认,2=>已确认填写收货地址,3=>已发货,4=>已签收(完成))
            $list = $query
                ->select('p.id', 'p.order_id', 'p.goods_id', 'p.user_id', 'p.lottery_show_at', 'p.unit_price', 'p.lucky_code', 'p.buy', 'p.status', 'p.periods', 'p.order_status', 'p.real_amount', 'p.contact_name', 'p.contact_phone', 'p.order_id', 'p.payment_channel', 'p.payment_no', 'p.contact_id', 'p.payment_fee', 'p.payment_bank', 'p.confirm_at', 'p.deliver_at', 'p.payment_type',
                    'g.title', 'g.icon', 'g.amount as g_amount',
                    'u.nickname',
                    'o.create_at', 'o.num', 'o.amount as o_amount',
                    'a.truename'
                )
                ->orderBy('p.id', 'desc')
                ->limit(10000)
                ->get();
            $payment_type = ['手动打款', '兑吧审核', '拒绝打款', '成功打款','异常订单'];
            $order_status_info = ['获得奖品-待确认', '订单确认', '盘古发货', '已签收', '夺宝完成'];
            $data = array(array('订单编号', '用户ID', '期数ID', '商品ID', '商品名称', '期数', '购买时间', '开奖时间','确认时间', '发货时间', '购买人次', '实付金额', '商品金额', '实际发货金额', '支付宝姓名', '支付宝账号', '手续费', '打款支付宝尾号', '打款银行卡尾号', '支付宝流水号', '订单状态', '打款状态', '操作人'));
            foreach ($list as $k => $v) {
                $arr['order_id'] = $v->order_id;
                $arr['user_id'] = $v->user_id;
                $arr['id'] = $v->id;
                $arr['goods_id'] = $v->goods_id;
                $arr['title'] = $v->title;
                $arr['periods'] = $v->periods;
                $arr['create_at'] = $v->create_at;
                $arr['lottery_show_at'] = $v->lottery_show_at??'-';
                $arr['confirm_at'] = $v->confirm_at??'-';
                $arr['deliver_at'] = $v->deliver_at??'-';
                $arr['num'] = $v->num;
                $arr['o_amount'] = $v->o_amount;
                $arr['g_amount'] = $v->g_amount;
                $arr['real_amount'] = $v->real_amount??'-';
                $arr['contact_name'] = empty($v->contact_name) ? '-' : $v->contact_name;
                $arr['contact_id'] = empty($v->contact_id) ? '-' : $v->contact_id;
                $arr['payment_fee'] = empty($v->payment_fee) ? '-' : $v->payment_fee;
                $arr['payment_channel'] = empty($v->payment_channel) ? '-' : $v->payment_channel;
                $arr['payment_bank'] = empty($v->payment_bank) ? '-' : $v->payment_bank;
                $arr['payment_no'] = empty($v->payment_no) ? '-' : $v->payment_no;
                $arr['order_status'] = $order_status_info[$v->order_status - 1]??'-';
                $arr['payment_type'] = $payment_type[$v->payment_type - 1]??'-';
                $arr['truename'] = empty($v->truename) ? '-' : $v->truename;
                $data[] = $arr;
            }
            unset($list);
            unset($query);
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "虚拟订单导出", 'type' => 5, 'ip' => $request->getClientIp()]);
            Helper::excelOutput($data, 'order_' . date('Y-m-d', time()) . '.xlsx');
        } catch (\Exception $e) {
            \Cache::forget('excel');
            throw $e;
        }
    }

    /**
     *  夺宝完成
     * @param Request $request
     * @return array
     */
    public function complete(Request $request)
    {
        $id = $this->forArr($request->input('id'));

        if (!$id) return ['errcode' => 1001, 'msg' => '请输入id！'];

        $data['order_status'] = 5;

        $re = DB::table('periods')->where([['order_type', 1], ['status', 3], ['user_type', '=', 0]])
            ->where(function ($query){
                $query->whereNotIn('amount', config('dui_ba.amount'));
                $query->orWhere(function ($query){
                    $query->whereIn('amount', config('dui_ba.amount'))->where('goods_type',0);
                });
            })
            ->whereIn('id', $id)->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：" . json_encode($id) . "，虚拟订单，夺宝完成", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '操作完成', 'data' => $re];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改', 'data' => ''];
        }
    }

    /**
     * 修改订单状态
     * @param Request $request
     * @return array
     */
    public function orderStatus(Request $request)
    {
        $id = $this->forArr($request->input('id'));
        $order_status = $request->input('order_status');

        if (!$id || !$order_status) return ['errcode' => 1001, 'msg' => '请输入id或状态！'];

        $data['order_status'] = $order_status;
        if(in_array($order_status,[1,2])){
            $data['payment_type'] = 1;
        }

        $re = DB::table('periods')->where([['order_type', 1], ['status', 3], ['user_type', '=', 0]])
            ->where(function ($query){
                $query->whereNotIn('amount', config('dui_ba.amount'));
                $query->orWhere(function ($query){
                    $query->whereIn('amount', config('dui_ba.amount'))->where('goods_type',0);
                });
            })
            ->whereIn('id', $id)->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：" . json_encode($id) . "，虚拟订单，修改订单状态" . $data['order_status'], 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '操作成功', 'data' => $re];
        } else {
            return ['errcode' => 1002, 'msg' => '没有修改'];
        }
    }
}
