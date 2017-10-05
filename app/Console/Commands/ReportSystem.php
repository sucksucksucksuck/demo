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
use App\Common\Report;

class ReportSystem extends Command
{
    protected $signature = 'report_system';
    protected $description = '整理系统数据';

    function handle()
    {
        $data = Report::ReportSystem(date('Y-m-d',time()-3600*24));
        DB::table('report_system')->insert($data);
        $this->comment('[' . date('Y-m-d H:i:s') . ']執行玩一次用戶金额报表');
    }
}