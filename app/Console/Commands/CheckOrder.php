<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/3/21
 * Time: 10:47
 */

namespace App\Console\Commands;


use App\Common\Helper;
use App\Jobs\CreateLuckyCode;
use Illuminate\Support\Facades\DB;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckOrder extends Command
{
    protected $signature = 'check_order';
    protected $description = '检查订单是否生成幸运码';

    function handle()
    {
        $order = DB::table('order')
            ->leftJoin('periods', 'order.periods_id', '=', 'periods.id')
            ->where('order.create_at', '<', date('Y-m-d H:i:s', time() - 60))
            ->where(['order.status' => 0])
            ->orderBy('order.create_at', 'asc')
            ->get([
                'order.periods_id',
                'order.user_id',
                'order.id',
                'order.user_type',
                'periods.total',
                'order.num'
            ]);
        foreach ($order as $o) {
            $queue = 'create_lucky_code' . str_pad($o->periods_id % Helper::getNumProcs('create-lucky-code'), 2, '0', STR_PAD_LEFT);
            $job = (new CreateLuckyCode($o->id))->onQueue($queue);
            dispatch($job);
        }
        if ($order->count()) {
            $this->comment('[' . date('Y-m-d H:i:s') . ']检查订单完毕,执行' . $order->count() . '条记录');
        }
    }
}