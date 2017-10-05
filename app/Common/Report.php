<?php

namespace App\Common;

use App\Http\Controllers\Event\Common;
use Illuminate\Support\Facades\DB;


class Report
{

    /**
     * 获取统计数据
     * @param string $date
     * @return array
     */
    static function ReportSystem($date, $field = [])
    {
        $begin = $date;
        $end = date('Y-m-d', strtotime($date) + 3600 * 24);
        $data = ['date' => $begin];

        //总充值金额
        if (!$field || in_array('recharge_amount', $field))
            $data['recharge_amount'] = DB::table('pay_log')
                ->where('type', '!=', 0)
                ->where('create_at', '>=', $begin)
                ->where('create_at', '<', $end)
                ->sum('amount');
        //总消费金额
        if (!$field || in_array('consumer_amount', $field))
            $data['consumer_amount'] = -DB::table('user_amount_log')
                ->leftJoin('user', 'user.id', '=', 'user_amount_log.user_id')
                ->where('user_amount_log.create_at', '>=', $begin)
                ->where('user_amount_log.create_at', '<', $end)
                ->whereIn('user_amount_log.type', [1, 2])
                ->where(['user.type' => 0])
                ->sum('amount');
        //总中奖金额
        if (!$field || in_array('winning_amount', $field))
            $data['winning_amount'] = DB::table('periods')
                ->where('lottery_show_at', '>=', $begin)
                ->where('lottery_show_at', '<', $end)
                ->where([['user_type', 0], ['status', '>=', 3]])
                ->sum('amount');
        //ios注册量
        if (!$field || in_array('register_ios', $field))
            $data['register_ios'] = DB::table('user')
                ->where('create_at', '>=', $begin)
                ->where('create_at', '<', $end)
                ->where(['device' => 1, 'type' => 0])
                ->count();
        //android注册量
        if (!$field || in_array('register_android', $field))
            $data['register_android'] = DB::table('user')
                ->where('create_at', '>=', $begin)
                ->where('create_at', '<', $end)
                ->where(['device' => 2, 'type' => 0])
                ->count();
        //用户登录次数
        if (!$field || in_array('login', $field))
            $data['login'] = DB::table('user')
                ->where('last_login_at', '>=', $begin)
                ->where('last_login_at', '<', $end)
                ->where(['type' => 0])
                ->count();
        //虚拟应发货
        if (!$field || in_array('virtual_amount', $field))
            $data['virtual_amount'] = DB::table('periods')
                ->where('confirm_at', '>=', $begin)
                ->where('confirm_at', '<', $end)
                ->where(['order_type' => 1, 'user_type' => 0])
                ->whereNotIn('amount', config('dui_ba.amount'))
                ->sum('amount');
        //实物应发货
        if (!$field || in_array('entity_amount', $field))
            $data['entity_amount'] = DB::table('periods')
                ->where('confirm_at', '>=', $begin)
                ->where('confirm_at', '<', $end)
                ->where(['order_type' => 2, 'user_type' => 0])
                ->sum('amount');
        //兑吧应打款
        if (!$field || in_array('duiba_amount', $field))
            $data['duiba_amount'] = DB::table('periods')
                ->where('confirm_at', '>=', $begin)
                ->where('confirm_at', '<', $end)
                ->where(['order_type' => 1, 'user_type' => 0])
                ->whereIn('amount', config('dui_ba.amount'))
                ->sum('amount');
        //总打款金额
        if (!$field || in_array('real_payment_amount', $field))
            $data['real_payment_amount'] = DB::table('periods')
                ->where('deliver_at', '>=', $begin)
                ->where('deliver_at', '<', $end)
                ->where(['payment_type' => 4, 'user_type' => 0])
                ->sum('real_amount');
        //虚拟打款金额
        if (!$field || in_array('real_virtual_amount', $field))
            $data['real_virtual_amount'] = DB::table('periods')
                ->where('deliver_at', '>=', $begin)
                ->where('deliver_at', '<', $end)
                ->where(['payment_type' => 4, 'order_type' => 1, 'user_type' => 0])
                ->where('payment_channel', '!=', '兑吧')
                ->whereNotIn('amount', config('dui_ba.amount'))
                ->sum('real_amount');
        //实物打款金额
        if (!$field || in_array('real_entity_amount', $field))
            $data['real_entity_amount'] = DB::table('periods')
                ->where('deliver_at', '>=', $begin)
                ->where('deliver_at', '<', $end)
                ->where(['payment_type' => 4, 'order_type' => 2, 'user_type' => 0])
                ->sum('real_amount');
        //兑吧打款金额
        if (!$field || in_array('real_duiba_amount', $field))
            $data['real_duiba_amount'] = DB::table('periods')
                ->where('deliver_at', '>=', $begin)
                ->where('deliver_at', '<', $end)
                //->where(['payment_type' => 4, 'order_type' => 1, 'user_type' => 0, 'payment_channel' => '兑吧'])
                ->where(['payment_type' => 4, 'order_type' => 1, 'user_type' => 0])
                ->whereIn('amount', config('dui_ba.amount'))
                ->sum('real_amount');
        //充值次数
        if (!$field || in_array('recharge_times', $field))
            $data['recharge_times'] = DB::table('pay_log')
                ->where('type', '!=', 0)
                ->where('create_at', '>=', $begin)
                ->where('create_at', '<', $end)
                ->count();
        //充值人数
        if (!$field || in_array('recharge_people', $field))
            $data['recharge_people'] = DB::table('pay_log')
                ->where('type', '!=', 0)
                ->where('create_at', '>=', $begin)
                ->where('create_at', '<', $end)
                ->distinct()
                ->count('user_id');

        return $data;
    }


}