<?php

namespace App\Http\Controllers\Web\Platform;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Role extends AbsPlatform
{
    public $permission = [
        'execute' => 1,
        'permission' => 2,
        'create' => 3,
        'edit' => 4,
        'del' => 5,
        'updateAdminPermission' => 6,
        'editPermission' => 7,
        'singlePermission' => 8
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1204']??0;
    }

    /**
     *  角色列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        return parent::roleList($request);
    }

    /**
     *  获取角色权限
     * @param Request $request
     * @return array
     */
    public function permission(Request $request)
    {
        $id = $request->input('id');

        if ($id == 1) $id = 0;

        $check = DB::table('admin_group')->where(['id' => $id])->whereNull('delete_at')->value('permission');
        $check = json_decode($check, true)??[];

        $permission = $this->user->permission??[];

        $re = DB::table('menu')->select('id', 'pid', 'title', 'button')->where(['status' => 1])->orderBy('sort', 'desc')->get();

        $data['check'] = $check;
        $data['list'] = $this->permissionTree($re, $permission);

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    private function permissionTree($list, $permission, $pid = 0)
    {
        $tree = [];
        $permission_key = array_keys($permission);
        foreach ($list as $v) {
            if ($v->pid == $pid) {
                if ($this->user->permission !== null  && !in_array($v->id, $permission_key)) {
                    continue;
                }
                $v->son = $this->permissionTree($list, $permission, $v->id);

                $v->button = json_decode($v->button??'[]', true);
                $button = [];
                foreach ($v->button as $kk => $vv) {
                    if ($this->user->permission !== null ) {
                        if (!empty($permission[$v->id])) {
                            $num = pow(2, $kk);
                            if (($permission[$v->id] & $num) != $num)
                                continue;
                        } else {
                            continue;
                        }
                    }
                    $button[] = ['value' => $kk, 'title' => $vv];
                }
                $v->button = $button;
                $tree[] = $v;
            }
        }
        return $tree;
    }

    /**
     *  新建角色
     * @param Request $request
     * @return array
     */
    public function create(Request $request)
    {
        $title = $request->input('title');
        $pid = $request->input('pid');
        $type = $request->input('type',1);
        $button = $request->input('button',1);

        if (!$title) return ['errcode' => 1001, 'msg' => '请输入角色名！！！'];
        if (strlen($title) > 33) {
            throw new \Exception('您的角色名太长了！！！', 1003);
        }
        $exist_title = DB::table('admin_group')->where(['title' => $title])->value('id');
        if ($exist_title) return ['errcode' => 1002, 'msg' => '角色名已存在！！！'];

        if($this->user->permission === null  && ($pid == -1 || $button == 2)){
            $pid = 1;
        }else if($this->user->permission !== null  && $pid == -1){
            $pid = $this->user->group_id;
        }

        $data['title'] = $title;
        $data['pid'] = $pid;
        $data['permission'] = '[]';
        $data['type'] = $type;

        $re = DB::table('admin_group')->insertGetId($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$re}，添加角色", 'type' => 2, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => 'ok'];
        }
    }

    /**
     *  编辑权限
     * @param Request $request
     * @return array
     */
    public function editPermission(Request $request)
    {
        $id = $request->input('id');
        $permission = $request->input('permission', '[]');

        if (!$id || $id == 1) return ['errcode' => 1001, 'msg' => '请输入id！！！'];

        if($permission === null || $permission == 'null')$permission = '[]';
        $data['permission'] = $permission;

        $re = DB::table('admin_group')->where(['id' => $id])->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$re}，编辑角色权限", 'type' => 2, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功', 'data' => $re];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

    /**
     *  编辑角色
     * @param Request $request
     * @return array
     */
    public function edit(Request $request)
    {
        $id = $request->input('id');
        $pid = $request->input('pid');
        $title = $request->input('title');
        $type = $request->input('type',1);
        $describe = $request->input('describe');

        if (!$id) return ['errcode' => 1001, 'msg' => '请输入id！！！'];

        $data = [];
        if ($pid) $data['pid'] = $pid;
        if ($title) {
            if (strlen($title) > 33) {
                throw new \Exception('您的角色名太长了！！！', 1003);
            }
            $data['title'] = $title;
        }
        $data['type'] = $type;
        if ($describe) $data['describe'] = $describe;

        $re = DB::table('admin_group')->where(['id' => $id])->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$re}，编辑角色", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功', 'data' => $re];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
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

