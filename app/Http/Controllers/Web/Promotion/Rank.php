<?php

namespace App\Http\Controllers\Web\Promotion;

use Illuminate\Http\Request;
use DB;

class Rank extends AbsPromotion
{
    public $permission = [
        'execute' => 1
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1603']??0;
    }

    /**
     * 客户充值统计
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $tab = intval($request->input('tab', 1));

        $permissions_admin_id = \App\Models\Web\Admin::getPermissionsAdminId($this->user,1,1,1);

        $prefix = DB::getTablePrefix();
        $data['day_rank_one'] = DB::table('admin_join_user as aju')
                ->leftJoin('pay_log as pl', 'pl.user_id', '=', 'aju.user_id')
                ->leftJoin('admin as a', 'a.id', '=', 'aju.admin_id')
                ->select(DB::RAW("max({$prefix}aju.admin_id) as admin_id,max({$prefix}a.truename) as truename,sum({$prefix}pl.amount) as new_recharge_amount"))
                ->where([['aju.status',1],['pl.create_at', '>=', date('Y-m-d')], ['pl.create_at', '<=', date('Y-m-d 23:59:59')]])
                ->whereIn('aju.admin_id',$permissions_admin_id)
                ->orderBy('new_recharge_amount', 'desc')
                ->groupBy('aju.admin_id')
                ->first()->truename??'';

        $data['week_rank_one'] = DB::table('admin_join_user as aju')
                ->leftJoin('pay_log as pl', 'pl.user_id', '=', 'aju.user_id')
                ->leftJoin('admin as a', 'a.id', '=', 'aju.admin_id')
                ->select(DB::RAW("max({$prefix}aju.admin_id) as admin_id,max({$prefix}a.truename) as truename,sum({$prefix}pl.amount) as new_recharge_amount"))
                ->where([['aju.status',1],['pl.create_at', '>=', date('Y-m-d', strtotime('-6 day Sunday'))], ['pl.create_at', '<=', date('Y-m-d 23:59:59', strtotime('Sunday'))]])
                ->whereIn('aju.admin_id',$permissions_admin_id)
                ->orderBy('new_recharge_amount', 'desc')
                ->groupBy('aju.admin_id')
                ->first()->truename??'';

        $data['month_rank_one'] = DB::table('admin_join_user as aju')
                ->leftJoin('pay_log as pl', 'pl.user_id', '=', 'aju.user_id')
                ->leftJoin('admin as a', 'a.id', '=', 'aju.admin_id')
                ->select(DB::RAW("max({$prefix}aju.admin_id) as admin_id,max({$prefix}a.truename) as truename,sum({$prefix}pl.amount) as new_recharge_amount"))
                ->where([['aju.status',1],['pl.create_at', '>=', date('Y-m-01')], ['pl.create_at', '<=', date('Y-m-t 23:59:59')]])
                ->whereIn('aju.admin_id',$permissions_admin_id)
                ->orderBy('new_recharge_amount', 'desc')
                ->groupBy('aju.admin_id')
                ->first()->truename??'';

        $data['rank_list'] = [];
        if ($tab == 1) {
            $data['day_rank'] = DB::table('admin_join_user as aju')
                ->leftJoin('pay_log as pl', 'pl.user_id', '=', 'aju.user_id')
                ->leftJoin('admin as a', 'a.id', '=', 'aju.admin_id')
                ->leftJoin('admin_group as ag', 'ag.id', '=', 'a.group_id')
                ->select(DB::RAW("max({$prefix}aju.admin_id) as admin_id,max({$prefix}ag.title) as group_title,max({$prefix}a.truename) as truename,max({$prefix}a.account) as account,sum({$prefix}pl.amount) as new_recharge_amount"))
                ->where([['aju.status',1],['pl.create_at', '>=', date('Y-m-d')], ['pl.create_at', '<=', date('Y-m-d 23:59:59')]])
                ->whereIn('aju.admin_id',$permissions_admin_id)
                ->orderBy('new_recharge_amount', 'desc')
                ->groupBy('aju.admin_id')
                ->limit(10)
                ->get();
            foreach ($data['day_rank'] as $k => $v) {
                $data['rank_list'][] = ['admin_id' => $v->admin_id, 'truename' => $v->truename,'account' => $v->account, 'recharge_amount' => $v->new_recharge_amount, 'group_title' => $v->group_title];
            }
            unset($data['day_rank']);
        } else if ($tab == 2) {
            $data['week_rank'] = DB::table('admin_join_user as aju')
                ->leftJoin('pay_log as pl', 'pl.user_id', '=', 'aju.user_id')
                ->leftJoin('admin as a', 'a.id', '=', 'aju.admin_id')
                ->leftJoin('admin_group as ag', 'ag.id', '=', 'a.group_id')
                ->select(DB::RAW("max({$prefix}aju.admin_id) as admin_id,max({$prefix}ag.title) as group_title,max({$prefix}a.truename) as truename,max({$prefix}a.account) as account,sum({$prefix}pl.amount) as new_recharge_amount"))
                ->where([['aju.status',1],['pl.create_at', '>=', date('Y-m-d', strtotime('-6 day Sunday'))], ['pl.create_at', '<=', date('Y-m-d 23:59:59', strtotime('Sunday'))]])
                ->whereIn('aju.admin_id',$permissions_admin_id)
                ->orderBy('new_recharge_amount', 'desc')
                ->groupBy('aju.admin_id')
                ->limit(10)
                ->get();
            foreach ($data['week_rank'] as $k => $v) {
                $data['rank_list'][] = ['admin_id' => $v->admin_id, 'truename' => $v->truename,'account' => $v->account, 'recharge_amount' => $v->new_recharge_amount, 'group_title' => $v->group_title];
            }
            unset($data['week_rank']);
        } else if ($tab == 3) {
            $data['month_rank'] = DB::table('admin_join_user as aju')
                ->leftJoin('pay_log as pl', 'pl.user_id', '=', 'aju.user_id')
                ->leftJoin('admin as a', 'a.id', '=', 'aju.admin_id')
                ->leftJoin('admin_group as ag', 'ag.id', '=', 'a.group_id')
                ->select(DB::RAW("max({$prefix}aju.admin_id) as admin_id,max({$prefix}ag.title) as group_title,max({$prefix}a.truename) as truename,max({$prefix}a.account) as account,sum({$prefix}pl.amount) as new_recharge_amount"))
                ->where([['aju.status',1],['pl.create_at', '>=', date('Y-m-01')], ['pl.create_at', '<=', date('Y-m-t 23:59:59')]])
                ->whereIn('aju.admin_id',$permissions_admin_id)
                ->orderBy('new_recharge_amount', 'desc')
                ->groupBy('aju.admin_id')
                ->limit(10)
                ->get();
            foreach ($data['month_rank'] as $k => $v) {
                $data['rank_list'][] = ['admin_id' => $v->admin_id, 'truename' => $v->truename,'account' => $v->account, 'recharge_amount' => $v->new_recharge_amount, 'group_title' => $v->group_title];
            }
            unset($data['month_rank']);
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

}
