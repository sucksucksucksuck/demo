<?php

namespace App\Http\Controllers\Web\SystemLog;

use Illuminate\Http\Request;
use DB;

class PayLog extends AbsSystemLog
{
    public $permission = [
        'execute' => 1,
        'sumAmount' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1402']??0;
    }

    /**
     * 充值日志
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $type = $request->input('type');
        $user_id = $request->input('user_id');
        $pay_no = $request->input('pay_no');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');
        $order_no = $request->input('order_no');

        $query = DB::table('pay_log');
        if ($type)
            $query->where('type', $type);
        if ($user_id)
            $query->where('user_id', $user_id);
        if ($pay_no)
            $query->where('pay_no', 'like', "%{$pay_no}%");
        if ($start_time)
            $query->where('create_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query->where('create_at', '<=', trim($end_time) . ' 23:59:59');
        if ($order_no)
            $query->where('order_no', $order_no);

        $total = $query->count();
        $list = $query
            ->select('id', 'user_id', 'type', 'amount', 'create_at','pay_no','order_no')
            ->orderBy('id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    /**
     * 充值金额统计
     * @param Request $request
     * @return array
     */
    public function sumAmount(Request $request)
    {
        $type = $request->input('type');
        $user_id = $request->input('user_id');
        $pay_no = $request->input('pay_no');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');
        $order_no = $request->input('order_no');

        $query = DB::table('pay_log');
        if ($type)
            $query->where('type', $type);
        if ($user_id)
            $query->where('user_id', $user_id);
        if ($pay_no)
            $query->where('pay_no', 'like', "%{$pay_no}%");
        if ($start_time)
            $query->where('create_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query->where('create_at', '<=', trim($end_time) . ' 23:59:59');
        if ($order_no)
            $query->where('order_no', $order_no);

        $sum_amount = $query->sum('amount');

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $sum_amount];
    }
}
