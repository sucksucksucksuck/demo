<?php

namespace App\Http\Controllers\Web\TurntableManage;

use Illuminate\Http\Request;
use DB;

/**
 * 每日转盘统计
 * Class Display
 * @package App\Http\Controllers\Web\EventManage
 */
class DayStatistics extends AbsTurntable
{
    public $permission = [
        'execute' => 1
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['903']??0;
    }

    /**
     *  统计
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');

        $event_id_arr = implode(',',$this->event);
        $prefix = DB::getTablePrefix();
        $query = DB::table('user_prize as up')
            ->leftJoin('event_prize as ep','ep.id','=','up.prize_id')
            ->leftJoin('red as r','r.id','=','ep.prize')
            ->leftJoin('user as u','u.id','=','up.user_id');

        if ($start_time)
            $query->whereRaw("{$prefix}up.create_at >= '".trim($start_time) . ' 00:00:00'."'");
        if ($end_time)
            $query->whereRaw("{$prefix}up.create_at <= '".trim($end_time) . ' 23:59:59'."'");

        $sql = $query->whereRaw("{$prefix}u.type = 0 and {$prefix}up.event_id in ({$event_id_arr})")
            ->select(DB::RAW("FROM_UNIXTIME(UNIX_TIMESTAMP({$prefix}up.create_at),'%Y-%m-%d') as date,
            count({$prefix}up.id) as count,
            sum(if({$prefix}ep.type=3&&{$prefix}up.status=1,1,0)) as real_red_count,
            sum(if({$prefix}ep.type=3&&{$prefix}up.status=1,{$prefix}r.max_amount,0)) as real_red_amount,
            sum(if({$prefix}ep.type=4&&{$prefix}up.status=1,{$prefix}ep.prize,0)) as real_amount
            "))->groupBy('date')->toSql();

        $query2 = DB::table(DB::raw("({$sql}) as {$prefix}up2"));

        $total = $query2->count();
        $list = $query2->orderBy('date', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list??1, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

}
