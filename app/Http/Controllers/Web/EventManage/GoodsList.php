<?php

namespace App\Http\Controllers\Web\EventManage;

use Illuminate\Http\Request;
use DB;

/**
 * 神豪榜
 * Class GoodsList
 * @package App\Http\Controllers\Web\EventManage
 */
class GoodsList extends AbsEventManage
{
    public $permission = [
        'execute' => 1
    ];

    public $event_id = 31;

    protected function getPagePermission()
    {
        return $this->user->permission['710']??0;
    }

    /**
     *  神豪榜列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $periods = intval($request->input('periods',0));
        $i = $periods * 7;
        $start_time = date('Y-m-d', strtotime("-" . ($i + 6) . " day Sunday"));
        $end_time = date('Y-m-d 23:59:59', strtotime("-{$i} day Sunday"));

        $event_user_mod = new \App\Models\Event\User();
        $data = $event_user_mod->getGodsList($start_time, $end_time,50);

        $prize = DB::table('event_prize')->where([['event_id',$this->event_id],['extend','like','%"group": "2"%']])->orderBy('order','asc')->get();
        foreach ($data as $k=>$v){
            $data[$k]->prize = $prize[$k]->title??'';
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows'=>$data]];
    }

    /**
     * 周期列表
     * @param Request $request
     * @return array
     */
    public function getPeriods(Request $request)
    {
        $data =[];
        $time = strtotime("Sunday");

        for ($i=0;$i<25;$i++){
            $data[] = ['title'=>date('Y/m/d',$time-604800*($i)-518400).'-'.date('Y/m/d',$time-604800*$i),'id'=>$i];
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows'=>$data]];
    }

}
