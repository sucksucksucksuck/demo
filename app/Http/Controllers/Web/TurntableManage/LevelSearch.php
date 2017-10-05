<?php

namespace App\Http\Controllers\Web\TurntableManage;

use Illuminate\Http\Request;
use DB;

/**
 * 转盘等级查询
 * Class LevelSearch
 * @package App\Http\Controllers\Web\TurntableManage
 */
class LevelSearch extends AbsTurntable
{
    public $permission = [
        'execute' => 1,
        'add' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['901']??0;
    }

    /**
     *  转盘等级查询
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $user_id = $request->input('user_id');

        if (!$user_id)
            throw new \Exception('请输入用户id !!!', 1001);

        $user_info = DB::table('user')->where('id', $user_id)->first();
        if (!$user_info)
            throw new \Exception('用户不存在 !!!', 1002);

        $event = DB::table('event')->find($this->event_id);
        $extend = json_decode($event->extend, true);
        $level = 0;
        foreach ($extend as $k => $l) {
            if ($l > $user_info->recharge_amount) {
                break;
            }
            $level = $k+1;
        }
        $user_event = DB::table('user_event')->where([['user_id', $user_id], ['event_id', $this->event_id]])->first();
        if (!$user_event) {
            //默认初始化次数
            $extend = ['count' => 1,'count_date'=>date('Y-m-d')];
            DB::table('user_event')->insert([
                'user_id' => $user_id,
                'event_id' => $this->event_id,
                'extend' => json_encode($extend, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
            ]);
            $user_event = new \stdClass();
            $user_event->extend = $extend;
        } else {
            $user_event->extend = json_decode($user_event->extend, true);
            if ($user_event->extend['count_date'] != date('Y-m-d')) {
                $user_event->extend['count'] = 1;
                $user_event->extend['count_date'] = date('Y-m-d');
                DB::table('user_event')
                    ->where('id',$user_event->id)
                    ->update([
                        'extend' => json_encode($user_event->extend, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                    ]);
            }
        }

        //前三天充值
        if ($user_info->type != 4 || (empty($user_event->extend['three_days_recharge_date']) || date('Y-m-d') != $user_event->extend['three_days_recharge_date'])) {
            $user_event->extend['three_days_recharge_amount'] = DB::table('pay_log')->where([['user_id', $user_id], ['status', 1], ['create_at', '>=', date('Y-m-d', strtotime('-2 day'))]])->sum('amount');
        }

        $data['user_id'] = $user_id;
        $data['recharge_amount'] = $user_info->recharge_amount;
        $data['three_days_recharge_amount'] = $user_event->extend['three_days_recharge_amount'];
        $data['count'] = $user_event->extend['count'];
        $data['level'] = $level + 1;
        $data['turntable_name'] = $this->turntable_name[$level]??'-';
        $data['user_type'] = $user_info->type;

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     *  修改转盘客服数据
     * @param Request $request
     * @return array
     */
    public function add(Request $request)
    {
        $user_id = $request->input('user_id');
        $recharge_amount = $request->input('recharge_amount');
        $three_days_recharge_amount = $request->input('three_days_recharge_amount');
        $count = $request->input('count');

        if (!$user_id)
            throw new \Exception('请输入用户id !!!', 1001);
        $user_info = DB::table('user')->where('id', $user_id)->first();
        if (!$user_info)
            throw new \Exception('用户不存在 !!!', 1002);
        if ($user_info->type != 4)
            throw new \Exception('只能修改客服账号的数据 !!!', 1003);
        if ($recharge_amount && !is_numeric($recharge_amount) || $recharge_amount < -10000000000 || $recharge_amount > 10000000000)
            throw new \Exception('充值金额超出范围 （-10000000000 ～ 10000000000） !!!', 1004);
        if ($three_days_recharge_amount && !is_numeric($three_days_recharge_amount) || $three_days_recharge_amount < 0 || $three_days_recharge_amount > 10000000000)
            throw new \Exception('三天内充值金额超出范围 （0-10000000000） !!!', 1005);
        if ($count && !is_numeric($count) || $count < 0 || $count > 10)
            throw new \Exception('转盘次数超出范围 （0-10次） !!!', 1005);

        $event_info = DB::table('event')->where('id', $this->event_id)->first();
        $event_info->extend = json_decode($event_info->extend, true);
        $user_event = DB::table('user_event')->where([['user_id', $user_id], ['event_id', $this->event_id]])->first();
        if (!$user_event) {
            throw new \Exception('活动数据不存在 !!!', 1004);
        }
        $user_event->extend = json_decode($user_event->extend, true);

        $re = false;
        if (is_numeric($recharge_amount)) {
            $re = DB::table('user')->where([['id', $user_id], ['type', 4]])->update(['recharge_amount' => $recharge_amount]);
            DB::connection('anyou')->table('vip')->where([['uid', $user_id],['abot',4]])->update(['jine' => $recharge_amount]);
        }
        if (is_numeric($three_days_recharge_amount)) {
            $user_event->extend['three_days_recharge_amount'] = $three_days_recharge_amount;
            $user_event->extend['three_days_recharge_date'] = date('Y-m-d');
        }
        if ($count) {
            $user_event->extend['count'] = intval($count);
            $user_event->extend['count_date'] = date('Y-m-d');
        }
        $re2 = DB::table('user_event')->where([['user_id', $user_id], ['event_id', $this->event_id]])->update(['extend' => json_encode($user_event->extend)]);

        if ($re || $re2) {
            $log = ['user_id' => "{$user_id}", 'msg' => '修改转盘活动，客服账号数据'];
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => json_encode($log, JSON_UNESCAPED_UNICODE), 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功'];
        } else {
            return ['errcode' => 4002, 'msg' => '没有数据被修改'];
        }
    }

}
