<?php

namespace App\Http\Controllers\Web\Order;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Common\Helper;

/**
 *  本期所有订单
 */
class CurrentOrder extends AbsOrder
{
    public $permission = [
        'execute' => 1,
        'excel' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['216']??0;
    }

    /**
     *  本期所有订单列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $user_id = $this->forArr($request->input('user_id'));
        $user_type = $request->input('user_type');
        $periods_id = $request->input('periods_id');
        $order_id = $this->forArr($request->input('order_id'));
        $sort_field = $request->input('sort_field', 'o.id');
        $sort = $request->input('sort', 'desc');

        if (!$periods_id) throw new \Exception('请输入期数id', 1001);

        $query = DB::table('order as o')
            ->leftJoin('periods as p', 'p.id', '=', 'o.periods_id')
            ->leftJoin('user as u', 'u.id', '=', 'o.user_id');

        if ($user_id)
            $query->whereIn('o.user_id', $user_id);
        if (is_numeric($user_type))
            $query->where('o.user_type', $user_type);
        if ($order_id)
            $query->whereIn('o.id', $order_id);

        $query->where('o.periods_id', $periods_id);

        $total = $query->count();
        $list = $query
            ->select('p.contact_name', 'p.contact_phone', 'p.contact_id', 'p.order_status', 'p.status', 'p.order_type',
                'o.ip', 'o.user_id', 'o.create_at as o_create_at', 'o.num', 'o.id as order_id', 'o.periods', 'o.goods_id', 'o.winning', 'o.user_type',
                'u.nickname'
            )
            ->orderBy($sort_field, $sort)
            ->forPage($this->page, $this->page_size)
            ->get();

        $goods = DB::table('periods as p')
            ->leftJoin('goods as g', 'p.goods_id', '=', 'g.id')
            ->select('p.id as periods_id', 'p.goods_id', 'p.total', 'p.periods', 'p.unit_price', 'p.lottery_show_at', 'p.order_status', 'p.status',
                'g.title', 'g.icon')
            ->where('p.id', $periods_id)
            ->first();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['goods' => $goods, 'rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
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
            $order_status_info = [];
            $user_id = $this->forArr($request->input('user_id'));
            $user_type = $request->input('user_type');
            $periods_id = $request->input('periods_id');
            $order_id = $this->forArr($request->input('order_id'));

            if (!$periods_id) throw new \Exception('请输入期数id', 1001);

            $query = DB::table('order as o')
                ->leftJoin('periods as p', 'p.id', '=', 'o.periods_id')
                ->leftJoin('goods as g', 'g.id', '=', 'p.goods_id')
                ->leftJoin('user as u', 'u.id', '=', 'o.user_id')
                ->leftJoin('admin as a', 'a.id', '=', 'p.admin_id');

            if ($user_id)
                $query->whereIn('o.user_id', $user_id);
            if (is_numeric($user_type))
                $query->where('o.user_type', $user_type);
            if ($order_id)
                $query->whereIn('o.id', $order_id);
            if ($periods_id)
                $query->where('o.periods_id', $periods_id);

            $list = $query
                ->select('p.id', 'p.order_id', 'p.goods_id', 'p.user_id', 'p.lottery_show_at', 'p.unit_price', 'p.lucky_code', 'p.buy', 'p.status', 'p.periods', 'p.order_status', 'p.real_amount', 'p.contact_name', 'p.contact_id', 'p.contact_phone', 'p.order_id', 'p.payment_channel', 'p.payment_no', 'p.payment_fee', 'p.payment_bank', 'p.deliver_at', 'p.payment_type',
                    'g.title', 'g.icon', 'g.amount as g_amount',
                    'u.nickname',
                    'o.id as o_id', 'o.create_at', 'o.num', 'o.amount as o_amount', 'o.winning',
                    'a.truename'
                )
                ->orderBy('p.id', 'desc')
                ->limit(10000)
                ->get();
            $order_type = DB::table('periods')->where('id', $periods_id)->value('order_type');

            if ($order_type == 1) {
                $type_info = ['支付宝姓名', '支付宝账号', '手续费', '支付宝流水号', '打款支付宝尾号', '打款银行卡尾号', '操作人', '打款状态'];
                $order_status_info = ['获得奖品-待确认', '订单确认', '盘古发货', '已签收', '夺宝完成'];
                $payment_type = ['手动打款', '兑吧打款', '拒绝打款', '成功打款','异常订单'];
            } else if ($order_type == 2) {
                $type_info = ['收货人姓名', '联系方式', '收货地址', '快递公司', '快递单号', '操作人', '打款状态'];
                $order_status_info = ['获得奖品-待确认', '订单确认', '盘古发货', '已签收', '夺宝完成'];
                $payment_type = ['手动发货', '-', '拒绝发货', '成功发货','异常订单'];
            } else {
                $type_info = [];
            }
            $data = array(array('订单编号', '期数ID', '商品ID', '商品名称', '期数', '用户id', '开奖时间', '购买时间', '发货时间', '购买人次', '实付金额', '商品金额', '实际发货金额', '订单状态'));
            $data[0] = array_merge($data[0], $type_info);
            foreach ($list as $k => $v) {
                $arr['o_id'] = $v->o_id;
                $arr['id'] = $v->id;
                $arr['goods_id'] = $v->goods_id;
                $arr['title'] = $v->title;
                $arr['periods'] = $v->periods;
                $arr['user_id'] = $v->user_id;
                $arr['lottery_show_at'] = $v->lottery_show_at??'-';
                $arr['create_at'] = $v->create_at;
                $arr['deliver_at'] = $v->deliver_at??'-';
                $arr['num'] = $v->num;
                $arr['o_amount'] = $v->o_amount;
                $arr['g_amount'] = $v->g_amount;
                $arr['real_amount'] = $v->real_amount??'-';
                $arr['order_status'] = $v->winning == 0 ? '未中奖' : $order_status_info[$v->order_status - 1]??'获得奖品-待确认';
                if ($order_type == 1) {
                    $arr['contact_name'] = $v->winning == 0 || empty($v->contact_name) ? '-' : $v->contact_name;
                    $arr['contact_id'] = $v->winning == 0 || empty($v->contact_id) ? '-' : $v->contact_id;
                    $arr['payment_fee'] = $v->winning == 0 || empty($v->payment_fee) ? '-' : $v->payment_fee;
                    $arr['payment_no'] = $v->winning == 0 || empty($v->payment_no) ? '-' : $v->payment_no;
                    $arr['payment_channel'] = $v->winning == 0 || empty($v->payment_channel) ? '-' : $v->payment_channel;
                    $arr['payment_bank'] = $v->winning == 0 || empty($v->payment_bank) ? '-' : $v->payment_bank;
                    $arr['truename'] = $v->winning == 0 || empty($v->truename) ? '-' : $v->truename;
                    $arr['payment_type'] = $v->winning == 0 || empty($payment_type[$v->payment_type - 1]) ? '-' : $payment_type[$v->payment_type - 1];
                } else if ($order_type == 2) {
                    $arr['contact_name'] = $v->winning == 0 || empty($v->contact_name) ? '-' : $v->contact_name;
                    $arr['contact_phone'] = $v->winning == 0 || empty($v->contact_phone) ? '-' : $v->contact_phone;
                    $arr['contact_id'] = $v->winning == 0 || empty($v->contact_id) ? '-' : $v->contact_id;
                    $arr['payment_channel'] = $v->winning == 0 || empty($v->payment_channel) ? '-' : $v->payment_channel;
                    $arr['payment_no'] = $v->winning == 0 || empty($v->payment_no) ? '-' : $v->payment_no;
                    $arr['truename'] = $v->winning == 0 || empty($v->truename) ? '-' : $v->truename;
                    $arr['payment_type'] = $v->winning == 0 || empty($payment_type[$v->payment_type - 1]) ? '-' : $payment_type[$v->payment_type - 1];
                }
                $data[] = $arr;
            }
            unset($list);
            unset($query);
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "本期所有订单导出", 'type' => 5, 'ip' => $request->getClientIp()]);
            Helper::excelOutput($data, 'order_' . date('Y-m-d', time()) . '.xlsx');
        } catch (\Exception $e) {
            \Cache::forget('excel');
            throw $e;
        }
    }

}
