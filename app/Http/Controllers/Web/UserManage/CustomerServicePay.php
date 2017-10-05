<?php

namespace App\Http\Controllers\Web\UserManage;

use Illuminate\Http\Request;
use DB;

class CustomerServicePay extends AbsUserManage
{
    public $permission = [
        'execute' => 1,
        'rechargeAmount' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['505']??0;
    }

    /**
     * 客服充值列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $query = DB::table('customer_amount_log as cal')
            ->leftJoin('user as u', 'u.id', '=', 'cal.user_id')
            ->whereIn('u.type', [2,3, 4]);

        $total = $query->count();
        $list = $query
            ->select('cal.id', 'cal.user_id', 'cal.create_at', 'cal.type', 'cal.amount',
                'u.nickname'
            )
            ->orderBy('cal.id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    /**
     * 充值金额
     * @param Request $request
     * @return array
     */
    public function rechargeAmount(Request $request)
    {
        $id = $request->input('id');
        $rank = $request->input('rank');
        $amount = $request->input('amount');

        if (!is_numeric($id)) {
            throw new \Exception('请输入用户id！！！', 1001);
        }
        if (!$amount || !preg_match('/^\d{1,11}$/', $amount)) {
            throw new \Exception('金额错误 ！！！', 1002);
        }
        if ($rank == 1 && $amount > 20000) {
            throw new \Exception('神豪榜充值不能超过20000！！！', 1006);
        }
        $user_info = DB::table('user')->select('type', 'recharge_amount', 'residual_amount')->where('id', $id)->first();
        if (!$user_info) {
            throw new \Exception('用户不存在！！！', 1003);
        } else if (!in_array($user_info->type, [2,3, 4])) {
            throw new \Exception('用户类型不对！！！', 1004);
        } else if ($amount < 0 && $user_info->residual_amount < abs($amount)) {
            throw new \Exception('余额不足！！！', 1005);
        }

        $log['type'] = $rank == 1 ? 1 : 2;
        $log['amount'] = $amount;
        $log['user_id'] = $id;
        $log['admin_id'] = $this->user->id;

        $data['recharge_amount'] = $user_info->recharge_amount + $amount;
        $data['residual_amount'] = $user_info->residual_amount + $amount;
        if ($data['recharge_amount'] < 0) $data['recharge_amount'] = 0;

        //DB::connection('anyou')->beginTransaction();
        DB::beginTransaction();
        if ($amount > 0) {
            $re = DB::connection('anyou')->table('vip')->where('uid', $id)->increment('jine', $amount);
        } else {
            $re = DB::connection('anyou')->table('vip')->where('uid', $id)->decrement('jine', $amount);
        }
        $re2 = DB::table('customer_amount_log')->insertGetId($log);
        $re3 = DB::table('user')->where('id', $id)->update($data);

        if ($re || ($re2 && $re3)) {
            //DB::connection('anyou')->commit();
            DB::commit();
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$re}，客服充值", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '充值成功'];
        } else {
            //DB::connection('anyou')->rollBack();
            DB::rollBack();
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }
}
