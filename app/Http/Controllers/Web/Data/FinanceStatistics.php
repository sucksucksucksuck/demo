<?php

namespace App\Http\Controllers\Web\Data;

use Illuminate\Http\Request;
use DB;
use App\Common\Report;

class FinanceStatistics extends AbsData
{
    public $permission = [
        'execute' => 1
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1003']??0;
    }

    /**
     * 财务统计
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function execute(Request $request)
    {
        $list = [];
        $start_time = $request->input('start_time', date('Y-m-d', time() - 3600 * 24 * 6));
        $end_time = $request->input('end_time', date('Y-m-d'));

        if ($start_time > $end_time) throw new \Exception('开始时间不能大于结束时间！', 1001);

        $query = DB::table('report_system');
        $query->where('date', '>=', trim($start_time));
        $query->where('date', '<=', trim($end_time));
        $data = $query->orderBy('date', 'asc')
            ->get();

        $now = Report::ReportSystem(date('Y-m-d'));
        if ($start_time <= date('Y-m-d') && $end_time >= date('Y-m-d')) {
            $data[] = $now;
        }

        $data2 = [];
        foreach ($data as $v) {
            $key = $v->date??$v['date'];
            $data2[$key] = $v;
        }
        $time = strtotime($start_time);
        $data = [];
        for ($i = 0; $time <= strtotime($end_time); $i++, $time += 3600 * 24) {
            if (isset($data2[date('Y-m-d', $time)])) {
                $data[] = $data2[date('Y-m-d', $time)];
            } else {
                $arr = [];
                foreach ($now as $k=>$v){
                    $arr[$k] = 0;
                }
                $data[] = $arr;
                $data[$i]['date'] = date('Y-m-d', $time);
            }
        }

        foreach ($data as $k => $v) {
            foreach ($v as $k2 => $v2) {
                $list[$k2][$k] = $v2;
            }
        }
        return ['errcode' => 0, 'msg' => 'ok', 'data' => $list];
    }
}
