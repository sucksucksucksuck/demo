<?php

namespace App\Http\Controllers\Web\Promotion;

use Illuminate\Http\Request;
use DB;
use App\Common\Helper;

class Achievement extends AbsPromotion
{
    public $permission = [
        'execute' => 1,
        'dataStatistics' => 1,
        'sumAmount' => 2,
        'excel' => 3
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1602']??0;
    }

    /**
     * 推广员业绩
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $data = $this->getAchievementDate($request);

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $data[0], 'total' => $data[1], 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    private function getAchievementDate(Request $request, $re_total = 1)
    {
        $admin_id_arr = [];
        $group_id_arr = [];
        $data = [];
        $total = 0;

        $admin_id = $request->input('admin_id');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');
        $parent_group_id = $request->input('group_id');
        $director_id = $request->input('director_id');
        $admin_status = $request->input('admin_status');

        $prefix = DB::getTablePrefix();

        $query = DB::table('admin_group as ag')
            ->leftJoin('admin as a', 'a.group_id', '=', 'ag.id');

        if ($admin_id)
            $query->where('a.id', $admin_id);
        if ($parent_group_id) {
            $query->whereIn('ag.id', DB::table('admin_group')->where('pid', $parent_group_id)->whereNull('delete_at')->pluck('id'));
        }
        if ($director_id) {
            $parent_group_id2 = DB::table('admin')->where('id', $director_id)->value('group_id');
            $query->whereIn('ag.id', DB::table('admin_group')->where('pid', $parent_group_id2)->whereNull('delete_at')->pluck('id'));
        }
        if ($admin_status) {
            $query->where('a.status', $admin_status);
        }

        $permissions_admin_id = \App\Models\Web\Admin::getPermissionsAdminId($this->user,0,0,1);
        $query->whereIn('a.id', $permissions_admin_id)->where([['ag.type', 2]])->whereNull('a.delete_at');

        if ($re_total) {
            $total = $query->select(DB::RAW("count(distinct {$prefix}a.id) as count"))->first()->count;
            $list = $query->select(DB::RAW("max({$prefix}a.id) as admin_id,max({$prefix}a.group_id) as group_id,max({$prefix}a.type) as type,max({$prefix}a.status) as status,max({$prefix}a.truename) as truename,max({$prefix}a.account) as account,max({$prefix}ag.title) as group_title"))
                ->orderBy('a.id', 'desc')
                ->groupBy('a.id')
                ->forPage($this->page, $this->page_size)
                ->get();
        } else {
            $list = $query->select(DB::RAW("max({$prefix}a.id) as admin_id,max({$prefix}a.group_id) as group_id,max({$prefix}a.type) as type,max({$prefix}a.truename) as truename,max({$prefix}a.account) as account,max({$prefix}ag.title) as group_title"))
                ->orderBy('a.id', 'desc')
                ->groupBy('a.id')
                ->limit(10000)
                ->get();
        }

        foreach ($list as $v) {
            $admin_id_arr[] = $v->admin_id;
            if ($v->group_id) $group_id_arr[] = $v->group_id;
        }

        //总充值金额
        /*$recharge_amount = DB::table('admin_join_user as aju')
            ->leftJoin('user as u', 'u.id', '=', 'aju.user_id')
            ->select(DB::RAW("max({$prefix}aju.admin_id) as admin_id,sum({$prefix}u.recharge_amount) as all_recharge_amount"))
            ->where([['aju.status', 1]])
            ->whereIn('aju.admin_id', $admin_id_arr)
            ->groupBy('aju.admin_id')
            ->get();
        foreach ($recharge_amount as $k => $v) {
            $data['all_recharge_amount'][$v->admin_id] = $v->all_recharge_amount;
        }
        unset($recharge_amount);*/

