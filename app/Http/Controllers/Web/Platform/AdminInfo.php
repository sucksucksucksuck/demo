<?php

namespace App\Http\Controllers\Web\Platform;

use App\Common\Helper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;

class AdminInfo extends AbsPlatform
{
    public $permission = [
        'execute' => 1,
        'create' => 2,
        'edit' => 3
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1202']??0;
    }

    /**
     *  管理员信息
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $id = $this->forArr($request->input('id'));

        if (!$id) return ['errcode' => 1001, 'msg' => '请输入id！！！'];

        $admin = DB::table('admin as a')
            ->leftJoin('admin_group as ag', 'ag.id', '=', 'a.group_id')
            ->select('a.id', 'a.account', 'a.phone', 'a.truename', 'a.last_login_at', 'a.create_at', 'a.status', 'a.group_id', 'a.icon', 'a.sex', 'a.employee_id',
                'ag.title')
            ->where('a.id', $id)
            ->first();
        if (empty($admin->group_id)) $admin->title = '超级管理员';

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $admin];
    }

    /**
     *  添加管理员
     * @param Request $request
     * @return array
     */
    public function create(Request $request)
    {
        $employee_id = $request->input('employee_id');
        $truename = $request->input('truename');
        $account = $request->input('account');
        $phone = $request->input('phone');
        $group_id = $request->input('group_id');
        $sex = $request->input('sex');

        if (!$truename || !$account || !$phone || !$group_id || !$sex) return ['errcode' => 1001, 'msg' => '请输入完整信息！！'];
        if ($employee_id) {
            if (strlen($employee_id) > 24) {
                throw new \Exception('您的工号太长了！！！', 1006);
            }
            $db_employee_id = DB::table('admin')->where(['employee_id' => $employee_id])->value('employee_id');
            if ($db_employee_id) {
                return ['errcode' => 1002, 'msg' => '工号已存在！！'];
            }
        }
        $db_account = DB::table('admin')->where(['account' => $account])->value('account');
        if ($db_account) {
            return ['errcode' => 1003, 'msg' => '账号已存在！！'];
        }

        //保存图片
        $path = '';
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            if ($file->getSize() > 2048000) {
                return ['errcode' => 1201, 'msg' => "图片超过了2M！"];
            }
            if (!in_array($file->getMimeType(), array('image/jpeg', 'image/gif', 'image/jpg', 'image/png', 'image/bmp'))) {
                return ['errcode' => 1202, 'msg' => "图片类型不正确！"];
            }

            if ($file->isValid()) {
                $client_name = $file->getClientOriginalName();
                $entension = $file->getClientOriginalExtension();
                $new_name = md5(date("Y-m-d H:i:s") . $client_name) . "." . $entension;

                $img_path = 'upload/admin/' . date('Y_m') . '/' . date('d') . '/';
                $url_path = asset($img_path . $new_name);
                $file_path = public_path($img_path);

                $file->move($file_path, $new_name);
                $path = $url_path;
            }
        }

        $data = [];
        if ($employee_id) $data['employee_id'] = $employee_id;
        $data['truename'] = $truename;
        $data['account'] = $account;
        $data['phone'] = $phone;
        $group_son = DB::table('admin_group')->where('pid',$group_id)->value('id');
        $data['type'] = $group_son?3:1;
        $data['group_id'] = $group_id;
        $data['site'] = $this->user->site??1;

        $permission = DB::table('admin_group')->where(['id' => $group_id])->value('permission');
        if ($permission) {
            $data['permission'] = $permission;
        } else {
            $data['permission'] = '[]';
        }

        $data['sex'] = $sex;
        if ($path) $data['icon'] = $path;

