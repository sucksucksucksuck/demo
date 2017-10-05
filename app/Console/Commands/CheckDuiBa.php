<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/3/21
 * Time: 10:47
 */

namespace App\Console\Commands;


use App\Jobs\DuiBa;
use Illuminate\Support\Facades\DB;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckDuiBa extends Command
{
    protected $signature = 'check_dui_ba';
    protected $description = '检查兑吧商品是否都到了兑吧系统';

    function handle()
    {
        //Log::info('CheckDuiBa');
        $periods = DB::table('periods')
            ->where(['order_status' => 2, 'user_type' => 0, 'order_type' => 1])
            ->whereIn('amount', config('dui_ba.amount'))
            ->get();
        //Log::debug('兑吧开始兑换了' . print_r($periods, true));
        foreach ($periods as $p) {
            $job = new DuiBa($p->id);
            dispatch($job);
        }
        if ($periods->count()) {
            $this->comment('[' . date('Y-m-d H:i:s') . ']检查兑吧完毕,执行' . $periods->count() . '条记录');
        }
    }
}