<?php

namespace App\Http\Controllers\Web\UserManage;

use Illuminate\Http\Request;
use DB;
use App\Common\Helper;

class CustomerServiceManage extends AbsUserManage
{
    public $permission = [
        'execute' => 1,
        'editUserType' => 2,
        'relievePhone' => 3,
        'remark' => 4,
        'rechargeAmount' => 5,
        'disableAccount' => 6,
        'placeholder_1' => 7,
        'editNickName' => 8,
        'create' => 9
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['502']??0;
    }

    /**
     * 客服管理
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $id = $request->input('id');
        $nickname = $request->input('nickname');
        $phone = $request->input('phone');
        $device = $request->input('device');
        $create_start_time = $request->input('create_start_time');
        $create_end_time = $request->input('create_end_time');
        $idaf = $request->input('remark');
        $status = $request->input('status');
        $reg = $request->input('reg');
        $user_type = $request->input('user_type');

        $query = DB::table('user');

        if ($id) {
            $user_type = DB::table('user')->where('id', $id)->value('type');
            if (in_array($user_type, [0, 1])) {
                $type_info = [0 => '普通用户', 1 => '机器人'];
                $user_type = $type_info[$user_type]??'其他账号';
                throw new \Exception("你查询的ID是{$user_type}！！！", 4001);
            }
            $query->where('id', $id);
        }

        if ($id)
            $query->where('id', $id);
        if ($nickname)
            $query->where('nickname', 'like', "%" . $nickname . "%");
        if ($phone)
            $query->where('phone', 'like', "%" . $phone . "%");
        if ($device)
            $query->where('device', $device);
        if ($create_start_time)
            $query->where('create_at', '>=', trim($create_start_time) . ' 00:00:00');
        if ($create_end_time)
            $query->where('create_at', '<=', trim($create_end_time) . ' 23:59:59');
        if ($idaf)
            $query->where('idaf', 'like', "%" . $idaf . "%");
        if ($status)
            $query->where('status', $status);
        if (is_numeric($reg))
            $query->where('reg', $reg);
        if (is_numeric($user_type))
            $query->where('type', $user_type);

        $query->whereIn('type', [2, 3, 4]);
        $field = ['id', 'nickname', 'device', 'channel', 'phone', 'create_at', 'residual_amount', 'recharge_amount', 'type', 'status', 'reg'];

        $val = $this->getPagePermission();
        $this_val = pow(2, intval($this->permission['placeholder_1']) - 1);
        if ($this->user->permission === null || ($this_val & $val) == $this_val) {
            $field = array_merge($field, ['idaf as remark']);
        }

        $total = $query->count();
        $list = $query
            ->select($field)
            ->orderBy('type', 'desc')
            ->orderBy('status', 'asc')
            ->orderBy('id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    /**
     * 修改客服类型
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
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$re}，修改客服类型", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功', 'data' => $re];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 解绑客服手机
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
        $re = DB::table('user')->where(['id' => $id])->whereIn('type', [2, 3, 4])->update($data);
        $re2 = DB::connection('anyou')->table('vip')->where(['uid' => $id])->update(['photo' => '','password'=>'']);

        if ($re || $re2) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "user_id：{$id}，解除客服手机绑定", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '解绑成功', 'data' => $re];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 修改备注
     * @param Request $request
     * @return array
     */
    public function remark(Request $request)
    {
        $id = $request->input('id');
        $idaf = $request->input('remark', '');

        if (!$id) {
            throw new \Exception('请输入用户id！！！', 1001);
        }
        if (iconv_strlen($idaf, "UTF-8") > 64) {
            throw new \Exception('备注太长了，不能超过64个！！！', 1002);
        }
        $user_info = DB::table('user')->where(['id' => $id])->select('type')->first();
        if ($user_info->type == 0) {
            throw new \Exception('不能修改正常用户的备注！！！', 1003);
        }

        $data['idaf'] = $idaf;

        $re = DB::table('user')->where(['id' => $id])->whereIn('type', [2, 3, 4])->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$id}，修改客服备注", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改备注成功', 'data' => $re];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 修改充值金额
     * @param Request $request
     * @return array
     */
    public function rechargeAmount(Request $request)
    {
        $id = $request->input('id');
        $recharge_amount = intval($request->input('recharge_amount', 0));

        if (!$id) {
            throw new \Exception('请输入用户id！！！', 1001);
        }
        if ($recharge_amount > 1000000000 || $recharge_amount < -1000000000) {
            throw new \Exception('修改金额超出范围 1000000000 ~ -1000000000！！！', 1002);
        }

        $data['recharge_amount'] = $recharge_amount;

        $re = DB::table('user')->where(['id' => $id])->whereIn('type', [2, 3, 4])->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$re}，修改客服充值金额", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功', 'data' => $re];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 禁用客服账号
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
        $re = DB::table('user')->where(['id' => $id])->whereIn('type', [2, 3, 4])->update($data);
        $re2 = DB::connection('anyou')->table('vip')->where([['uid', $id], ['abot', 0]])->update(['abot' => 1]);

