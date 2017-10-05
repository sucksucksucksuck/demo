<?php

namespace App\Http\Controllers\Web\SystemLog;

use Illuminate\Http\Request;
use DB;

class BuyLog extends AbsSystemLog
{
    public $permission = [
        'execute' => 1,
        'sumAmount' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1401']??0;
    }

    /**
     * 购买日志
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $type = $request->input('type');
        $user_id = $request->input('user_id');
        $order_no = $request->input('order_no');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');

        $query = DB::table('user_amount_log');
        if ($type)
            $query->where('type', $type);
        if ($user_id)
            $query->where('user_id', $user_id);
        if ($order_no)
            $query->where('order_no', 'like', "%{$order_no}%");
        if ($start_time)
            $query->where('create_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query->where('create_at', '<=', trim($end_time) . ' 23:59:59');

        $total = $query->count();
        $list = $query
            ->select('id', 'user_id', 'type', 'amount', 'create_at','order_no','log')
            ->orderBy('id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    /**
     * 购买金额统计
     * @param Request $request
     * @return array
     */
    public function sumAmount(Request $request)
    {
        $type = $request->input('type');
        $user_id = $request->input('user_id');
        $order_no = $request->input('order_no');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');

        $query = DB::table('user_amount_log');
        if ($type)
            $query->where('type', $type);
        if ($user_id)
            $query->where('user_id', $user_id);
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