        //充值金额
        $query2 = DB::table('admin_join_user as aju')
            ->leftJoin('pay_log as pl', 'pl.user_id', '=', 'aju.user_id');
        if ($start_time)
            $query2->where('pl.create_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query2->where('pl.create_at', '<=', trim($end_time) . ' 23:59:59');
        $recharge_amount = $query2->select(DB::RAW("max({$prefix}aju.admin_id) as admin_id,sum({$prefix}pl.amount) as new_recharge_amount"))
            ->where([['aju.status', 1], ['pl.create_at', '>=', date('Y-m-d')], ['pl.create_at', '<=', date('Y-m-d 23:59:59')]])
            ->whereIn('aju.admin_id', $admin_id_arr)
            ->groupBy('aju.admin_id')
            ->get();
        foreach ($recharge_amount as $k => $v) {
            $data['recharge_amount2'][$v->admin_id] = $v->new_recharge_amount;
        }

        $query2 = DB::table('admin_join_user as aju')
            ->leftJoin('report_user_amount_log as rual', 'rual.user_id', '=', 'aju.user_id');
        if ($start_time)
            $query2->where('rual.date', '>=', trim($start_time));
        if ($end_time)
            $query2->where('rual.date', '<=', trim($end_time));
        $recharge_amount = $query2->select(DB::RAW("max({$prefix}aju.admin_id) as admin_id,sum({$prefix}rual.recharge_amount) as new_recharge_amount"))
            ->where([['aju.status', 1], ['rual.date', '>=', '1970-01-01']])
            ->whereIn('aju.admin_id', $admin_id_arr)
            ->groupBy('aju.admin_id')
            ->get();

        foreach ($recharge_amount as $k => $v) {
            $data['recharge_amount2'][$v->admin_id] = ($data['recharge_amount2'][$v->admin_id]??0) + $v->new_recharge_amount??0;
        }
        unset($recharge_amount);

        //当天
        $data['day_recharge'] = DB::table('admin_join_user as aju')
            ->leftJoin('pay_log as pl', 'pl.user_id', '=', 'aju.user_id')
            ->select(DB::RAW("max({$prefix}aju.admin_id) as admin_id,sum({$prefix}pl.amount) as recharge_amount"))
            ->where([['aju.status', 1], ['pl.create_at', '>=', date('Y-m-d')], ['pl.create_at', '<=', date('Y-m-d 23:59:59')]])
            ->whereIn('aju.admin_id', $admin_id_arr)
            ->groupBy('aju.admin_id')
            ->get();
        foreach ($data['day_recharge'] as $k => $v) {
            $data['day_recharge2'][$v->admin_id] = $v->recharge_amount;
        }
        unset($data['day_recharge']);

        //昨日
        $data['last_day_recharge'] = DB::table('admin_join_user as aju')
            ->leftJoin('report_user_amount_log as rual', 'rual.user_id', '=', 'aju.user_id')
            ->select(DB::RAW("max({$prefix}aju.admin_id) as admin_id,sum({$prefix}rual.recharge_amount) as recharge_amount"))
            ->where([['aju.status', 1], ['rual.date', '=', date('Y-m-d', strtotime('-1 day'))]])
            ->whereIn('aju.admin_id', $admin_id_arr)
            ->groupBy('aju.admin_id')
            ->get();
        foreach ($data['last_day_recharge'] as $k => $v) {
            $data['last_day_recharge2'][$v->admin_id] = $v->recharge_amount;
        }
        unset($data['last_day_recharge']);

        //本周
        $data['week_recharge'] = DB::table('admin_join_user as aju')
            ->leftJoin('report_user_amount_log as rual', 'rual.user_id', '=', 'aju.user_id')
            ->select(DB::RAW("max({$prefix}aju.admin_id) as admin_id,sum({$prefix}rual.recharge_amount) as recharge_amount"))
            ->where([['aju.status', 1], ['rual.date', '>=', date('Y-m-d', strtotime('-6 day Sunday'))], ['rual.date', '<=', date('Y-m-d', strtotime('Sunday'))]])
            ->whereIn('aju.admin_id', $admin_id_arr)
            ->groupBy('aju.admin_id')
            ->get();
        foreach ($data['week_recharge'] as $k => $v) {
            $data['week_recharge2'][$v->admin_id] = $v->recharge_amount;
        }
        unset($data['week_recharge']);

        //本月
        $data['month_recharge'] = DB::table('admin_join_user as aju')
            ->leftJoin('report_user_amount_log as rual', 'rual.user_id', '=', 'aju.user_id')
            ->select(DB::RAW("max({$prefix}aju.admin_id) as admin_id,sum({$prefix}rual.recharge_amount) as recharge_amount"))
            ->where([['aju.status', 1], ['rual.date', '>=', date('Y-m-01')], ['rual.date', '<=', date('Y-m-t 23:59:59')]])
            ->whereIn('aju.admin_id', $admin_id_arr)
            ->groupBy('aju.admin_id')
            ->get();
        foreach ($data['month_recharge'] as $k => $v) {
            $data['month_recharge2'][$v->admin_id] = $v->recharge_amount;
        }
        unset($data['month_recharge']);

        //上月
        $data['last_month_recharge'] = DB::table('admin_join_user as aju')
            ->leftJoin('report_user_amount_log as rual', 'rual.user_id', '=', 'aju.user_id')
            ->select(DB::RAW("max({$prefix}aju.admin_id) as admin_id,sum({$prefix}rual.recharge_amount) as recharge_amount"))
            ->where([['aju.status', 1], ['rual.date', '>=', date('Y-m-01', strtotime('-1 Month '.date('Y-m')))], ['rual.date', '<', date('Y-m-01')]])
            ->whereIn('aju.admin_id', $admin_id_arr)
            ->groupBy('aju.admin_id')
            ->get();
        foreach ($data['last_month_recharge'] as $k => $v) {
            $data['last_month_recharge2'][$v->admin_id] = $v->recharge_amount;
        }
        unset($data['last_month_recharge']);

        //用户数
        $data['user_count'] = DB::table('admin_join_user as aju')
            ->select(DB::RAW("max({$prefix}aju.admin_id) as admin_id,count(distinct {$prefix}aju.user_id) as count"))
            ->whereIn('aju.admin_id', $admin_id_arr)
            ->where([['aju.status', 1]])
            ->groupBy('aju.admin_id')
            ->get();
        foreach ($data['user_count'] as $k => $v) {
            $data['user_count2'][$v->admin_id] = $v->count;
        }
        unset($data['user_count']);

        //主管信息
        $director_list = DB::table('admin as a')
            ->leftJoin('admin_group as ag', 'ag.pid', '=', 'a.group_id')
            ->select('a.id', 'a.truename', 'a.account', 'ag.id as ag_id')
            ->where([['a.status', 1], ['a.type', 3],['ag.type',2]])
            ->whereNull('a.delete_at')
            ->whereIn('ag.id', $group_id_arr)
            ->orderBy('a.id', 'desc')
            ->get();
        foreach ($director_list as $v) {
            if (!isset($data['director_list2'][(string)$v->ag_id])) $data['director_list2'][(string)$v->ag_id] = $v;
        }
        unset($director_list);

        foreach ($list as $k => $v) {
            //$list[$k]->all_recharge_amount = $data['all_recharge_amount'][$v->admin_id]??0;
            $list[$k]->recharge_amount = $data['recharge_amount2'][$v->admin_id]??0;
            $list[$k]->day_recharge = $data['day_recharge2'][$v->admin_id]??0;
            $list[$k]->last_day_recharge = $data['last_day_recharge2'][$v->admin_id]??0;
            $list[$k]->week_recharge = ($data['week_recharge2'][$v->admin_id]??0) + $list[$k]->day_recharge;
            $list[$k]->month_recharge = ($data['month_recharge2'][$v->admin_id]??0) + $list[$k]->day_recharge;
            $list[$k]->last_month_recharge = $data['last_month_recharge2'][$v->admin_id]??0;
            $list[$k]->user_count = $data['user_count2'][$v->admin_id]??0;
            if ($v->type == 1) {
                $list[$k]->director_name = $data['director_list2'][$v->group_id]->truename??'';
                $list[$k]->director_account = $data['director_list2'][$v->group_id]->account??'';
            } else {
                $list[$k]->director_name = $v->truename??'';
                $list[$k]->director_account = $v->account??'';
            }
        }

        return [$list, $total];
    }

