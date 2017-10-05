<?php

namespace App\Models\Event;

use Illuminate\Database\Eloquent\Model;
use DB;

class User extends Model
{
    /**
     * 获取用户神豪榜信息
     * @param $user
     * @param int $periods
     */
    static public function getGodsInfo($user, $start_time, $end_time)
    {
        $data = [];

        $table = strtotime($end_time) - time() < -3600 * 24 * 28 ? 0 : 1;

        $customer_amount = DB::table('customer_amount_log')
            ->where([['type', 1], ['create_at', '>=', $start_time], ['create_at', '<=', $end_time]])
            ->select(['user_id', DB::raw('sum(amount) as new_amount,max(create_at) as new_create_at')])
            ->groupBy('user_id')
            ->orderBy('new_amount', 'desc')
            ->orderBy('new_create_at', 'asc');
        if ($table) {
            $user_amount = DB::table('pay_log')
                ->where([['create_at', '>=', $start_time], ['create_at', '<=', $end_time]])
                ->select(['user_id', DB::raw('sum(amount) as new_amount,max(create_at) as new_create_at')])
                ->groupBy('user_id')
                ->orderBy('new_amount', 'desc')
                ->orderBy('new_create_at', 'asc')
                ->union($customer_amount);
        } else {
            $user_amount = DB::table('report_user_amount_log')
                ->where([['date', '>=', $start_time], ['date', '<=', $end_time]])
                ->select(['user_id', DB::raw('sum(recharge_amount) as new_amount,max(date) as new_create_at')])
                ->groupBy('user_id')
                ->orderBy('new_amount', 'desc')
                ->orderBy('new_create_at', 'asc')
                ->union($customer_amount);
        }
        $amount_log = DB::table(DB::raw('(' . $user_amount->toSql() . ') as log'))
            ->groupBy('user_id')
            ->select(['user_id', DB::raw("sum(new_amount) as new_amount,max(new_create_at) as new_create_at")])
            ->orderBy('new_amount', 'desc')
            ->orderBy('new_create_at', 'asc');

        $user_info = DB::table(DB::raw('(' . $amount_log->toSql() . ') as ' . DB::getTablePrefix() . 'a'))
            ->leftJoin('user', 'a.user_id', '=', 'user.id')
            ->select(['user.id as user_id', 'new_amount', 'user.nickname', 'user.create_at', 'user.type', 'new_create_at'])
            ->whereRaw("user_id = {$user->id}")
            ->mergeBindings($user_amount)
            ->first();
        if ($user_info) {
            $user_count = DB::table(DB::raw('(' . $amount_log->toSql() . ') as ' . DB::getTablePrefix() . 'a'))
                    ->leftJoin('user', 'a.user_id', '=', 'user.id')
                    ->whereNotNull('user.id')
                    ->whereRaw("(new_amount > {$user_info->new_amount}) or (new_amount = {$user_info->new_amount} and new_create_at < '{$user_info->new_create_at}')")
                    ->orderBy('new_amount', 'desc')
                    ->orderBy('new_create_at', 'asc')
                    ->mergeBindings($user_amount)
                    ->count()??0;

            $user_info2 = DB::table(DB::raw('(' . $amount_log->toSql() . ') as ' . DB::getTablePrefix() . 'a'))
                ->leftJoin('user', 'a.user_id', '=', 'user.id')
                ->whereNotNull('user.id')
                ->orderBy('new_amount', 'desc')
                ->orderBy('new_create_at', 'asc')
                ->offset(intval($user_count - 1))->limit(3)
                ->select(['user.id as user_id', 'new_amount', 'user.nickname', 'user.create_at', 'user.type'])
                ->mergeBindings($user_amount)
                ->get();

            $data['rank'] = $user_count + 1;
            $data['recharge'] = intval($user_info->new_amount??0);
            $data['before_amount'] = $user_count >= 1 ? ($user_info2[0]->new_amount - $data['recharge']) : 0;
            $data['next_amount'] = isset($user_info2[2]->new_amount) ? $data['recharge'] - ($user_info2[2]->new_amount??0) : 0;
        } else {
            $data['rank'] = 0;
            $data['recharge'] = 0;
            $data['before_amount'] = 0;
            $data['next_amount'] = 0;
        }

        return $data;
    }

    /**
     * 获取神豪榜排名
     * @param $user
     * @param int $periods
     */
    static public function getGodsList($start_time, $end_time, $limit = 10)
    {
        $table = strtotime($end_time) - time() < -3600 * 24 * 28 ? 0 : 1;

        $customer_amount = DB::table('customer_amount_log')
            ->where([['type', 1], ['create_at', '>=', $start_time], ['create_at', '<=', $end_time]])
            ->select(['user_id', DB::raw('sum(amount) as new_amount,max(create_at) as new_create_at')])
            ->groupBy('user_id')
            ->orderBy('new_amount', 'desc')
            ->orderBy('new_create_at', 'asc')
            ->limit($limit * 2);
        if ($table) {
            $user_amount = DB::table('pay_log')
                ->where([['create_at', '>=', $start_time], ['create_at', '<=', $end_time]])
                ->select(['user_id', DB::raw('sum(amount) as new_amount,max(create_at) as new_create_at')])
                ->groupBy('user_id')
                ->orderBy('new_amount', 'desc')
                ->orderBy('new_create_at', 'asc')
                ->limit($limit * 2)
                ->union($customer_amount);
        } else {
            $user_amount = DB::table('report_user_amount_log')
                ->where([['date', '>=', $start_time], ['date', '<=', $end_time]])
                ->select(['user_id', DB::raw('sum(recharge_amount) as new_amount,max(date) as new_create_at')])
                ->groupBy('user_id')
                ->orderBy('new_amount', 'desc')
                ->orderBy('new_create_at', 'asc')
                ->limit($limit * 2)
                ->union($customer_amount);
        }
        $amount_log = DB::table(DB::raw('(' . $user_amount->toSql() . ') as log'))
            ->groupBy('user_id')
            ->select(['user_id', DB::raw("sum(new_amount) as new_amount,max(new_create_at) as new_create_at")])
            ->orderBy('new_amount', 'desc')
            ->orderBy('new_create_at', 'asc')
            ->limit($limit * 2);
        $data = DB::table(DB::raw('(' . $amount_log->toSql() . ') as ' . DB::getTablePrefix() . 'a'))
            ->leftJoin('user', 'a.user_id', '=', 'user.id')
            ->whereNotNull('user.id')
            ->orderBy('new_amount', 'desc')
            ->orderBy('new_create_at', 'asc')
            ->limit($limit)
            ->select(['user_id', 'new_amount as amount', 'user.nickname', 'user.create_at', 'user.type', 'new_create_at'])
            //->mergeBindings($customer_amount)
            ->mergeBindings($user_amount)
            ->get();

        return $data;
    }

}
