<?php

namespace App\Http\Controllers\Web\UserManage;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Common\Helper;

/**
 *  客服所有订单
 */
class CustomerServiceOrder extends AbsUserManage
{
    public $permission = [
        'execute' => 1,
        'excel' => 2,
        'placeholder_1' => 3,
        'placeholder_2' => 4,
        'placeholder_3' => 5
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['509']??0;
    }

    /**
     *  客服订单列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $user_id = $request->input('user_id');
        $order_id = $request->input('order_id');
        $goods_id = $request->input('goods_id');
        $winning = $request->input('winning');
        $title = $request->input('title');
        $periods = $request->input('periods');
        $periods_id = $request->input('periods_id');
        $category_id = $request->input('category_id');
        $contact_name = $request->input('contact_name');
        $status = $request->input('status');
        $order_status = $request->input('order_status');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');
        $winning_true = 0;

        if (!$user_id) throw new \Exception('请输入用户id', 1001);

        $query = DB::table('order as o')
            ->leftJoin('goods as g', 'g.id', '=', 'o.goods_id')
            ->leftJoin('periods as p', 'p.id', '=', 'o.periods_id');

        $query->where('o.user_id', $user_id);
        if ($order_id)
            $query->where('o.id', $order_id);
        if ($goods_id)
            $query->where('o.goods_id', $goods_id);
        if (is_numeric($winning))
            $query->where('o.winning', $winning);
        if ($title)
            $query->where('g.title', 'like', "%" . $title . "%");
        if ($periods)
            $query->where('p.periods', $periods);
        if ($periods_id)
            $query->where('o.periods_id', $periods_id);
        if ($category_id)
            $query->where('g.category_id', $category_id);
        if ($contact_name) {
            $winning_true = 1;
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
        if ($status) {
            if ($status > 1) {
                $winning_true = 1;
            }
            $query->where('p.status', $status);
        }
        if ($order_status) {
            $winning_true = 1;
            $query->where('p.order_status', $order_status);
        }
        if ($start_time)
            $query->where('o.create_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query->where('o.create_at', '<=', trim($end_time) . ' 23:59:59');
        if ($winning_true)
            $query->where('o.winning', 1);

        $field_2 = ['o.id', 'o.periods_id', 'o.goods_id as o_goods_id', 'o.num', 'o.create_at', 'o.winning',
            'g.title',
            'p.lottery_show_at', 'p.periods', 'p.total', 'p.amount', 'p.order_type'
        ];

        $val = $this->getPagePermission();
        $this_val_2 = pow(2, intval($this->permission['placeholder_2']) - 1);
        if ($this->user->permission === null || ($this_val_2 & $val) == $this_val_2) {
            $field_2 = array_merge($field_2, ['p.order_status', 'p.status']);
        }

        $this_val_3 = pow(2, intval($this->permission['placeholder_3']) - 1);
        if ($this->user->permission === null || ($this_val_3 & $val) == $this_val_3) {
            $field_2 = array_merge($field_2, ['p.contact_name', 'p.contact_id', 'p.contact_phone']);
        }

        $total = $query->count();
        $list = $query
            ->select($field_2)
            ->orderBy('o.id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        $field = ['id', 'nickname', 'residual_amount'];

        $this_val = pow(2, intval($this->permission['placeholder_1']) - 1);
        if ($this->user->permission === null || ($this_val & $val) == $this_val) {
            $field = array_merge($field, ['winning_amount', 'recharge_amount','exchange_amount']);
        }

        $user_info = DB::table('user')->select($field)->where('id', $user_id)->first();
        if ($user_info && ($this->user->permission === null || ($this_val & $val) == $this_val)) {
            $user_info->consumer_amount = $user_info->recharge_amount + $user_info->exchange_amount - $user_info->residual_amount;
            if ($user_info->consumer_amount) {
                $user_info->probability = (float)number_format(abs($user_info->winning_amount / $user_info->consumer_amount) * 100, 2, '.', '');
            } else if ($user_info->winning_amount) {
                $user_info->probability = 100;
            } else {
                $user_info->probability = 0;
            }
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['user_info' => $user_info, 'rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
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
            $user_id = $request->input('user_id');
            $order_id = $request->input('order_id');
            $winning = $request->input('winning');
            $title = $request->input('title');
            $periods_id = $request->input('periods_id');
            $category_id = $request->input('category_id');
            $contact_name = $request->input('contact_name');
            $status = $request->input('status');
            $order_status = $request->input('order_status');
            $start_time = $request->input('start_time');
            $end_time = $request->input('end_time');

            if (!$user_id) throw new \Exception('请输入用户id', 1001);

            $query = DB::table('order as o')
                ->leftJoin('goods as g', 'g.id', '=', 'o.goods_id')
                ->leftJoin('periods as p', 'p.id', '=', 'o.periods_id')
                ->leftJoin('admin as a', 'a.id', '=', 'p.admin_id');

            $query->where('o.user_id', $user_id);
            if ($order_id)
                $query->whereIn('o.id', $order_id);
            if ($title)
                $query->where('g.title', 'like', "%" . $title . "%");
            if ($periods_id)
                $query->where('o.periods_id', $periods_id);
            if ($category_id)
                $query->where('g.category_id', $category_id);
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
            if ($status) {
                if ($status > 1) {
                    $winning = 1;
                }
                $query->where('p.status', $status);
            }
            if ($order_status) {
                $winning = 1;
                $query->where('p.order_status', $order_status);
            }
            if ($start_time)
                $query->where('o.create_at', '>=', trim($start_time) . ' 00:00:00');
            if ($end_time)
                $query->where('o.create_at', '<=', trim($end_time) . ' 23:59:59');
            if (is_numeric($winning))
                $query->where('o.winning', $winning);

            $list = $query
                ->select('o.id', 'o.periods_id', 'o.goods_id as o_goods_id', 'o.num', 'o.create_at', 'o.winning', 'o.user_id',
                    'g.title',
                    'p.lottery_show_at', 'p.periods', 'p.total', 'p.amount', 'p.contact_name', 'p.contact_id', 'p.contact_phone', 'p.status', 'p.order_status', 'p.order_type', 'p.payment_type',
                    'truename'
                )
                ->orderBy('o.id', 'desc')
                ->limit(10000)
                ->get();
            $payment_type1 = ['手动打款', '兑吧打款', '拒绝打款', '成功打款','异常订单'];
            $payment_type2 = ['手动发货', '-', '拒绝发货', '成功发货','异常订单'];
            $order_status_info = ['获得奖品-待确认', '订单确认', '盘古发货', '已签收', '夺宝完成'];
            $data = array(array('订单编号', '用户ID', '商品名称', '商品ID', '期数', '期数ID', '购买次数', '总需次数', '商品原价', '购买时间', '开奖时间', '开奖结果', '订单状态', '支付宝姓名', '支付宝账号', '收货人姓名', '联系方式', '收货地址', '操作状态', '操作人'));
            foreach ($list as $k => $v) {
                $arr['id'] = $v->id;
                $arr['user_id'] = $v->user_id;
                $arr['title'] = $v->title;
                $arr['o_goods_id'] = $v->o_goods_id;
                $arr['periods'] = $v->periods;
                $arr['periods_id'] = $v->periods_id;
                $arr['num'] = $v->num;
                $arr['total'] = $v->total;
                $arr['amount'] = $v->amount;
                $arr['create_at'] = $v->create_at;
                $arr['lottery_show_at'] = $v->lottery_show_at;
                $arr['winning'] = $v->winning == 1 ? '已中奖' : '未中奖';
                $arr['order_status'] = $v->winning == 1 && !empty($order_status_info[$v->order_status - 1]) ? $order_status_info[$v->order_status - 1] : '-';
                if ($v->order_type == 1) {
                    $arr['a'] = empty($v->contact_name) ? '-' : $v->contact_name;
                    $arr['b'] = empty($v->contact_id) ? '-' : $v->contact_id;
                    $arr['c'] = '-';
                    $arr['d'] = '-';
                    $arr['e'] = '-';
                    $arr['payment_type'] = $payment_type1[$v->payment_type - 1]??'-';
                } else if ($v->order_type == 2) {
                    $arr['a'] = '-';
                    $arr['b'] = '-';
                    $arr['c'] = empty($v->contact_name) ? '-' : $v->contact_name;
                    $arr['d'] = empty($v->contact_phone) ? '-' : $v->contact_phone;
                    $arr['e'] = empty($v->contact_id) ? '-' : $v->contact_id;
                    $arr['payment_type'] = $payment_type2[$v->payment_type - 1]??'-';
                } else {
                    $arr['a'] = '-';
                    $arr['b'] = '-';
                    $arr['c'] = '-';
                    $arr['d'] = '-';
                    $arr['e'] = '-';
                    $arr['payment_type'] = '-';
                }
                $arr['truename'] = ($v->winning == 0 || empty($v->truename)) ? '-' : $v->truename;
                $data[] = $arr;
            }
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "客服管理，客服所有订单导出", 'type' => 5, 'ip' => $request->getClientIp()]);
            Helper::excelOutput($data, 'order_' . date('Y-m-d', time()) . '.xlsx');
        } catch (\Exception $e) {
            \Cache::forget('excel');
            throw $e;
        }
    }
}
