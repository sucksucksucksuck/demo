<?php

namespace App\Http\Controllers\Web\Platform;

use App\Http\Controllers\Web\AbsResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

abstract class AbsPlatform extends AbsResponse
{
    /**
     *  角色列表
     * @param Request $request
     * @return array
     */
    public function roleList(Request $request)
    {
        $re = null;

        $style = $request->input('style', 1);

        if ($this->user->permission === null  || $this->user->type != 1) {
            $re = DB::table('admin_group')
                ->select('id', 'pid', 'title', 'type')
                ->whereNull('delete_at')
                ->get();
        }

        if ($this->user->permission !== null ) {
            if ($this->user->type == 1) {
                $list = DB::table('admin_group')
                    ->select('id', 'pid', 'title', 'type')
                    ->where('id', $this->user->group_id)
                    ->whereNull('delete_at')
                    ->get();
            } else if ($this->user->type == 2) {
                $list[] = DB::table('admin_group')
                    ->select('id', 'pid', 'title', 'type')
                    ->where('id', $this->user->group_id)
                    ->whereNull('delete_at')
                    ->first();
                $pid[] = $this->user->group_id;
                if ($style == 1) {
                    $list[0]->son = $this->roleTree($re, $pid, $style);
                } else {
                    $list = array_merge($list, $this->roleTree($re, $pid, $style));
                }
            } else if ($this->user->type == 3) {
                $list = $this->roleTree($re, [$this->user->group_id], $style, 1);
            } else if ($this->user->type == 4) {
                $list = $this->roleTree($re, $this->user->lock, $style, 1);
            } else {
                $list = $this->roleTree($re, $this->user->group_id, $style);
            }
        } else {
            $list = $this->roleTree($re, [1], $style);
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $list];
    }

    private function roleTree($list, $pid = [0], $style = 1, $self = 0)
    {
        $tree = [];
        foreach ($list as $k => $v) {
            if ($self) {
                if (in_array(intval($v->id), $pid)) {
                    if ($style == 1) {
                        $tree[] = $v;
                        unset($list[$k]);
                        $v->son = $this->roleTree($list, [$v->id], $style, 0);
                    }
                    if ($style == 2) {
                        $tree[] = $v;
                        unset($list[$k]);
                        $tree = array_merge($tree, $this->roleTree($list, [$v->id], $style, 0));
                    }
                }
            } else if (in_array(intval($v->pid), $pid)) {
                if ($style == 1) {
                    $tree[] = $v;
                    unset($list[$k]);
                    $v->son = $this->roleTree($list, [$v->id], $style, 0);

                }
                if ($style == 2) {
                    $tree[] = $v;
                    unset($list[$k]);
                    $tree = array_merge($tree, $this->roleTree($list, [$v->id], $style, 0));
                }
            }
        }
        return $tree;
    }

}
