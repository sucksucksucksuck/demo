<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/11
 * Time: 10:39
 */

namespace App\Http\Controllers\Web\Monitor;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppointWinning extends AbsMonitor
{
    public $permission = [
        'execute' => 1
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1304']??0;
    }

    /**
     * 指定中奖纪录
     * @param Request $request
     */
    public function execute(Request $request)
    {
        $admin_account = $request->input('admin_account');
        $periods_id = $request->input('periods_id');
        $user_id = $request->input('user_id');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');
        $operation = $request->input('operation');

        $query = DB::table('admin_log as al')
            ->leftJoin('admin as a', 'a.id', '=', 'al.admin_id');

        if ($admin_account)
            $query->where('a.account', $admin_account);
        if ($periods_id)
            $query->where('al.log', 'like', "%{$periods_id}%");
        if ($user_id)
            $query->where('al.log', 'like', "%{$user_id}%");
        if ($start_time)
            $query->where('al.create_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query->where('al.create_at', '<=', trim($end_time) . ' 23:59:59');
        if ($operation)
            $query->where('al.log', $operation == 1 ? 'like' : 'not like', "%user_id=[%");

        $query->whereIn('al.type', [20]);

        $total = $query->count();
        $list = $query
            ->select('al.create_at', 'al.log', 'a.account')
            ->orderBy('al.id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        foreach ($list as $k => $v) {
            preg_match('/periods_id=\[(\d+)\]/U',$v->log,$arr);
            $list[$k]->periods_id = $arr[1];
            preg_match('/user_id=\[(\d+)\]/U',$v->log,$arr);
            if(!empty($arr[1])){
                $list[$k]->user_id = $arr[1];
                $list[$k]->operation = 2;
            }else{
                $list[$k]->operation = 1;
            }
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

}