    /**
     * 数据统计
     * @return array
     */
    public function dataStatistics(Request $request)
    {
        $parent_group_id = $request->input('group_id');

        $prefix = DB::getTablePrefix();
        $permissions_admin_id = \App\Models\Web\Admin::getPermissionsAdminId($this->user,0,0,1);

        $query = DB::table('admin_group as ag')
            ->leftJoin('admin as a', 'a.group_id', '=', 'ag.id')
            ->where([['ag.type', 2]])
            ->whereIn('a.id', $permissions_admin_id);

        if ($parent_group_id) {
            $query->whereIn('ag.id', DB::table('admin_group')->where('pid', $parent_group_id)->pluck('id'));
        }
        $admin_id =$query->pluck('a.id');

        $data['admin_count'] = count($admin_id);

        $data['user_count'] = DB::table('admin_join_user as aju')
            ->select(DB::raw("count(distinct {$prefix}aju.user_id) as user_count"))
            ->where([['aju.status', 1]])
            ->whereIn('aju.admin_id', $admin_id)
            ->first()->user_count;

        //今天
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
            ->sum('rual.recharge_amount');
        $data['month_recharge'] += $data['day_recharge'];

        //上月充值
        $data['last_month_recharge'] = DB::table('admin_join_user as aju')
            ->leftJoin('report_user_amount_log as rual', 'rual.user_id', '=', 'aju.user_id')
            ->where([['aju.status', 1], ['date', '>=', date('Y-m-01', strtotime('-1 Month '.date('Y-m')))], ['date', '<', date('Y-m-01')]])
            ->whereIn('aju.admin_id', $admin_id)
            ->sum('rual.recharge_amount');

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     * 充值金额统计
     * @param Request $request
     * @return array
     */
    public function sumAmount(Request $request)
    {
        $admin_id = $request->input('admin_id');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');
        $parent_group_id = $request->input('group_id');
        $admin_status = $request->input('admin_status');

        $permissions_admin_id = \App\Models\Web\Admin::getPermissionsAdminId($this->user,0,0,1);

        $query = DB::table('admin_group as ag')
            ->leftJoin('admin as a', 'a.group_id', '=', 'ag.id')
            ->where([['ag.type', 2]])
            ->whereIn('a.id', $permissions_admin_id);
        if ($admin_id)
            $query->where('a.id', $admin_id);
        if ($parent_group_id) {
            $query->whereIn('ag.id', DB::table('admin_group')->where('pid', $parent_group_id)->pluck('id'));
        }
        if ($admin_status == 1) {
            $query->where('a.status', $admin_status)->whereNull('a.delete_at');
        } else if ($admin_status == 2) {
            $query->where(function ($query) use ($admin_status) {
                $query->where('a.status', $admin_status);
                $query->orWhere(function ($query) {
                    $query->whereNotNull('a.delete_at');
                });
            });
        }
        $admin_id_arr = $query->pluck('a.id');

        $query = DB::table('admin_join_user as aju')
            ->leftJoin('pay_log as pl', 'pl.user_id', '=', 'aju.user_id')
            ->whereIn('aju.admin_id', $admin_id_arr);
        if ($start_time)
            $query->where('pl.create_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query->where('pl.create_at', '<=', trim($end_time) . ' 23:59:59');

        $sum_amount = $query->where([['aju.status', 1], ['pl.create_at', '>=', date('Y-m-d')], ['pl.create_at', '<=', date('Y-m-d 23:59:59')]])->sum('pl.amount')??0;

        $query2 = DB::table('admin_join_user as aju')
            ->leftJoin('report_user_amount_log as rual', 'rual.user_id', '=', 'aju.user_id')
            ->whereIn('aju.admin_id', $admin_id_arr);
        if ($start_time)
            $query2->where('rual.date', '>=', trim($start_time));
        if ($end_time)
            $query2->where('rual.date', '<=', trim($end_time));

        $sum_amount += $query2->where([['aju.status', 1], ['rual.date', '>=', '1970-01-01']])->sum('rual.recharge_amount')??0;

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $sum_amount];
    }

    /**
     *  导出表格
     * @param Request $request
     * @return void
     */
    public function excel(Request $request)
    {
        Helper::excelUnlock($this);
        try {
            $list = $this->getAchievementDate($request, 0)[0];

            $data = array(array('推广员','部门', '充值金额', '今日充值', '昨日充值', '本周充值', '本月充值', '上月充值', '维护客户数'));
            foreach ($list as $k => $v) {
                $arr['truename'] = $v->truename;
                $arr['group_title'] = $v->group_title;
                $arr['recharge_amount'] = $v->recharge_amount;
                $arr['day_recharge'] = $v->day_recharge;
                $arr['last_day_recharge'] = $v->last_day_recharge;
                $arr['week_recharge'] = $v->week_recharge;
                $arr['month_recharge'] = $v->month_recharge;
                $arr['last_month_recharge'] = $v->last_month_recharge;
                $arr['user_count'] = $v->user_count;
                $data[] = $arr;
            }
            unset($list);

            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "推广员业绩导出", 'type' => 5, 'ip' => $request->getClientIp()]);
            Helper::excelOutput($data, 'achievement_' . date('Y-m-d', time()) . '.xlsx');
        } catch (\Exception $e) {
            \Cache::forget('excel');
            throw $e;
        }
    }
}
