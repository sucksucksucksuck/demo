<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/3/21
 * Time: 10:47
 */

namespace App\Console\Commands;


use App\Jobs\Lottery;
use Illuminate\Support\Facades\DB;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckPeriods extends Command
{
    protected $signature = 'check_periods';
    protected $description = '检查是否有未开奖的商品';

    public function handle()
    {
        //Log::info('CheckPeriods');
        $periods = DB::table('periods')
            ->where('lottery_show_at', '<', date('Y-m-d H:i:s', time() - config('app.global.LotteryWait')))
            ->orderBy('lottery_show_at', 'asc')
            ->where(['status' => 2])
            ->get();
        //Log::debug('开始检查开奖' . print_r($periods, true));
        foreach ($periods as $p) {
            $job = (new Lottery($p))->onQueue('lottery');
            dispatch($job);
        }
        if ($periods->count()) {
            $this->comment('[' . date('Y-m-d H:i:s') . ']检查开奖完毕,执行' . $periods->count() . '条记录');
        }
    }
}