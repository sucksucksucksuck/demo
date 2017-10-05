<?php

namespace App\Http\Controllers\Web\Data;

use Illuminate\Http\Request;
use DB;
use App\Common\Report;

class DataProfile extends AbsData
{
    public $permission = [
        'execute' => 1
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1001']??0;
    }

    /**
     *  数据概况
     * @param Request $request
     * @return array
     */
    public function execute(Request $request){
        $data[] = Report::ReportSystem(date('Y-m-d'));
        $data[] = DB::table('report_system')->where('date',date('Y-m-d',time()-3600*24))->first()??[];
        if(empty($data[1])){
            $data[1] = Report::ReportSystem(date('Y-m-d',time()-3600*24));
        }
        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }
}
