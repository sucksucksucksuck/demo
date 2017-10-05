<?php

namespace App\Http\Controllers\Web\Platform;

use App\Common\Helper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminPermission extends AbsPlatform
{
    public $permission = [
        'execute' => 1,
        'editPermission' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1205']??0;
    }

    /**
     * 获取管理员权限信息
     * @param Request $request
     */
    public function execute(Request $request){
        $id = $request->input('id');

        if ($id == 1) $id = 0;

        $check = DB::table('admin')->where(['id' => $id])->value('permission');
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
     * 编辑权限
     * @param Request $request
     */
    public function editPermission(Request $request){
        $id = $request->input('id');
        $permission = $request->input('permission', '[]');

        if (!$id || $id == 1) return ['errcode' => 1001, 'msg' => '请输入id！！！'];

        if($permission === null || $permission == 'null')$permission = '[]';
        $data['permission'] = $permission;

        $re = DB::table('admin')->where(['id' => $id])->whereNotNull('permission')->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$re}，编辑用户权限", 'type' => 2, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功', 'data' => $re];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

}
