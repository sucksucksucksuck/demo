<?php

namespace App\Http\Controllers\Web\Platform;

use App\Common\Helper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Admin extends AbsPlatform
{
    public $permission = [
        'execute' => 1,
        'getAdminInfo' => 1,
        'status' => 2,
        'resetPwd' => 3,
        'del' => 5,
        'dataPermission' => 6,
        'visitSite' => 7
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1201']??0;
    }

    /**
     *  管理员列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $employee_id = $request->input('employee_id');
        $status = $request->input('status');
        $group_id = $request->input('group_id');

        $re = DB::table('admin_group')
            ->select('id', 'pid', 'title')
            ->get();

        $query = DB::table('admin as a')
            ->leftJoin('admin_group as ag', 'ag.id', '=', 'a.group_id');

        if ($this->user->permission !== null ) {
            if ($this->user->type == 1) {
                $query->where('a.id', $this->user->id);
            } else if ($this->user->type == 2) {
                $group_id_user = $this->roleTree($re, [$this->user->group_id]);
                $query->where(function ($query) use ($group_id_user) {
                    $query->whereIn('a.group_id', $group_id_user);
                    $query->orWhere(function ($query) {
                        $query->where('a.id', $this->user->id);
                    });
                });
            } else if ($this->user->type == 3) {
                $group_id_user = $this->roleTree($re, [$this->user->group_id], 1);
                $query->whereIn('a.group_id', $group_id_user);
            } else if ($this->user->type == 4) {
                $group_id_user = $this->roleTree($re, $this->user->lock, 1);
                $query->whereIn('a.group_id', $group_id_user);
            }
        }

        if ($group_id) {
            $group_id_requ[] = $group_id;
            $query->whereIn('group_id', $group_id_requ);
        }

        if ($employee_id)
            $query->where(function ($query) use ($employee_id) {
                $query->where('a.employee_id', $employee_id);
                $query->orWhere(function ($query) use ($employee_id) {
                    $query->where('a.truename', 'like', "%{$employee_id}%");
                });
                $query->orWhere(function ($query) use ($employee_id) {
                    $query->where('a.account', 'like', "%{$employee_id}%");
                });

            });
        if ($status)
            $query->where('a.status', $status);
        if($this->user->permission !== null)
            $query->whereNotNull('a.permission');
        $query->whereNull('a.delete_at');

        $total = $query->count();
        $list = $query
            ->select('a.id', 'a.account', 'a.phone', 'a.truename', 'a.last_login_at', 'a.create_at', 'a.status', 'a.group_id', 'a.icon', 'a.sex', 'a.employee_id',
                'ag.title')
            ->orderBy('a.create_at', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size, 'status' => $status]]];
    }

    private function roleTree($list, $pid = [0], $self = 0)
    {
        $tree = [];
        foreach ($list as $k => $v) {
            if ($self) {
                if (in_array(intval($v->id), $pid)) {
                    $tree[] = $v->id;
                    $tree = array_merge($tree, $this->roleTree($list, [$v->id], 0));
                }
            } else if (in_array(intval($v->pid), $pid)) {
                $tree[] = $v->id;
                $tree = array_merge($tree, $this->roleTree($list, [$v->id], 0));
            }
        }
        return $tree;
    }

    /**
     *  获取管理员信息
     * @param Request $request
     * @return array
     */
    public function getAdminInfo(Request $request)
    {
        $id = $request->input('id');

        if (!$id) throw new \Exception('请输入id！！！', 1001);

        $data = DB::table('admin')->select('type', 'site', 'lock', 'group_id')->where(['id' => $id])->first();
        if (is_numeric($data->lock)) {
            $data->lock = [$data->lock];
        } else {
            $data->lock = json_decode($data->lock??'[]', true);
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     *  修改状态
     * @param Request $request
     * @return array
     */
    public function status(Request $request)
    {
        $id = $request->input('id');
        $status = $request->input('status');

        if (!$id || $id == 1) return ['errcode' => 1001, 'msg' => '请输入id！！！'];

        $re = DB::table('admin')->where('id', $id)->update(['status' => $status]);
        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，管理员状态修改", 'type' => 2, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功'];
        } else {
            return ['errcode' => 1002, 'msg' => '修改失败'];
        }
    }

    /**
     *  重置密码
     * @param Request $request
     * @return array
     */
    public function resetPwd(Request $request)
    {
        $id = $request->input('id');

        if (!$id && $id == 1) return ['errcode' => 1001, 'msg' => '请输入id！！！'];
        $phone = DB::table('admin')->where('id', $id)->value('phone');
        $password = mt_rand(105937, 984362);
        $sendInfo = Helper::sendSMS($phone, '您的临时密码是：' . $password . '，登陆后请立即修改密码！', 6);
        if (!$sendInfo) {
            throw new \Exception('密码发送失败！！！', 1002);
        }

        $data['password'] = Helper::password($password);
        $data['use_pwd'] = 0;
        $re = DB::table('admin')->where('id', $id)->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，重置密码，发送短信。", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功！'];
        } else {
            return ['errcode' => 1003, 'msg' => '没有数据被修改！'];
        }
    }

    /**
     *  删除
     * @param Request $request
     * @return array
     */
    public function del(Request $request)
    {
        $id = $request->input('id');

        if (!$id) return ['errcode' => 1001, 'msg' => '请输入id！！！'];
        if ($this->user->id == $id) return ['errcode' => 1002, 'msg' => '不能删除自己！！！'];

        $data['delete_at'] = date('Y-m-d H;i;s');
        $re = DB::table('admin')->where(['id' => $id])->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，删除账号。", 'type' => 4, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '删除成功！'];
        } else {
            return ['errcode' => 1003, 'msg' => '删除失败！'];
        }
    }

    /**
     *  数据权限
     * @param Request $request
     * @return array
     */
    public function dataPermission(Request $request)
    {
        $id = $request->input('id');
        $type = $request->input('type');
        $lock = $request->input('lock', null);

        if (!$id || !$type) throw new \Exception('请输入id和权限！！！', 1001);
        if ($type == 4 && !$lock) throw new \Exception('请输入节点！！！', 1002);

        $data['type'] = $type;
        $data['lock'] = $lock;
        $re = DB::table('admin')->where(['id' => $id])->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，数据权限。", 'type' => 4, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功！'];
        } else {
            return ['errcode' => 1003, 'msg' => '没有数据被修改！'];
        }
    }

    /**
     *  访问站点
     * @param Request $request
     * @return array
     */
    public function visitSite(Request $request)
    {
        $id = $request->input('id');
        $site = $request->input('site', 1);

        if (!$id || !is_numeric($site)) throw new \Exception('请输入id和站点id！！！', 1001);

        $data['site'] = $site;
        $re = DB::table('admin')->where(['id' => $id])->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，访问站点。", 'type' => 4, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功！'];
        } else {
            return ['errcode' => 2101, 'msg' => '没有数据被修改！'];
        }
    }


    /**
     *  修改密码
     * @param Request $request
     * @return array
     */
    public function changePwd(Request $request)
    {
        $Password = $request->input('password');
        $newPassword = $request->input('new_password');

        if (!isset($this->user->id) || $this->user->id == 1) return ['errcode' => 1001, 'msg' => '请先登录！！！'];
        if (!$Password || !$newPassword) return ['errcode' => 1002, 'msg' => '请输入密码！！！'];

        $data['password'] = Helper::password($newPassword);
        $data['use_pwd'] = 1;
        $re = DB::table('admin')->where(['id' => $this->user->id, 'password' => Helper::password($Password)])->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => '修改密码', 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功！'];
        } else {
            return ['errcode' => 1003, 'msg' => '没有数据被修改！'];
        }
    }

    /**
     *  订单操作员列表
     * @param Request $request
     * @return array
     */
    public function operatorList(Request $request)
    {
        $re = DB::table('admin_group')
            ->select('id', 'pid')
            ->get();

        $group_id = $this->operatorTree($re, $this->user->group_id);
        $group_id[] = $this->user->group_id;
        $query = DB::table('admin')->select('id', 'truename');
        if (!empty($this->user->group_id)) {
            $query->whereIn('group_id', $group_id);
        }
        $list = $query->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $list];
    }

    private function operatorTree($list, $pid = 0)
    {
        $tree = [];
        foreach ($list as $k => $v) {
            if ($v->pid == $pid) {
                $tree[] = $v->id;
                unset($list[$k]);
                $tree = array_merge($tree, $this->operatorTree($list, $v->id));
            }
        }
        return $tree;
    }

}