        $re = DB::table('admin_group')->select('id', 'pid')->get();

        $group_id = $this->delTree($re, $id);
        $group_id[] = $id;

        $admin = DB::table('admin')->whereIn('group_id', $group_id)->whereNull('delete_at')->value('id');
        if ($admin) throw new \Exception('角色下还有用户未转移，请先清空角色下的用户！！！', 1002);

        $re = DB::table('admin_group')->whereIn('id', $group_id)->whereNull('delete_at')->update(['delete_at'=>date('Y-m-d H:i:s')]);

        if ($re) {
            $group_id = json_encode($group_id);
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$group_id}，删除角色", 'type' => 4, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '操作成功'];
        } else {
            return ['errcode' => 1003, 'msg' => '没有角色被删除'];
        }
    }

    private function delTree($list, $pid = 0)
    {
        $tree = [];
        foreach ($list as $k => $v) {
            if ($v->pid == $pid) {
                $tree[] = $v->id;
                unset($list[$k]);
                $tree = array_merge($tree, $this->delTree($list, $v->id));
            }
        }
        return $tree;
    }

    /**
     * 更新管理员权限
     * @param Request $request
     * @return array
     */
    public function updateAdminPermission(Request $request)
    {
        $id = $request->input('id');

        if (!$id) return ['errcode' => 1001, 'msg' => '请输入角色id！！！'];
        $permission = DB::table('admin_group')->where('id', $id)->value('permission');
        $re = DB::table('admin')->where([['group_id', $id]])->update(['permission' => $permission]);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "group_id：{$id}，更新管理员权限", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '操作成功'];
        } else {
            return ['errcode' => 1003, 'msg' => '没有权限被更新'];
        }
    }

    /**
     * 管理员单一权限修改
     * @param Request $request
     * @return array
     */
    public function singlePermission(Request $request)
    {
        $id = $request->input('id');
        $permission = $request->input('permission');
        $operation = $request->input('operation', 1);

        if (!$id || !$permission || !$operation) throw new \Exception('请输入完整参数！！！', 1001);

        $user_list = DB::table('admin')->select('id', 'permission', 'group_id')->where('group_id', $id)->get();
        if (!$user_list) throw new \Exception('角色下没有管理员！！！', 1001);
        $permission = json_decode($permission, true);
        $num = 0;
        foreach ($user_list as $v) {
            $v->permission = json_decode($v->permission, true);
            foreach ($permission as $k2 => $v2) {
                if (!isset($v->permission[$k2])) $v->permission[$k2] = 0;
                if ($operation == 1) {
                    $v->permission[$k2] = $v->permission[$k2] | $v2;
                } else {
                    $v->permission[$k2] = $v->permission[$k2] ^ $v2;
                }
                if ($v->permission[$k2] == 0) unset($v->permission[$k2]);
            }

            $re = DB::table('admin')->where([['id', $v->id]])->update(['permission' => json_encode($v->permission)]);
            if ($re) $num++;
        }

        $group_permission = DB::table('admin_group')->where('id', $id)->value('permission');
        $group_permission = json_decode($group_permission, true);
        foreach ($permission as $k2 => $v2) {
            if (!isset($group_permission[$k2])) $group_permission[$k2] = 0;
            if ($operation == 1) {
                $group_permission[$k2] = $group_permission[$k2] | $v2;
            } else {
                $group_permission[$k2] = $group_permission[$k2] ^ $v2;
            }
            if ($group_permission[$k2] == 0) unset($group_permission[$k2]);
        }
        $re = DB::table('admin_group')->where('id', $id)->update(['permission' => json_encode($group_permission)]);

        if ($num || $re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "group_id：{$id}，管理员单一权限修改", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '操作成功'];
        } else {
            return ['errcode' => 1003, 'msg' => '没有权限被更新'];
        }
    }
}
