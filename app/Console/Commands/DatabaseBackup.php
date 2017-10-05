<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DatabaseBackup extends Command
{
    protected $signature = 'backup';
    protected $description = '数据库备份三十天前的数据';
    protected $time; //查询条件(时间)
    protected $page_size;
    protected $toArray;


    function handle()
    {
        $backup = Cache::get('backup', false);
        if ($backup) {
            $this->comment('上次备份未完成');
            return;
        }
        Cache::put('backup', true, 5);
        $this->toArray = function ($obj) {
            return get_object_vars($obj);
        };
        ini_set('memory_limit', '2048M');
        //查询条件
        $this->time = date('Y-m-d', strtotime('-45 day'));
        $this->page_size = 50000;
        $this->comment('开始备份' . $this->time . '之前的数据!,当前时间' . date('Y-m-d H:i:s'));
        //开始备份
        //$this->dui_ba();
        $this->orderAndPeriods();
        $this->lucky_code();
        $this->report_system();
        $this->report_user_amount_log();
        $this->pay_log();
        $this->user_amount_log();
        $this->comment('备份完成,当前时间' . date('Y-m-d H:i:s'));
        Cache::forget('backup');
    }

    /**
     * lucky_code表
     */
    private function lucky_code()
    {
        try {
            $this->comment('开始备份lucky_code表...');
            $this->comment('开始查询更新数量...');
            $page = 1;
            $date = date('Y_m_') . (intval(intval(date('d')) / 10.5));
            $prefix = DB::connection('pgyg_bak')->getTablePrefix();
            DB::connection('pgyg_bak')->update("create table if not exists {$prefix}lucky_code_{$date} like {$prefix}lucky_code");
            do {
                unset($lucky_code);
                DB::connection('pgyg_bak')->beginTransaction();
                DB::connection()->beginTransaction();
                $lucky_code = DB::table('lucky_code')->where('create_at', '<', $this->time)->limit($this->page_size)->get()->all();
                if ($lucky_code && count($lucky_code)) {
                    $time = time();
                    $this->comment('开始备份数据，共计' . count($lucky_code) . '条记录。 当前时间=' . date('Y-m-d H:i:s', $time));
                    //插入数据
                    $arr = array_chunk($lucky_code, 2000);
                    foreach ($arr as $i => $l) {
                        $this->comment('插入新表数据' . count($l) . '条记录。循环第' . $i . '次');
                        //备份数据
                        DB::connection('pgyg_bak')->table('lucky_code_' . $date)->insert(array_map($this->toArray, $l));
                        $id_list = [];
                        foreach ($l as $v) {
                            $id_list[] = $v->id;
                        }
                        $this->comment('删除旧表数据' . count($l) . '条记录。');
                        DB::table('lucky_code')->whereIn('id', $id_list)->delete();
                        unset($l);
                        unset($id_list);
                    }
                    unset($arr);
                    $this->comment('lucky_code表备份完成。page: ' . $page . ' 当前时间=' . date('Y-m-d H:i:s') . '用时=' . date('H:i:s', time() - $time + 16 * 60 * 60));
                } else {
                    $this->comment('lucky_code无更新。');
                }
                DB::commit();
                DB::connection('pgyg_bak')->commit();
                Cache::put('backup', true, 5);
                $page++;
                //  sleep(10);
            } while ($lucky_code && count($lucky_code));
            unset($lucky_code);
        } catch (\Exception $e) {
            DB::rollBack();
            DB::connection('pgyg_bak')->rollBack();
            Log::error('数据库备份时出现错误, code = ' . $e->getCode() . ',msg=' . $e->getMessage());
            $this->comment($e->getMessage());
        }
    }

    /**
     *
     */
    private function orderAndPeriods()
    {
        try {
            $this->comment('开始备份order,periods表...');
            $this->comment('开始查询更新数量...');
            do {
                unset($periods_ids);
                $periods_ids = DB::table('order')->where('create_at', '<', $this->time)->limit($this->page_size)->groupBy('periods_id')->get(['periods_id'])->toArray();
                $periods_ids = array_map(function ($item) {
                    return $item->periods_id;
                }, $periods_ids);
                $this->comment('开始备份数据，periods共计' . count($periods_ids) . '条记录。');
                if ($periods_ids && count($periods_ids)) {
                    DB::connection('pgyg_bak')->beginTransaction();
                    DB::connection()->beginTransaction();
                    //插入数据
                    $arr = array_chunk($periods_ids, 500);
                    foreach ($arr as $ids) {
                        $dui_ba = DB::table('dui_ba')->whereIn('periods_id', $ids)->get()->toArray();
                        $order = DB::table('order')->whereIn('periods_id', $ids)->get()->toArray();
                        $periods = DB::table('periods')->whereIn('id', $ids)->get()->toArray();

                        $this->comment('开始备份数据，dui_ba=' . count($dui_ba) . '条记录,，order=' . count($order) . '条记录,，periods=' . count($periods) . '条记录。');
                        //备份数据
                        DB::connection('pgyg_bak')->table('periods')->insert(array_map($this->toArray, $periods));
                        $order = array_map($this->toArray, $order);
                        $order_arr = array_chunk($order, 2000);
                        foreach ($order_arr as $o) {
                            DB::connection('pgyg_bak')->table('order')->insert($o);
                        }
                        DB::connection('pgyg_bak')->table('dui_ba')->insert(array_map($this->toArray, $dui_ba));
                        $this->comment('删除数据');
                        DB::table('dui_ba')->whereIn('periods_id', $ids)->delete();
                        DB::table('order')->whereIn('periods_id', $ids)->delete();
                        DB::table('periods')->whereIn('id', $ids)->delete();
                        unset($dui_ba);
                        unset($order);
                        unset($periods);
                        unset($order_arr);
                    }
                    DB::commit();
                    DB::connection('pgyg_bak')->commit();
                    Cache::put('backup', true, 5);
                    $this->comment('order表备份完成。periods表备份完成。');
                } else {
                    $this->comment('order无更新。periods无更新。');
                }
            } while ($periods_ids && count($periods_ids));
            unset($periods_ids);
        } catch (\Exception $e) {
            DB::rollBack();
            DB::connection('pgyg_bak')->rollBack();
            Log::error('数据库备份时出现错误, code = ' . $e->getCode() . ',msg=' . $e->getMessage());
            $this->comment($e->getMessage());
        }
    }

    /**
     * report_system表
     */
    private function report_system()
    {
        try {
            DB::connection('pgyg_bak')->beginTransaction();
            DB::connection()->beginTransaction();
            $this->comment('开始备份report_system表...');
            $this->comment('开始查询更新数量...');
            $report_system = DB::table('report_system')->where('date', '<', $this->time)->get()->toArray();
            $this->comment('开始备份数据，共计' . count($report_system) . '条记录。');
            if ($report_system && count($report_system)) {
                //插入数据
                $arr = array_chunk($report_system, 2000);
                foreach ($arr as $l) {
                    //备份数据
                    DB::connection('pgyg_bak')->table('report_system')->insert(array_map($this->toArray, $l));
                    $id_list = [];
                    foreach ($l as $v) {
                        $id_list[] = $v->date;
                    }
                    DB::table('report_system')->whereIn('date', $id_list)->delete();
                }
                unset($arr);
                $this->comment('report_system表备份完成。');
            } else {
                $this->comment('report_system无更新。');
            }
            DB::commit();
            DB::connection('pgyg_bak')->commit();
            Cache::put('backup', true, 5);
            unset($report_system);
        } catch (\Exception $e) {
            DB::rollBack();
            DB::connection('pgyg_bak')->rollBack();
            Log::error('数据库备份时出现错误, code = ' . $e->getCode() . ',msg=' . $e->getMessage());
            $this->comment($e->getMessage());
        }
    }

    /**
     * report_user_amount_log表
     */
    private function report_user_amount_log()
    {
        try {
            $this->comment('开始备份report_user_amount_log表...');
            $this->comment('开始查询更新数量...');
            do {
                DB::connection('pgyg_bak')->beginTransaction();
                DB::beginTransaction();
                unset($report_user_amount_log);
                $report_user_amount_log = DB::table('report_user_amount_log')->where('date', '<', $this->time)->limit($this->page_size)->get()->toArray();
                $this->comment('开始备份数据，共计' . count($report_user_amount_log) . '条记录。');
                if ($report_user_amount_log && count($report_user_amount_log)) {
                    //插入数据
                    $arr = array_chunk($report_user_amount_log, 2000);
                    foreach ($arr as $l) {
                        //备份数据
                        DB::connection('pgyg_bak')->table('report_user_amount_log')->insert(array_map($this->toArray, $l));
                        $date_list = [];
                        foreach ($l as $v) {
                            $date_list[] = $v->date;
                        }
                        DB::table('report_user_amount_log')->whereIn('date', $date_list)->delete();
                    }
                    unset($arr);
                    $this->comment('report_user_amount_log表备份完成。');
                } else {
                    $this->comment('report_user_amount_log无更新。');
                }
                DB::commit();
                DB::connection('pgyg_bak')->commit();
                Cache::put('backup', true, 5);
            } while ($report_user_amount_log && count($report_user_amount_log));
            unset($report_user_amount_log);
        } catch (\Exception $e) {
            DB::rollBack();
            DB::connection('pgyg_bak')->rollBack();
            Log::error('数据库备份时出现错误, code = ' . $e->getCode() . ',msg=' . $e->getMessage());
            $this->comment($e->getMessage());
        }
    }

    /**
     * pay_log表
     */
    private function pay_log()
    {
        try {
            DB::connection('pgyg_bak')->beginTransaction();
            DB::beginTransaction();
            $this->comment('开始备份pay_log表...');
            $this->comment('开始查询更新数量...');
            $pay_log = DB::table('pay_log')->where('create_at', '<', $this->time)->limit($this->page_size)->get()->toArray();
            $this->comment('开始备份数据，共计' . count($pay_log) . '条记录。');
            if ($pay_log && count($pay_log)) {
                //插入数据
                $arr = array_chunk($pay_log, 5000);
                foreach ($arr as $l) {
                    //备份数据
                    DB::connection('pgyg_bak')->table('pay_log')->insert(array_map($this->toArray, $l));

                    $id_list = [];
                    foreach ($l as $v) {
                        $id_list[] = $v->id;
                    }
                    DB::table('pay_log')->whereIn('id', $id_list)->delete();
                }
                unset($arr);
                $this->comment('pay_log表备份完成。');
            } else {
                $this->comment('pay_log无更新。');
            }
            DB::commit();
            DB::connection('pgyg_bak')->commit();
            Cache::put('backup', true, 5);
            unset($pay_log);
        } catch (\Exception $e) {
            DB::rollBack();
            DB::connection('pgyg_bak')->rollBack();
            Log::error('数据库备份时出现错误, code = ' . $e->getCode() . ',msg=' . $e->getMessage());
            $this->comment($e->getMessage());
        }
    }

    /**
     * user_amount_log表
     */
    private function user_amount_log()
    {
        try {
            $this->comment('开始备份user_amount_log表...');
            $this->comment('开始查询更新数量...');
            do {
                DB::connection('pgyg_bak')->beginTransaction();
                DB::beginTransaction();
                unset($user_amount_log);
                $user_amount_log = DB::table('user_amount_log')->where('create_at', '<', $this->time)->limit($this->page_size)->get()->toArray();
                $this->comment('开始备份数据，共计' . count($user_amount_log) . '条记录。');
                if ($user_amount_log && count($user_amount_log)) {
                    //插入数据
                    $arr = array_chunk($user_amount_log, 2000);
                    foreach ($arr as $l) {
                        //备份数据
                        DB::connection('pgyg_bak')->table('user_amount_log')->insert(array_map($this->toArray, $l));
                        $id_list = [];
                        foreach ($l as $v) {
                            $id_list[] = $v->id;
                        }
                        DB::table('user_amount_log')->whereIn('id', $id_list)->delete();
                    }
                    unset($arr);
                    $this->comment('user_amount_log表备份完成。');
                } else {
                    $this->comment('user_amount_log无更新。');
                }
                DB::commit();
                DB::connection('pgyg_bak')->commit();
                Cache::put('backup', true, 5);
            } while ($user_amount_log && count($user_amount_log));
            unset($user_amount_log);
        } catch (\Exception $e) {
            DB::rollBack();
            DB::connection('pgyg_bak')->rollBack();
            Log::error('数据库备份时出现错误, code = ' . $e->getCode() . ',msg=' . $e->getMessage());
            $this->comment($e->getMessage());
        }
    }
}
