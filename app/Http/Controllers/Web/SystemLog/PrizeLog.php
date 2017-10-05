<?php

namespace App\Http\Controllers\Web\SystemLog;

use Illuminate\Http\Request;
use DB;

class PrizeLog extends AbsSystemLog
{
    public $permission = [
        'execute' => 1
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1403']??0;
    }

    /**
     * 充值日志
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $event_id = $request->input('event_id');
        $type = $request->input('type');
        $user_id = $request->input('user_id');
        $remark = $request->input('remark');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');

        $query = DB::table('user_prize as up')
            ->leftJoin('event_prize as ep', 'ep.id', '=', 'up.prize_id')
            ->leftJoin('event as e', 'e.id', '=', 'ep.event_id');

        if ($event_id)
            $query->where('ep.event_id', $event_id);
        if ($type)
            $query->where('ep.type', $type);
        if ($user_id)
            $query->where('up.user_id', $user_id);
        if ($remark)
            $query->where('up.remark', 'like', "%{$remark}%");
        if ($start_time)
            $query->where('up.create_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query->where('up.create_at', '<=', trim($end_time) . ' 23:59:59');

        $total = $query->count();
        $list = $query
            ->select('up.id', 'up.user_id', 'up.create_at', 'up.remark',
                'ep.title', 'ep.type', 'ep.prize',
                'e.title as event_title')
            ->orderBy('up.id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

}
