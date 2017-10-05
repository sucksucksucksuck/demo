<?php

namespace App\Common;

use Illuminate\Support\Facades\DB;

class Prize
{

    /**
     * 发红包
     * @param int $user_id 用户id
     * @param int $red_id 红包id
     * @param int $count 领取次数
     * @return array
     */
    static function red($user_id, $red_id, $count = 1)
    {
        $red_info = DB::table('red')->where(['id' => $red_id])->select(['id', 'min_amount', 'max_amount', 'use_amount', 'delayed', 'expired', 'use_at', 'begin_at', 'end_at', 'title', 'count', 'receive_quantity'])->first();
        if (!$red_info) return ['status' => 1001, 'msg' => '指定的红包不存在！'];
        if (($red_info->begin_at && $red_info->begin_at > date('Y-m-d H:i:s')) || ($red_info->end_at && $red_info->end_at < date('Y-m-d H:i:s'))) return ['status' => 1002, 'msg' => '不在有效领取时间内！'];
        $red_count = DB::table('user_red')->where(['red_id' => $red_id])->count();
        if ($red_info->count >= 0 && $red_info->count < ($red_count + $count * $red_info->receive_quantity)) return ['status' => 1003, 'msg' => '红包不够了！'];

        $red_use_at = date('Y-m-d H:i:s');
        if ($red_info->use_at > $red_use_at) {
            $red_use_at = $red_info->use_at;
        }

        $re = [];
        for ($i = 0; $i < $red_info->receive_quantity * $count; $i++) {
            $money = mt_rand($red_info->min_amount, $red_info->max_amount);
            $data['red_id'] = $red_id;
            $data['user_id'] = $user_id;
            $data['amount'] = $money;
            $data['title'] = sprintf($red_info->title, $money);
            $data['begin_at'] = date('Y-m-d H:i:s', strtotime($red_use_at) + $red_info->delayed * 3600);
            $data['end_at'] = date('Y-m-d H;i:s', strtotime($data['begin_at']) + $red_info->expired * 3600 * 24);

            $re[] = ['id'=>DB::table('user_red')->insertGetId($data),'data'=> $data];
        }

        if (count($re) == $red_info->receive_quantity * $count) {
            return ['status' => 0, 'msg' => '添加成功！', 'data' => $re];
        } else {
            return ['status' => 9001, 'msg' => '添加失败！'];
        }
    }

    /**
     * 积分
     * @param int $user_id 用户id
     * @param int $value 积分数
     * @param int $admin_id 操作管理员id
     * @param int $type 类型
     * @return array
     */
    static function integral($user_id, $value, $admin_id, $type = 0, $log_info = null)
    {
        if (!$user_id || !$value) return ['status' => 1001, 'msg' => '请输入用户ID 和 积分！！！'];

        $user_info = DB::table('user')->where(['id' => $user_id])->select(['id', 'total_integral', 'residual_integral'])->first();
        if ($value < 0) {
            if ($user_info->residual_integral < abs($value)) return ['status' => 1002, 'msg' => '积分不足！'];

            $data['residual_integral'] = $user_info->residual_integral + $value;
            $log['log'] = $log_info ? $log_info : "消耗{$value}积分";
        } else {
            $data['total_integral'] = $user_info->total_integral + $value;
            $data['residual_integral'] = $user_info->residual_integral + $value;
            $log['log'] = $log_info ? $log_info : "获得{$value}积分";
        }

        $log['user_id'] = $user_id;
        $log['integral'] = $value;
        $log['admin_id'] = $admin_id;
        if ($type) $log['type'] = $type;

        $re = DB::table('user')->where(['id' => $user_id])->update($data);
        $re2 = DB::table('user_integral_log')->insertGetId($log);
        $log['id'] = $re2;

        if ($re && $re2) {
            return ['status' => 0, 'msg' => '操作成功！', 'data' => ['up_data' => $data, 'log' => $log]];
        } else {
            return ['status' => 9001, 'msg' => '操作失败！'];
        }
    }

