<?php

namespace App\Http\Controllers\Web\Promotion;

use Illuminate\Http\Request;
use DB;
use App\Common\Helper;

class GroupAchievement extends AbsPromotion
{
    public $permission = [
        'execute' => 1,
        'sumAmount' => 2,
        'excel' => 3
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1604']??0;
    }

    /**
     * 客户充值统计
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $data = $this->getGroupAchievementDate($request);

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    private function getGroupAchievementDate(Request $request)
    {
        $group_id_arr = [];
        $admin_id_arr = [];
        $data = [];
        $jion = [];

        $admin_id = trim($request->input('admin_id'));
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');
        $sort_field = $request->input('sort_field');
        $sort = $request->input('sort', 'desc');

        $prefix = DB::getTablePrefix();
        $where = [['ag.type', 2], ['a2.type', 1], ['ag2.type', 2], ['aju.status', 1]];
        //主管统计
        $query = DB::table('admin_group as ag')
            ->leftJoin('admin_group as ag2', 'ag2.pid', '=', 'ag.id')
            ->leftJoin('admin as a2', 'a2.group_id', '=', 'ag2.id')
            ->leftJoin('admin_join_user as aju', 'aju.admin_id', '=', 'a2.id');

        if ($admin_id) {
            $query->whereIn('ag.id', DB::table('admin')->where([['truename', 'like', "%{$admin_id}%"], ['type', 3], ['status', 1]])->pluck('group_id'));
        }

        $permissions_admin_id = \App\Models\Web\Admin::getPermissionsAdminId($this->user,1,0,1);
        $query->whereIn('a2.id', $permissions_admin_id);

        $data['rows'] = $query->select(DB::RAW("max({$prefix}ag.id) as group_id,max({$prefix}ag.title) as group_title,count(distinct {$prefix}aju.user_id) as user_count"))
            ->where($where)
            ->orderBy('group_id', 'desc')
            ->groupBy('ag.id')
            ->limit(1000)
            ->get();

        foreach ($data['rows'] as $v) {
            $group_id_arr[] = $v->group_id;
        }

        $truename = DB::table('admin')->select('group_id', 'truename', 'account')->where([['type', 3], ['status', 1]])->whereIn('group_id', $group_id_arr)->orderBy('id', 'desc')->get();
        foreach ($truename as $k => $v) {
            if (!isset($data['truename'][$v->group_id])) $data['truename'][$v->group_id] = ['truename' => $v->truename, 'account' => $v->account];
        }
        unset($truename);

        //推广员数据统计
        $admin_list = DB::table('admin_group as ag')
            ->leftJoin('admin_group as ag2', 'ag2.pid', '=', 'ag.id')
            ->leftJoin('admin as a2', 'a2.group_id', '=', 'ag2.id')
            ->select('a2.id', 'ag.id as parent_group_id')
            ->where([['ag.type', 2], ['a2.type', 1], ['ag2.type', 2]])
            ->whereIn('a2.id', $permissions_admin_id)
            ->limit(5000)
            ->get();

        foreach ($admin_list as $k => $v) {
            $jion[$v->id] = $v->parent_group_id;
            $admin_id_arr[] = $v->id;
            $data['promotion_count'][$v->parent_group_id] = ($data['promotion_count'][$v->parent_group_id]??0) + 1;

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
            $data['all_recharge_amount'][$jion[$v->admin_id]] = ($data['all_recharge_amount'][$jion[$v->admin_id]]??0) + $v->all_recharge_amount;
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
            ->where([['pl.create_at', '>=', date('Y-m-d')], ['pl.create_at', '<=', date('Y-m-d 23:59:59')]])
            ->where([['aju.status', 1]])
            ->whereIn('aju.admin_id', $admin_id_arr)
            ->groupBy('aju.admin_id')
            ->get();
        foreach ($recharge_amount as $k => $v) {
            $data['recharge_amount'][$jion[$v->admin_id]] = ($data['recharge_amount'][$jion[$v->admin_id]]??0) + $v->new_recharge_amount;
        }
        unset($recharge_amount);

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
            $data['recharge_amount'][$jion[$v->admin_id]] = ($data['recharge_amount'][$jion[$v->admin_id]]??0) + ($v->new_recharge_amount??0);
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
            $data['day_recharge2'][$jion[$v->admin_id]] = ($data['day_recharge2'][$jion[$v->admin_id]]??0) + $v->recharge_amount;
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
            $data['last_day_recharge2'][$jion[$v->admin_id]] = ($data['last_day_recharge2'][$jion[$v->admin_id]]??0) + $v->recharge_amount;
        }
        unset($data['last_day_recharge']);

        //本周
        $data['week_recharge'] = DB::table('admin_join_user as aju')
            ->leftJoin('report_user_amount_log as rual', 'rual.user_id', '=', 'aju.user_id')
            ->select(DB::RAW("max({$prefix}aju.admin_id) as admin_id,sum({$prefix}rual.recharge_amount) as recharge_amount"))
            ->where([['aju.status', 1], ['rual.date', '>=', date('Y-m-d', strtotime('-6 day Sunday'))], ['rual.date', '<=', date('Y-m-d 23:59:59', strtotime('Sunday'))]])
            ->whereIn('aju.admin_id', $admin_id_arr)
            ->groupBy('aju.admin_id')
            ->get();
        foreach ($data['week_recharge'] as $k => $v) {
            $data['week_recharge2'][$jion[$v->admin_id]] = ($data['week_recharge2'][$jion[$v->admin_id]]??0) + $v->recharge_amount;
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
            $data['month_recharge2'][$jion[$v->admin_id]] = ($data['month_recharge2'][$jion[$v->admin_id]]??0) + $v->recharge_amount;
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
            $data['last_month_recharge2'][$jion[$v->admin_id]] = ($data['last_month_recharge2'][$jion[$v->admin_id]]??0) + $v->recharge_amount;
        }
        unset($data['last_month_recharge']);

        foreach ($data['rows'] as $k => $v) {
            $data['rows'][$k]->promotion_count = $data['promotion_count'][$v->group_id]??0;
            $data['rows'][$k]->truename = $data['truename'][$v->group_id]['truename']??'';
            $data['rows'][$k]->account = $data['truename'][$v->group_id]['account']??'';
            //$data['rows'][$k]->all_recharge_amount = $data['all_recharge_amount'][$v->group_id]??0;
            $data['rows'][$k]->recharge_amount = $data['recharge_amount'][$v->group_id]??0;
            $data['rows'][$k]->day_recharge = $data['day_recharge2'][$v->group_id]??0;
            $data['rows'][$k]->last_day_recharge = $data['last_day_recharge2'][$v->group_id]??0;
            $data['rows'][$k]->week_recharge = ($data['week_recharge2'][$v->group_id]??0) + $data['rows'][$k]->day_recharge;
            $data['rows'][$k]->month_recharge = ($data['month_recharge2'][$v->group_id]??0) + $data['rows'][$k]->day_recharge;
            $data['rows'][$k]->last_month_recharge = $data['last_month_recharge2'][$v->group_id]??0;
            $day_sort[$k] = intval($data['rows'][$k]->day_recharge);
            $week_sort[$k] = intval($data['rows'][$k]->week_recharge);
            $month_sort[$k] = intval($data['rows'][$k]->month_recharge);
        }

        $data['day_rank_one'] = '';
        $data['week_rank_one'] = '';
        $data['month_rank_one'] = '';
        if(!empty($day_sort)){
            arsort($day_sort);
            $day_sort_key = array_keys($day_sort);
            $data['day_rank_one'] = $data['rows'][$day_sort_key[0]]->truename;
        }

        if(!empty($week_sort)){
            arsort($week_sort);
            $week_sort_key = array_keys($week_sort);
            $data['week_rank_one'] = $data['rows'][$week_sort_key[0]]->truename;
        }

        if(!empty($month_sort)){
            arsort($month_sort);
            $month_sort_key = array_keys($month_sort);
            $data['month_rank_one'] = $data['rows'][$month_sort_key[0]]->truename;
        }

        unset($data['promotion_count'],$data['truename'], $data['recharge_amount'], $data['day_recharge2'], $data['last_day_recharge2'], $data['week_recharge2'], $data['month_recharge2'], $data['last_month_recharge2']);

        if ($sort_field && isset($data['rows'][1]->$sort_field)) {
            $list2 = [];
            foreach ($data['rows'] as $k => $v) {
                $list[$k] = $v->$sort_field;
            }
            $sort == 'desc' ? arsort($list) : asort($list);
            foreach ($list as $k => $v) {
                $list2[] = $data['rows'][$k];
            }
            $data['rows'] = $list2;
        }

        return $data;
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

        $permissions_admin_id = \App\Models\Web\Admin::getPermissionsAdminId($this->user,1,0,1);

        $query = DB::table('admin_group as ag')
            ->leftJoin('admin_group as ag2', 'ag2.pid', '=', 'ag.id')
            ->leftJoin('admin as a2', 'a2.group_id', '=', 'ag2.id')
            ->where([['ag.type', 2], ['a2.type', 1], ['ag2.type', 2]])
            ->whereIn('a2.id', $permissions_admin_id);
        if ($admin_id) {
            $query->whereIn('ag.id', DB::table('admin')->where([['truename', 'like', "%{$admin_id}%"], ['type', 3], ['status', 1]])->pluck('group_id'));
        }
        $admin_id_arr = $query->pluck('a2.id');

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
            $data = $this->getGroupAchievementDate($request);

            $data2 = array(array('主管','部门', '推广员数', '客户数', '今日充值', '昨日充值', '周充值', '月充值', '上月充值', '充值金额'));
            foreach ($data['rows'] as $k => $v) {
                $arr['truename'] = $v->truename;
                $arr['group_title'] = $v->group_title;
                $arr['promotion_count'] = $v->promotion_count;
                $arr['user_count'] = $v->user_count;
                $arr['day_recharge'] = $v->day_recharge;
                $arr['last_day_recharge'] = $v->last_day_recharge;
                $arr['week_recharge'] = $v->week_recharge;
                $arr['month_recharge'] = $v->month_recharge;
                $arr['last_month_recharge'] = $v->last_month_recharge;
                $arr['recharge_amount'] = $v->recharge_amount;
                $data2[] = $arr;
            }
            unset($data);

            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "实物订单导出", 'type' => 5, 'ip' => $request->getClientIp()]);
            Helper::excelOutput($data2, 'order_' . date('Y-m-d', time()) . '.xlsx');
        } catch (\Exception $e) {
            \Cache::forget('excel');
            throw $e;
        }
    }
}
