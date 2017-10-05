<?php

namespace App\Http\Controllers\Web\UserManage;

use Illuminate\Http\Request;
use DB;

class DefaultAlipay extends AbsUserManage
{
    public $permission = [
        'execute' => 1,
        'relieveAlipay' => 2,
        'placeholder_1' => 3
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['503']??0;
    }

    /**
     * 支付信息列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $user_id_arr = [];
        $user_list2 = [];

        $user_id = $request->input('user_id');
        $name = $request->input('name');
        $address = $request->input('address');
        $phone = $request->input('phone');
        $type = $request->input('type','ali');

        $query = DB::table('user_deliver');

        if ($user_id)
            $query->where('user_id', $user_id);
        if ($name)
            $query->where('name', 'like', "%" . $name . "%");
        if ($address)
            $query->where('address', 'like', "%" . $address . "%");
        if ($phone)
            $query->where('phone', $phone);
        if ($type)
            $query->where('type', $type);

        $total = $query->count();
        $list = $query
            ->select('id', 'user_id', 'name', 'address', 'phone', 'status')
            ->orderBy('id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        foreach ($list as $k => $v) {
            $user_id_arr[] = $v->user_id;
        }
        //用户金额信息显示
        $field = ['id', 'residual_amount'];
        $this_val = pow(2, intval($this->permission['placeholder_1']) - 1);
        $val = $this->getPagePermission();
        if ($this->user->permission === null || ($this_val & $val) == $this_val) {
            $field = array_merge($field, ['winning_amount', 'recharge_amount', 'residual_amount','exchange_amount']);
        }

        $user_list = DB::table('user')->select($field)->whereIn('id', $user_id_arr)->get();
        foreach ($user_list as $k => $v) {
            $user_list2[$v->id] = $v;
        }
        foreach ($list as $k => $v) {
            $list[$k]->residual_amount = $user_list2[$v->user_id]->residual_amount??0;

            if ($this->user->permission === null || ($this_val & $val) == $this_val) {
                $list[$k]->recharge_amount = $user_list2[$v->user_id]->recharge_amount??0;
                $list[$k]->winning_amount = $user_list2[$v->user_id]->winning_amount??0;

                $list[$k]->consumer_amount = $user_list2[$v->user_id]->recharge_amount + $user_list2[$v->user_id]->exchange_amount - $user_list2[$v->user_id]->residual_amount;
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
     * 解绑支付宝
     * @param Request $request
     * @return array
     */
    public function relieveAlipay(Request $request)
    {
        $id = $request->input('id');

        if (!$id) {
            throw new \Exception('请输入id！！！', 1001);
        }

        $user_deliver = DB::table('user_deliver')->where(['id' => $id])->first();
        $re = DB::table('user_deliver')->where(['id' => $id])->delete();

        if ($re) {
            $log = json_encode($user_deliver??[]);
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "{$log}，解绑支付宝", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '解绑成功', 'data' => $re];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

}
