<?php

namespace App\Http\Controllers\Web\TurntableManage;

use Illuminate\Http\Request;
use DB;

/**
 * 活动展示
 * Class Display
 * @package App\Http\Controllers\Web\EventManage
 */
class Log extends AbsTurntable
{
    public $permission = [
        'execute' => 1,
        'statistics' => 1
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['902']??0;
    }

    /**
     *  活动列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $user_id = $request->input('user_id');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');

        $query = DB::table('user_prize as up')
            ->leftJoin('event_prize as ep','ep.id','=','up.prize_id');

        if ($user_id)
            $query->where('up.user_id', $user_id);
        if ($start_time)
            $query->where('up.create_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query->where('up.create_at', '<=', trim($end_time) . ' 23:59:59');

        $query->whereIn('up.event_id',$this->event);
        $total = $query->count();
        $list = $query
            ->select('up.user_id','up.status','up.create_at',
                'ep.title', 'ep.event_id'
            )
            ->orderBy('up.id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();
        $event_level = array_flip($this->event);
        foreach ($list as $k=>$v){
            $list[$k]->level = $event_level[$v->event_id]+1;
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    /**
     *  统计金额
     * @param Request $request
     * @return array
     */
    public function statistics(Request $request)
    {
        $user_id = $request->input('user_id');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');

        $red_id = DB::table('red')->where([['status',1]])->whereIn('event_id',$this->event)->pluck('id');

        $query = DB::table('user_prize as up')
            ->leftJoin('event_prize as ep','ep.id','=','up.prize_id');
        $query2 = DB::table('user_red as r');
            /*->leftJoin('event_prize as ep','ep.id','=','up.prize_id')
            ->leftJoin('red as r','r.id','=','ep.prize')
            ->leftJoin('user_red as ur','ur.red_id','=','r.id');*/

        if ($user_id) {
            $query->where('up.user_id', $user_id);
            $query2->where('user_id', $user_id);
        }
        if ($start_time) {
            $query->where('up.create_at', '>=', trim($start_time) . ' 00:00:00');
            $query2->where('create_at', '>=', trim($start_time) . ' 00:00:00');
        }
        if ($end_time) {
            $query->where('up.create_at', '<=', trim($end_time) . ' 23:59:59');
            $query2->where('create_at', '<=', trim($end_time) . ' 23:59:59');
        }

        $data['amount'] = $query->where([['ep.type',4]])->whereIn('up.event_id',$this->event)->sum('ep.prize');

        $data['red'] = $query2->whereIn('red_id',$red_id)->sum('amount');

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

}
