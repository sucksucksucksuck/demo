<?php

namespace App\Models\Web;

use Illuminate\Database\Eloquent\Model;
use DB;

class Admin extends Model
{
    /**
     * 获取权限对应的管理员id
     * @param object $obj user对象
     * @param int $mode 模式[1:root节点，2:上级节点]
     * @param int $status 管理员禁用
     * @return array
     */
    static public function getPermissionsAdminId($obj, $mode = 0, $status = 0, $delete = 0,$type = 0)
    {
        $group_id_user = [];

        $re = DB::table('admin_group')
            ->select('id', 'pid')
            ->get();

        $query = DB::table('admin as a')
            ->leftJoin('admin_group as ag','ag.id','=','a.group_id');

        if ($obj->permission !== null) {
            if (!is_array($obj->lock)) $obj->lock = json_decode($obj->lock??'[]', true);
            $admin_group = DB::table('admin_group')->select('type', 'pid')->where('id', $obj->group_id)->first();
            if ($mode == 1) {
                $root_id = [];
                if ($obj->type < 4) {
                    $root_id[] = Admin::roleRootId($re, $obj->group_id);
                } else {
                    foreach ($obj->lock as $v) {
                        $root_id = array_merge($root_id, [Admin::roleRootId($re, $v)]);
                    }
                }
                $root_id = array_unique($root_id);
                $group_id_user = Admin::roleTree($re, $root_id);
            } else if ($mode == 2) {
                if ($obj->type < 4) {
                    $group_id_user = Admin::roleTree($re, [$admin_group->pid]);
                } else {
                    $pid = array_unique(DB::table('admin_group')->whereIn('id', $obj->lock)->pluck('pid')->toArray());
                    $group_id_user = Admin::roleTree($re,$pid);
                }
            } else {
                if ($obj->type == 1) {
                    return [$obj->id];
                } else if ($obj->type == 2) {
                    $group_id_user = Admin::roleTree($re, [intval($obj->group_id)]);
                } else if ($obj->type == 3) {
                    $group_id_user = Admin::roleTree($re, [intval($obj->group_id)]);
                    $group_id_user[] = intval($obj->group_id);
                } else if ($obj->type == 4) {
                    $group_id_user = Admin::roleTree($re, $obj->lock);
                    $group_id_user = array_merge($group_id_user, $obj->lock);
                }
            }
            $query->whereIn('a.group_id', $group_id_user);
        }

        if ($status > 0) {
            $query->where('a.status', $status);
        } else if ($status < 0) {
            $status = abs($status);
            if ($status == 1) {
                $query->where('a.status', $status)->whereNull('a.delete_at');
            } else if ($status == 2) {
                $query->where(function ($query) use ($status) {
                    $query->where('a.status', $status);
                    $query->orWhere(function ($query) {
                        $query->whereNotNull('a.delete_at');
                    });
                });
            }
        }
        if ($delete == 1) {
            $query->whereNull('a.delete_at');
        } else if ($delete == 2) {
            $query->whereNotNull('a.delete_at');
        }
        if($type){
            $query->where('ag.type',$type);
        }

        $list = $query->where('a.id', '!=', 1)
            ->pluck('a.id')->toArray();

        return $list;
    }

    /**
     * 递归子类
     * @param $list
     * @param array $pid
     * @return array
     */
    static private function roleTree($list, $pid = [0])
    {
        $tree = [];
        foreach ($list as $k => $v) {
            if (in_array(intval($v->pid), $pid)) {
                $tree[] = $v->id;
                $tree = array_merge($tree, Admin::roleTree($list, [intval($v->id)]));
            }
        }
        return $tree;
    }

    /**
     * 递归root节点
     * @param $list
     * @param int $group_id
     * @param int $root_id
     * @param int $level
     * @return int
     */
    static private function roleRootId($list, $group_id = 0, $root_id = 1, $level = 1)
    {
        if ($level > 100) return -1;
        foreach ($list as $k => $v) {
            if ($v->id == $group_id) {
                if ($v->pid == $root_id) {
                    return $v->id;
                } else {
                    return Admin::roleRootId($list, $v->pid, $root_id, $level + 1);
                }
            }
        }
        return -1;
    }
}
