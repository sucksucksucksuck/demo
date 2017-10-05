<?php

namespace App\Http\Controllers\Web\UserManage;

use Illuminate\Http\Request;
use DB;
use App\Common\Helper;

class UserManage extends AbsUserManage
{
    public $permission = [
        'execute' => 1,
        'placeholder_1' => 2,
        'editUserType' => 3,
        'relievePhone' => 4,
        'disableAccount' => 5
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['501']??0;
    }

    /**
     * 用户管理
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $id = $request->input('id');
        $nickname = $request->input('nickname');
        $phone = $request->input('phone');
        $create_ip = $request->input('create_ip');
        $channel = $request->input('channel');
        $device = $request->input('device');
        $recharge_times = $request->input('recharge_times');
        $create_start_time = $request->input('create_start_time');
        $create_end_time = $request->input('create_end_time');
        $login_start_time = $request->input('login_start_time');
        $login_end_time = $request->input('login_end_time');
        $status = $request->input('status');
        $reg = $request->input('reg');

        $query = DB::table('user');

        if ($id) {
            $user_type = DB::table('user')->where('id', $id)->value('type');
            if (in_array($user_type, [2, 4])) {
                $type_info = [2 => '测试号', 4 => '客服号'];
                throw new \Exception("你查询的ID是{$type_info[$user_type]}！！！", 4001);
            }
            $query->where('id', $id);
        }
        if ($nickname)
            $query->where('nickname', 'like', "%" . $nickname . "%");
        if ($phone)
            $query->where('phone', 'like', "%" . $phone . "%");
        if ($create_ip)
            $query->where('create_ip', 'like', "%" . $create_ip . "%");
        if ($channel)
            $query->where('channel', 'like', "%" . $channel . "%");
        if ($device)
            $query->where('device', $device);
        if ($recharge_times == 1) {
            $query->where('recharge_times', '>', 0);
        } else if ($recharge_times == 2) {
            $query->where('recharge_times', 0);
        }
        if ($create_start_time)
            $query->where('create_at', '>=', trim($create_start_time) . ' 00:00:00');
        if ($create_end_time)
            $query->where('create_at', '<=', trim($create_end_time) . ' 23:59:59');
        if ($login_start_time)
            $query->where('last_login_at', '>=', trim($login_start_time) . ' 00:00:00');
        if ($login_end_time)
            $query->where('last_login_at', '<=', trim($login_end_time) . ' 23:59:59');
        if ($status)
            $query->where('status', $status);
        if (is_numeric($reg))
            $query->where('reg', $reg);

        $query->whereIn('type', [0]);
        $field = ['id', 'nickname', 'device', 'channel', 'phone', 'create_ip', 'create_at', 'last_login_at', 'residual_amount', 'type', 'status', 'reg', 'recharge_amount'];

        $this_val = pow(2, intval($this->permission['placeholder_1']) - 1);
        $val = $this->getPagePermission();
        if ($this->user->permission === null || ($this_val & $val) == $this_val) {
            $field = array_merge($field, ['winning_amount', 'exchange_amount']);
        }

        $total = $query->count();
        $list = $query
            ->select($field)
            ->orderBy('status', 'asc')
            ->orderBy('id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        foreach ($list as $k => $v) {
            if ($this->user->permission === null || ($this_val & $val) == $this_val) {
                $list[$k]->consumer_amount = $v->recharge_amount + $v->exchange_amount - $v->residual_amount;
                if ($list[$k]->consumer_amount) {
                    $list[$k]->probability = (float)number_format(abs($list[$k]->winning_amount / $list[$k]->consumer_amount) * 100, 2, '.', '');
                } else if ($list[$k]->winning_amount) {
                    $list[$k]->probability = 100;
                } else {
                    $list[$k]->probability = 0;
                }
            }
            $list[$k]->Address = preg_match('/^\d{1,3}\\.\d{1,3}\\.\d{1,3}\\.\d{1,3}$/', $v->create_ip) ? Helper::ipToAddress($v->create_ip) : '-';
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    /**
     * 修改用户类型
     * @param Request $request
     * @return array
     */
    public function editUserType(Request $request)
    {
        $id = $request->input('id');
        $type = $request->input('type');

        if (!$id || !is_numeric($type)) {
            throw new \Exception('请输入id和类型！！！', 1001);
        }

        $data['type'] = $type;

        $re = DB::table('user')->where(['id' => $id])->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$re}，修改用户类型", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功', 'data' => $re];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 解绑手机
     * @param Request $request
     * @return array
     */
    public function relievePhone(Request $request)
    {
        $id = $request->input('id');

        if (!$id) {
            throw new \Exception('请输入用户id！！！', 1001);
        }

        $data['phone'] = null;

        $re = DB::table('user')->where(['id' => $id])->update($data);
        $re2 = DB::connection('anyou')->table('vip')->where(['uid' => $id])->update(['photo' => '','password'=>'']);

        if ($re || $re2) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "user_id：{$id}，解除用户手机绑定", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '解绑成功', 'data' => $re];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 禁用用户账号
     * @param Request $request
     * @return array
     */
    public function disableAccount(Request $request)
    {
        $id = $request->input('id');

        if (!$id) {
            throw new \Exception('请输入用户id！！！', 1001);
        }

        $data['status'] = 2;
        $re = DB::table('user')->where([['id', $id], ['type', 0]])->update($data);
        $re2 = DB::connection('anyou')->table('vip')->where([['uid', $id], ['abot', 0]])->update(['abot' => 1]);

        if ($re || $re2) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "user_id：{$id}，禁用用户账号", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '账号已禁用', 'data' => $re];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }
}