        $password = mt_rand(129830, 971352);
        $data['password'] = Helper::password($password);
        $data['use_pwd'] = 0;
        $data['site'] = config('app.site');
        $re = DB::table('admin')->insertGetId($data);
        Helper::sendSMS($phone, $truename . '您的临时密码是：' . $password . '，登陆后请立即修改密码！', 3);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$re}，管理员添加", 'type' => 2, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '添加成功'];
        } else {
            return ['errcode' => 2101, 'msg' => '添加失败'];
        }
    }

    /**
     *  编辑管理员
     * @param Request $request
     * @return array
     */
    public function edit(Request $request)
    {
        $id = $request->input('id');
        $employee_id = $request->input('employee_id');
        $truename = $request->input('truename');
        $account = $request->input('account');
        $phone = $request->input('phone');
        $group_id = $request->input('group_id');
        $status = $request->input('status');
        $sex = $request->input('sex');
        $permission = $request->input('permission');

        if (!$id || $id == 1 || !$group_id || !$sex) return ['errcode' => 1001, 'msg' => '请输入完整信息！！'];

        if ($employee_id) {
            $employee_id_true = DB::table('admin')->where([['id', '!=', $id], ['employee_id', $employee_id]])->value('employee_id');
            if ($employee_id_true) return ['errcode' => 1001, 'msg' => '工号已存在！！'];
        }
        if ($account) {
            $db_account = DB::table('admin')->where([['id', '!=', $id], ['account', $account]])->value('account');
            if ($db_account) {
                return ['errcode' => 1003, 'msg' => '账号已存在！！'];
            }
        }

        //保存图片
        $path = '';
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            if ($file->getSize() > 2097152) {
                return ['errcode' => 1001, 'msg' => "图片超过了2M！"];
            }
            if (!in_array($file->getMimeType(), array('image/jpeg', 'image/gif', 'image/jpg', 'image/png', 'image/bmp'))) {
                return ['errcode' => 1002, 'msg' => "图片类型不正确！"];
            }

            if ($file->isValid()) {
                $client_name = $file->getClientOriginalName();
                $entension = $file->getClientOriginalExtension();
                $new_name = md5(date("Y-m-d H:i:s") . $client_name) . "." . $entension;

                $img_path = 'upload/admin/' . date('Y_m') . '/' . date('d') . '/';
                $url_path = asset($img_path . $new_name);
                $file_path = public_path($img_path);

                $file->move($file_path, $new_name);
                $path = $url_path;
            }
        }

        if ($permission) {
            foreach ($permission as $k => $v) {
                $num = 0;
                foreach ($v as $v2) {
                    $num += pow(2, $v2 - 1);
                }
                if ($num) {
                    $permission[$k] = $num;
                } else {
                    unset($permission[$k]);
                }
            }
        }

        $data = [];
        $data['employee_id'] = $employee_id;
        if ($truename) $data['truename'] = $truename;
        if ($account) $data['account'] = $account;
        if ($phone) $data['phone'] = $phone;
        if ($group_id) {
            $data['group_id'] = $group_id;
            $db_group_id = DB::table('admin')->where(['id' => $id])->value('group_id');

            if ($db_group_id != $group_id) {
                $permission = DB::table('admin_group')->where(['id' => $group_id])->value('permission');
                if ($permission) {
                    $data['permission'] = $permission;
                } else {
                    $data['permission'] = '[]';
                }
            }
        }
        if ($status) $data['status'] = $status;
        if ($sex) $data['sex'] = $sex;
        if ($path) $data['icon'] = $path;

        $userinfo = DB::table('admin')->select('icon')->where(['id' => $id])->first();
        if ($path && $userinfo['icon']) {
            $tempu = parse_url($userinfo['icon']);
            @unlink($_SERVER['DOCUMENT_ROOT'] . $tempu['path']);
        }
        $re = DB::table('admin')->where(['id' => $id])->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$id}，管理员信息修改", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功'];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

    /**
     *  修改自己的信息
     * @param Request $request
     * @return array
     */
    public function myInfo(Request $request)
    {
        $truename = $request->input('truename');
        $account = $request->input('account');
        $phone = $request->input('phone');

        //保存图片
        $path = '';
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            if ($file->getSize() > 2097152) {
                return ['errcode' => 1001, 'msg' => "图片超过了2M！"];
            }
            if (!in_array($file->getMimeType(), array('image/jpeg', 'image/gif', 'image/jpg', 'image/png', 'image/bmp'))) {
                return ['errcode' => 1002, 'msg' => "图片类型不正确！"];
            }

            if ($file->isValid()) {
                $client_name = $file->getClientOriginalName();
                $entension = $file->getClientOriginalExtension();
                $new_name = md5(date("Y-m-d H:i:s") . $client_name) . "." . $entension;

                $img_path = 'upload/admin/' . date('Y_m') . '/' . date('d') . '/';
                $url_path = asset($img_path . $new_name);
                $file_path = public_path($img_path);

                $file->move($file_path, $new_name);
                $path = $url_path;
            }
        }

        $data = [];
        if ($truename) $data['truename'] = $truename;
        if ($this->user->id > 1 && $account) $data['account'] = $account;
        if ($phone) $data['phone'] = $phone;
        if ($path) $data['icon'] = $path;

        $userinfo = DB::table('admin')->select('icon')->where(['id' => $this->user->id])->first();
        if ($path && $userinfo->icon) {
            $tempu = parse_url($userinfo->icon);
            @unlink($_SERVER['DOCUMENT_ROOT'] . $tempu['path']);
        }
        $re = DB::table('admin')->where(['id' => $this->user->id])->update($data);

        if ($re) {
            $user = DB::table('admin as a')->leftJoin('admin_group as ag', 'ag.id', '=', 'a.group_id')->select('a.*', 'ag.title')->where(['a.id' => $this->user->id])->first();
            $user->title = $user->group_id ? $user->title : '超级管理员';
            if ($user->permission) {
                $user->permission = json_decode($user->permission, true);
            }
            session(['admin' => $user]);
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "修改自己信息", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功'];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

}
