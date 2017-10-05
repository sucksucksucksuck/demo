<?php

namespace App\Http\Controllers\Web\UserManage;

use App\Common\Prize;
use Illuminate\Http\Request;
use DB;

class PayManage extends AbsUserManage
{
    public $permission = [
        'execute' => 1,
        'rechargeAmount' => 2,
        'rechargeIntegral' => 3,
        'placeholder_1' => 4
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['504']??0;
    }

    /**
     * 充值列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $id = $request->input('id');

        $query = DB::table('user');
        if ($id)
            $query->where('id', $id);

        $query->whereIn('type', [0, 2, 4]);
        //用户金额信息显示
        $field = ['id', 'nickname', 'phone', 'create_at', 'residual_amount', 'total_integral', 'residual_integral', 'type', 'idaf as remark'];
        $this_val = pow(2, intval($this->permission['placeholder_1']) - 1);
        $val = $this->getPagePermission();
        if ($this->user->permission === null || ($this_val & $val) == $this_val) {
            $field = array_merge($field, ['winning_amount', 'recharge_amount', 'residual_amount', 'exchange_amount']);
        }

        $total = $query->count();
        $list = $query
            ->select($field)
            ->orderBy('id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        if ($this->user->permission === null || ($this_val & $val) == $this_val) {
            foreach ($list as $k => $v) {
                $list[$k]->consumer_amount = $v->recharge_amount + $v->exchange_amount - $v->residual_amount;
                if ($list[$k]->consumer_amount) {
                    $list[$k]->probability = (float)number_format(abs($list[$k]->winning_amount / $list[$k]->consumer_amount) * 100, 2, '.', '');
                } else if ($list[$k]->winning_amount) {
                    $list[$k]->probability = 100;
                } else {
                    $list[$k]->probability = 0;
                }
            }
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    /**
     * 充值金额
     * @param Request $request
     * @return array
     */
    public function rechargeAmount(Request $request)
    {
        $re2 = false;

        $id = $request->input('id');
        $amount = $request->input('amount');
        $remark = $request->input('remark');

        if (!$id || !$amount || !is_numeric($amount) || !$remark) {
            throw new \Exception('请输入用户id，金额和备注！！！', 1001);
        }

        $user_type = DB::table('user')->where('id', $id)->value('type');
        if (!in_array($user_type, [0, 2, 4])) {
            throw new \Exception('用户类型不对！！！', 1002);
        }

        DB::connection('anyou')->beginTransaction();
        $re = DB::connection('anyou')->table('vip')->where('uid', $id)->increment('jine', $amount);
        if ($re) {
            $re2 = Prize::amount($id, $amount, $this->user->id, 3, $remark, $remark, $user_type==4?2:1);
        }

        if ($re2 && $re2['status'] == 0) {
            DB::connection('anyou')->commit();
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$id}，{$amount}，充值金额", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '充值金额成功'];
        } else {
            DB::connection('anyou')->rollBack();
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 充值积分
     * @param Request $request
     * @return array
     */
    public function rechargeIntegral(Request $request)
    {
        $re2 = false;

        $id = $request->input('id');
        $integral = $request->input('integral');
        $remark = $request->input('remark');

        if (!$id || !$integral || !is_numeric($integral) || !$remark) {
            throw new \Exception('请输入用户id，积分和备注！！！', 1001);
        }

        $user_type = DB::table('user')->where('id', $id)->value('type');
        if (!in_array($user_type, [0, 2, 4])) {
            throw new \Exception('用户类型不对！！！', 1002);
        }
        DB::connection('anyou')->beginTransaction();
        $re = DB::connection('anyou')->table('vip')->where('uid', $id)->increment('jifen', $integral);
        if ($re) {
            $re2 = Prize::integral($id, $integral, $this->user->id, 4, $remark);
        }

        if ($re2 && $re2['status'] == 0) {
            DB::connection('anyou')->commit();
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$id}，{$integral}，充值积分", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '充值积分成功'];
        } else {
            DB::connection('anyou')->rollBack();
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

}
