<?php

namespace App\Http\Controllers\Web\VipManage;

use Illuminate\Http\Request;
use DB;

class UserPurchase extends AbsVipManage
{
    public $permission = [
        'execute' => 1
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1503']??0;
    }

    /**
     * 购买日志
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $id = $request->input('id');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');

        if (!$id) {
            throw new \Exception('请输入用户id！！！', 1001);
        }

        $query = DB::table('order as o')
            ->leftJoin('admin_join_user as aju', 'aju.user_id', '=', 'o.user_id')
            ->leftJoin('periods as p', 'p.id', '=', 'o.periods_id')
            ->leftJoin('goods as g','g.id','=','o.goods_id');

        if ($start_time)
            $query->where('o.create_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query->where('o.create_at', '<=', trim($end_time) . ' 23:59:59');

        $query->where([['aju.status', 1],['aju.user_id', $id]]);

        $total = $query->count();
        $list = $query
            ->select('o.id', 'o.create_at','o.num',
                'p.lottery_show_at','p.periods','p.total',
                'g.title'
            )
            ->orderBy('o.id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        $user_info = DB::table('admin_join_user as aju')->leftJoin('user as u', 'u.id', '=', 'aju.user_id')->select('u.id','u.nickname','u.recharge_amount')->where('aju.user_id', $id)->first();
        if (!$user_info){
            throw new \Exception('用户信息不存在！！！', 2201);
        }else {
            //当天
            $user_info->day_recharge = DB::table('admin_join_user as aju')
                ->leftJoin('pay_log as pl', 'pl.user_id', '=', 'aju.user_id')
                ->where([['aju.status', 1],['aju.user_id', $id], ['pl.create_at', '>=', date('Y-m-d')], ['pl.create_at', '<=', date('Y-m-d 23:59:59')]])
                ->sum('pl.amount');

            //本周
            $user_info->week_recharge = DB::table('admin_join_user as aju')
                ->leftJoin('report_user_amount_log as rual', 'rual.user_id', '=', 'aju.user_id')
                ->where([['aju.status', 1],['rual.user_id', $id], ['rual.date', '>=', date('Y-m-d', strtotime('-6 day Sunday'))], ['rual.date', '<=', date('Y-m-d', strtotime('Sunday'))]])
                ->sum('rual..recharge_amount');
            $user_info->week_recharge += $user_info->day_recharge;

            //当月充值
            $user_info->month_recharge = DB::table('admin_join_user as aju')
                ->leftJoin('report_user_amount_log as rual', 'rual.user_id', '=', 'aju.user_id')
                ->where([['aju.status', 1],['rual.user_id', $id], ['rual.date', '>=', date('Y-m-01')], ['rual.date', '<=', date('Y-m-t 23:59:59')]])
                ->sum('rual..recharge_amount');
            $user_info->month_recharge += $user_info->day_recharge;
        }
        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['user_info' => $user_info, 'rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

}
