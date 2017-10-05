<?php

namespace App\Http\Controllers\Web\Promotion;

use Illuminate\Http\Request;
use DB;

class Promotion extends AbsPromotion
{
    public $permission = [
        'execute' => 1,
        'dataStatistics' => 1
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1601']??0;
    }

    /**
     * 客户充值统计
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $user_id_arr = [];
        $consumer_amount_list2 = [];
        $recharge_amount_list2 = [];

        $user_id = $request->input('user_id');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');
        $admin_status = $request->input('admin_status', 1);

        $query = DB::table('admin_join_user as aju')
            ->leftJoin('admin as a', 'a.id', '=', 'aju.admin_id')
            ->leftJoin('user as u', 'u.id', '=', 'aju.user_id');

        if ($user_id)
            $query->where('aju.user_id', $user_id);
        if ($admin_status) {
            $query->where('a.status', $admin_status);
        }

        $permissions_admin_id = \App\Models\Web\Admin::getPermissionsAdminId($this->user,0,0,1,2);
        $query->where([['aju.status', 1]])->whereNull('a.delete_at')->whereIn('aju.admin_id', $permissions_admin_id);

        $total = $query->count();
        $list = $query
            ->select('aju.id', 'aju.user_id', 'aju.phone', 'aju.wechat', 'aju.user_remake',
                'u.nickname', 'u.recharge_amount as all_recharge_amount'
            )
            ->orderBy('aju.id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        if (!count($list) && $user_id) {
            $query2 = DB::table('admin_join_user as aju')
                ->leftJoin('admin as a', 'a.id', '=', 'aju.admin_id')
                ->where([['aju.user_id', $user_id],['aju.status', 1],['a.status', $admin_status == 2 ? 1 : 2]])
                ->whereNull('a.delete_at')
                ->whereIn('aju.admin_id', $permissions_admin_id);
            $list2 = $query2->first();
            if($list2){
                throw new \Exception("你查询的账号是".($admin_status == 2 ? '正常账号' : '公共账号')."！！！", 4001);
            }
        }

        foreach ($list as $v) {
            $user_id_arr[] = $v->user_id;
        }

        //充值金额
        $query2 = DB::table('pay_log');
        if ($start_time)
            $query2->where('create_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query2->where('create_at', '<=', trim($end_time) . ' 23:59:59');
        $recharge_amount_list = $query2->select('user_id', DB::RAW('sum(amount) as amount'))->where('status', 1)->whereIn('user_id', $user_id_arr)->groupBy('user_id')->get();
        foreach ($recharge_amount_list as $v) {
            $recharge_amount_list2[(string)$v->user_id] = $v;
        }

        //消费金额
        $query3 = DB::table('user_amount_log');
        if ($start_time)
            $query3->where('create_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query3->where('create_at', '<=', trim($end_time) . ' 23:59:59');
        $consumer_amount_list = $query3->select('user_id', DB::RAW('sum(amount) as amount'))->whereIn('type', [1, 2])->whereIn('user_id', $user_id_arr)->groupBy('user_id')->get();
        foreach ($consumer_amount_list as $v) {
            $consumer_amount_list2[(string)$v->user_id] = $v;
        }

        foreach ($list as $k => $v) {
            $list[$k]->recharge_amount = $recharge_amount_list2[$v->user_id]->amount??0;
            $list[$k]->consumer_amount = $consumer_amount_list2[$v->user_id]->amount??0;
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    /**
     * 数据统计
     * @return array
     */
    public function dataStatistics()
    {
        $prefix = DB::getTablePrefix();

        $permissions_admin_id = \App\Models\Web\Admin::getPermissionsAdminId($this->user,0,0,1);

        $admin_id = DB::table('admin_group as ag')
            ->leftJoin('admin as a', 'a.group_id', '=', 'ag.id')
            ->where([['ag.type', 2]])
            ->whereIn('a.id', $permissions_admin_id)
            ->pluck('a.id');

        $data['count'] = DB::table('admin_join_user as aju')
            ->select(DB::raw("count(distinct {$prefix}aju.user_id) as user_count"))
            ->where([['aju.status', 1]])
            ->whereIn('aju.admin_id', $admin_id)
            ->first()->user_count;

        $data['day_recharge'] = DB::table('admin_join_user as aju')
            ->leftJoin('pay_log as pl', 'pl.user_id', '=', 'aju.user_id')
            ->where([['aju.status', 1], ['pl.create_at', '>=', date('Y-m-d')], ['pl.create_at', '<=', date('Y-m-d 23:59:59')]])
            ->whereIn('aju.admin_id', $admin_id)
            ->sum('pl.amount');

        //昨天
        $data['last_day_recharge'] = DB::table('admin_join_user as aju')
            ->leftJoin('report_user_amount_log as rual', 'rual.user_id', '=', 'aju.user_id')
            ->where([['aju.status', 1], ['rual.date', '=', date('Y-m-d', strtotime('-1 day'))]])
            ->whereIn('aju.admin_id', $admin_id)
            ->sum('rual.recharge_amount');

        //当月充值
        $data['month_recharge'] = DB::table('admin_join_user as aju')
            ->leftJoin('report_user_amount_log as rual', 'rual.user_id', '=', 'aju.user_id')
            ->where([['aju.status', 1], ['rual.date', '>=', date('Y-m-01')], ['rual.date', '<', date('Y-m-01', strtotime('+1 month'))]])
            ->whereIn('aju.admin_id', $admin_id)
            ->sum('rual..recharge_amount');
        $data['month_recharge'] += $data['day_recharge'];

        //上月充值
        $data['last_month_recharge'] = DB::table('admin_join_user as aju')
            ->leftJoin('report_user_amount_log as rual', 'rual.user_id', '=', 'aju.user_id')
            ->where([['aju.status', 1], ['date', '>=', date('Y-m-01', strtotime('-1 Month '.date('Y-m')))], ['date', '<', date('Y-m-01')]])
            ->whereIn('aju.admin_id', $admin_id)
            ->sum('rual..recharge_amount');

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

}