        if ($re || $re2) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "user_id：{$id}，禁用客服账号", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '账号已禁用', 'data' => $re];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 修改特殊用户昵称
     * @param Request $request
     * @return array
     */
    public function editNickName(Request $request)
    {
        $id = $request->input('id');
        $nickname = $request->input('nickname', '');

        if (!$id) {
            throw new \Exception('请输入用户id！！！', 1001);
        }
        if (iconv_strlen($nickname, "UTF-8") > 50) {
            throw new \Exception('昵称不能超过50个字符！！！', 1002);
        }
        $user_info = DB::table('user')->where(['id' => $id])->select('type')->first();
        if ($user_info->type != 3) {
            throw new \Exception('不能修改非特殊用户的昵称！！！', 1003);
        }

        $data['nickname'] = $nickname;

        $re = DB::table('user')->where([['id', $id], ['type', 3]])->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$id}，修改特殊用户昵称", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改昵称成功'];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 新建客服账号
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function create(Request $request)
    {
        $nickname = trim($request->input('nickname'));
        $residual_amount = $request->input('residual_amount', 0);
        $idaf = $request->input('idaf');

        if (!$nickname || (iconv_strlen($nickname, "UTF-8") > 50)) {
            throw new \Exception('请输入正确的用户昵称！！！', 1001);
        }
        if (!is_numeric($residual_amount) || ($residual_amount < 0 || $residual_amount > 1000000000)) {
            throw new \Exception('余额超出范围（0-10000000000）！！！', 1002);
        }
        if (!$idaf || (iconv_strlen($idaf, "UTF-8") > 64)) {
            throw new \Exception('备注长度超出范围 （64）！！！', 1003);
        }
        /*$db_nickname = DB::table('user')->where('nickname', $nickname)->first();
        if ($db_nickname) {
            throw new \Exception('用户昵称已存在！！！', 1004);
        }*/

        $db_phone = DB::table('user')->where([['phone', '>', 20000000000], ['phone', '<', 30000000000]])->orderBy('phone', 'desc')->value('phone')??20000000000;
        $db_phone++;

        $data['nickname'] = $nickname;
        $data['residual_amount'] = $residual_amount;
        $data['phone'] = $db_phone;
        $data['password'] = Helper::password('88888888');
        $data['type'] = 4;
        $data['create_ip'] = $request->getClientIp();
        if ($idaf) $data['idaf'] = $idaf;

        $data3['name'] = $nickname;
        $data3['jine'] = $residual_amount;
        $data3['photo'] = $db_phone;
        $data3['passs'] = Helper::password('88888888');
        $data3['abot'] = 4;
        $data3['ip'] = $request->getClientIp();
        $data3['pt'] = '';
        $data3['tgqd'] = '';
        $data3['dltime'] = 0;
        $data3['zfbid'] = '';
        $data3['zfbname'] = '';
        if ($idaf) $data3['idaf'] = $idaf;

        $user_id = 0;
        DB::connection('anyou')->beginTransaction();
        DB::beginTransaction();
        $uid = DB::connection('anyou')->table('vip')->insertGetId($data3);
        if ($uid) {
            $data['id'] = $uid;
            $user_id = DB::table('user')->insertGetId($data);
        }

        if ($uid && $user_id) {
            DB::connection('anyou')->commit();
            DB::commit();
            $data2['user_id'] = $user_id;
            $data2['phone'] = $data['phone'];
            $data2['nickname'] = $nickname;
            $data2['residual_amount'] = $residual_amount;
            $data2['idaf'] = $idaf;

            $log = ['user_id' => "{$user_id}", 'msg' => '添加客服账号'];
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => json_encode($log, JSON_UNESCAPED_UNICODE), 'type' => 2, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '添加成功', 'data' => $data2];
        } else {
            DB::connection('anyou')->rollBack();
            DB::rollBack();
            return ['errcode' => 4002, 'msg' => '添加失败'];
        }
    }
}
