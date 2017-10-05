<?php

namespace App\Http\Controllers\Web\TurntableManage;

use Illuminate\Http\Request;
use DB;

/**
 * 转盘等级统计
 * Class LevelStatistics
 * @package App\Http\Controllers\Web\TurntableManage
 */
class LevelStatistics extends AbsTurntable
{
    public $permission = [
        'execute' => 1
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['904']??0;
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
        $date_type = $request->input('date_type','1');

        $event_id_arr = implode(',',$this->event);
        $prefix = DB::getTablePrefix();
        $query = DB::table('user_prize as ue')
            ->leftJoin('event_prize as ep','ep.id','=','ue.prize_id')
            ->leftJoin('user as u','u.id','=','ue.user_id');

        $t = date('t');
        if ($start_time)
            $query->whereRaw("{$prefix}ue.create_at >= '".trim($start_time) . ($date_type == 1?" 00:00:00'":"-01 00:00:00'"));
        if ($end_time)
            $query->whereRaw("{$prefix}ue.create_at <= '".trim($end_time) . ($date_type == 1?" 23:59:59'":"-{$t} 23:59:59'"));

        $sql = '';
        foreach ($this->event as $k=>$v){
            $sql.=",sum(if({$prefix}ue.event_id={$v},1,0)) as level_".($k+1);
        }

        $date = $date_type==1?'%Y-%m-%d':'%Y-%m';
        $sql = $query->whereRaw("{$prefix}u.type = 0 and {$prefix}ue.event_id in ({$event_id_arr})")
            ->select(DB::RAW("FROM_UNIXTIME(UNIX_TIMESTAMP({$prefix}ue.create_at),'{$date}') as date{$sql}"))->groupBy('date')->toSql();

        $query2 = DB::table(DB::raw("({$sql}) as {$prefix}ue2"));

        $total = $query2->count();
        $list = $query2->orderBy('date', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list??1, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

}
