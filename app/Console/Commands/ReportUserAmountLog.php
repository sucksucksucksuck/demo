<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/21
 * Time: 14:52
 */

namespace App\Console\Commands;


use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ReportUserAmountLog extends Command
{
    protected $signature = 'report_user_amount_log';
    protected $description = '整理用户消费数据';

    function handle()
    {
        $prefix = DB::getTablePrefix();
        $end = date('y-m-d');
        $begin = date('y-m-d', strtotime('-1 day'));
        $data = DB::table('pay_log')
            ->select(['user_id', DB::raw('sum(amount) as amount')])
            ->where('create_at', '>=', $begin)
            ->where('create_at', '<', $end)
            ->groupBy('user_id')
            ->get();
        foreach ($data as $recharge) {
            DB::table('report_user_amount_log')->updateOrInsert(['user_id' => $recharge->user_id, 'date' => $begin], ['recharge_amount' => $recharge->amount]);
        }
        $data = DB::table('user_amount_log')
            ->leftJoin('user', 'user.id', '=', 'user_amount_log.user_id')
            ->select(['user_id', DB::raw("sum({$prefix}user_amount_log.amount) as amount")])
            ->where('user_amount_log.create_at', '>=', $begin)
            ->where('user_amount_log.create_at', '<', $end)
            ->where(['user_amount_log.type' => 1])
            ->whereIn('user.type',[0,4])
            ->groupBy('user_amount_log.user_id')
            ->get();
        foreach ($data as $consumer) {
            DB::table('report_user_amount_log')->updateOrInsert(['user_id' => $consumer->user_id, 'date' => $begin], ['consumer_amount' => -$consumer->amount]);
        }
        $data = DB::table('periods')
            ->select(['user_id', DB::raw('sum(amount) as amount')])
            ->where('lottery_show_at', '>=', $begin)
            ->where('lottery_show_at', '<', $end)
            ->whereIn('user_type',[0,4])
            ->groupBy('user_id')
            ->get();
        foreach ($data as $winning) {
            DB::table('report_user_amount_log')->updateOrInsert(['user_id' => $winning->user_id, 'date' => $begin], ['winning_amount' => $winning->amount]);
        }
        $this->comment('[' . date('Y-m-d H:i:s') . ']執行完一次用戶金额报表');
    }
}