    /**
     * 盘古币
     * @param int $user_id 用户id
     * @param int $value 盘古币
     * @param int $admin_id 操作管理员id
     * @param int $type 类型
     * @param string $log_info 日志信息
     * @param string $order_no 订单编号
     * @param int $operation 操作类型(1=>余额，2=>余额+充值金额，3=>余额+赠送金额)
     * @return array
     */
    static function amount($user_id, $value, $admin_id, $type = 1, $log_info = null, $order_no = null, $operation = 1)
    {
        if (!$user_id || !$value) return ['status' => 1001, 'msg' => '请输入用户ID 和 盘古币！！！'];

        $user_info = DB::table('user')->where(['id' => $user_id])->select(['id', 'residual_amount', 'exchange_amount', 'recharge_amount'])->first();
        if (!$user_info) return ['status' => 1002, 'msg' => '用户不存在'];
        if ($value < 0) {
            if ($user_info->residual_amount < abs($value)) return ['status' => 1003, 'msg' => '盘古币不足！'];
            //if (in_array($operation,[2])) $data['recharge_amount'] = intval($user_info->recharge_amount) + $value;
            $data['residual_amount'] = $user_info->residual_amount + $value;
            //if (in_array($operation,[3]))$data['exchange_amount'] = $user_info->exchange_amount + $value;
            $log['log'] = $log_info ? $log_info : "消耗{$value}盘古币";
        } else {
            if (in_array($operation,[2])) $data['recharge_amount'] = intval($user_info->recharge_amount) + $value;
            $data['residual_amount'] = intval($user_info->residual_amount) + $value;
            if (in_array($operation,[3]))$data['exchange_amount'] = $user_info->exchange_amount + $value;
            $log['log'] = $log_info ? $log_info : "获得{$value}盘古币";
        }

        if ($order_no) $log['order_no'] = $order_no;
        $log['user_id'] = $user_id;
        $log['amount'] = $value;
        if ($admin_id)$log['admin_id'] = $admin_id;
        $log['type'] = $type;

        $re = DB::table('user')->where(['id' => $user_id])->update($data);
        $re2 = DB::table('user_amount_log')->insertGetId($log);
        $log['id'] = $re2;

        if ($re && $re2) {
            return ['status' => 0, 'msg' => '操作成功！', 'data' => ['up_data' => $data, 'log' => $log]];
        } else {
            return ['status' => 9001, 'msg' => '操作失败！'];
        }
    }

    /**
     * 随机抽奖
     * @param array $probability 概率数组
     * @param int $Multiple 倍率
     * @param int $count 抽奖次数
     * @return array
     */
    static function probability($probability, $Multiple = 1, $count = 1)
    {
        if (empty($probability) || count($probability) < 2) return ['status' => 1001, 'msg' => '概率数组元素不能少于两个！！！'];
        $data = [];
        $probability_count = count($probability);
        $front_max = 0;
        $probability_arr = [];
        for ($i = 0; $i < $probability_count; $i++) {
            if (!is_numeric($probability[$i]) || $probability[$i] == 0) return ['status' => 1002, 'msg' => '概率数值错误！！！'];
            if ($i > 0)
                $front_max = $probability_arr[$i - 1]['max'];
            $min = $front_max + 1;
            $max = abs($probability[$i]) * $Multiple + $front_max;
            $probability_arr[] = ['min' => $min, 'max' => $max];
        }

        for ($i = 0; $i < $count; $i++) {
            $ran = mt_rand(1, $probability_arr[count($probability_arr) - 1]['max']);
            $index = 0;
            foreach ($probability_arr as $k => $v) {
                if ($ran >= $v['min'] && $ran <= $v['max']) {
                    $index = $k;
                    break;
                }
            }
            $data[] = $index;
        }
        return $data;
    }

}