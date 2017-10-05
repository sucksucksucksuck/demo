<?php

namespace App\Http\Controllers\Web\Data;

use Illuminate\Http\Request;
use DB;
use App\Common\Helper;

class MonthUser extends AbsData
{
    public $permission = [
        'execute' => 1,
        'excel' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1004']??0;
    }

    /**
     *  数据概况
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $list2 = [];
        $data = [];
        $time = date('d') == '01' ? strtotime('-1 month') : time();
        $day = range(1, date('t',$time));
        $y_m = date('Y-m',$time);

        $list = DB::table('report_user_amount_log as rual')
            ->leftJoin('user as u', 'u.id', '=', 'rual.user_id')
            ->select('rual.*')
            ->where([['rual.date', '>=', $y_m], ['rual.date', '<=', date('Y-m-t',$time)], ['u.type', 0]])
            ->orderBy('rual.date','desc')
            ->limit(500000)
            ->get();

        foreach ($list as $k=>$v) {
            $list2[(string)$v->user_id][$v->date] = get_object_vars($v);
            unset($list[$k]);
        }
        unset($list);
        foreach ($list2 as $k => $v) {
            $arr = [(string)$k];
            foreach ($day as $v2) {
                $v2 = $y_m .($v2 < 10 ? '-0' . $v2 : '-' . $v2);
                if (!isset($list2[$k][$v2])) {
                    $list2[$k][$v2] = ["recharge_amount" => "0", "consumer_amount" => "0", "winning_amount" => "0"];
                }
            }
            ksort($list2[$k]);
            foreach ($list2[$k] as $v3) {
                $arr[] = $v3['recharge_amount'];
                $arr[] = $v3['consumer_amount'];
                $arr[] = $v3['winning_amount'];
            }
            $data[] = $arr;
            unset($list2[$k]);
        }
        unset($list2);

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['data' => $data, 'date' => date('Y-m',$time)]];
    }

    /**
     *  本月用户概况统计导出
     * @param Request $request
     * @return array
     */
    public function excel(Request $request)
    {
        Helper::excelUnlock($this);
        try {
            $list2 = [];
            $time = date('d') == '01' ? strtotime('-1 month') : time();
            $day = range(1, date('t',$time));
            $y_m = date('Y-m',$time);

            $list = DB::table('report_user_amount_log as rual')
                ->leftJoin('user as u', 'u.id', '=', 'rual.user_id')
                ->select('rual.*')
                ->where([['rual.date', '>=', $y_m], ['rual.date', '<=', date('Y-m-t',$time)], ['u.type', 0]])
                ->limit(50000)
                ->get();

            $data = [['用户ID'], ['']];
            foreach ($day as $v) {
                $v = $y_m .($v < 10 ? '-0' . $v : '-' . $v);
                $data[0] = array_merge($data[0], ['-', $v, '-']);
                $data[1] = array_merge($data[1], ['充值金额', '消费金额', '中奖金额']);
            }

            foreach ($list as $k=>$v) {
                $list2[(string)$v->user_id][$v->date] = get_object_vars($v);
                unset($list[$k]);
            }
            unset($list);
            foreach ($list2 as $k => $v) {
                $arr = [(string)$k];
                foreach ($day as $v2) {
                    $v2 = $y_m .($v2 < 10 ? '-0' . $v2 : '-' . $v2);
                    if (!isset($list2[$k][$v2])) {
                        $list2[$k][$v2] = ["recharge_amount" => "0", "consumer_amount" => "0", "winning_amount" => "0"];
                    }
                }
                ksort($list2[$k]);
                foreach ($list2[$k] as $v3) {
                    $arr[] = $v3['recharge_amount'];
                    $arr[] = $v3['consumer_amount'];
                    $arr[] = $v3['winning_amount'];
                }
                $data[] = $arr;
                unset($list2[$k]);
            }
            unset($list2);

            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "本月用户概况统计导出", 'type' => 5, 'ip' => $request->getClientIp()]);
            Helper::excelOutput($data, 'MonthUser' . date('Y-m-d', time()) . '.xlsx');
        } catch (\Exception $e) {
            \Cache::forget('excel');
            throw $e;
        }
    }
}
