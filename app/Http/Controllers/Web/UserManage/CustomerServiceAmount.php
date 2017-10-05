<?php

namespace App\Http\Controllers\Web\UserManage;

use Illuminate\Http\Request;
use DB;

class CustomerServiceAmount extends AbsUserManage
{
    public $permission = [
        'execute' => 1,
        'sumAmount' => 2,
        'placeholder_1' => 3
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['511']??0;
    }

    /**
     * 购买日志
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $id = $request->input('id');
        $type = $request->input('type');
        $order_no = $request->input('order_no');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');

        if (!$id) {
            throw new \Exception('请输入用户id！！！', 1001);
        }

        $query = DB::table('user_amount_log');
        if ($type)
            $query->where('type', $type);
        if ($order_no)
            $query->where('order_no', 'like', "%{$order_no}%");
        if ($start_time)
            $query->where('create_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query->where('create_at', '<=', trim($end_time) . ' 23:59:59');

        $query->where('user_id', $id);

        $total = $query->count();
        $list = $query
            ->select('id', 'user_id', 'type', 'amount', 'create_at', 'order_no', 'log')
            ->orderBy('id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        $field = ['id', 'nickname', 'residual_amount'];

        $this_val = pow(2, intval($this->permission['placeholder_1']) - 1);
        $val = $this->getPagePermission();
        if ($this->user->permission === null || ($this_val & $val) == $this_val) {
            $field = array_merge($field, ['winning_amount', 'recharge_amount', 'exchange_amount']);
        }

        $user_info = DB::table('user')->select($field)->where('id', $id)->first();
        if (!$user_info) throw new \Exception('用户信息不存在！！！', 2201);

        if ($this->user->permission === null || ($this_val & $val) == $this_val) {
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
     * 购买金额统计
     * @param Request $request
     * @return array
     */
    public function sumAmount(Request $request)
    {
        $id = $request->input('id');
        $type = $request->input('type');
        $order_no = $request->input('order_no');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');

        if (!$id) {
            throw new \Exception('请输入用户id！！！', 1001);
        }

        $query = DB::table('user_amount_log');
        if ($type)
            $query->where('type', $type);
        if ($id)
            $query->where('user_id', $id);
        if ($order_no)
            $query->where('order_no', 'like', "%{$order_no}%");
        if ($start_time)
            $query->where('create_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query->where('create_at', '<=', trim($end_time) . ' 23:59:59');

        $sum_amount = $query->sum('amount');

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $sum_amount];
    }


}
