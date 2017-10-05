<?php

namespace App\Http\Controllers\Web\VipManage;

use App\Http\Controllers\Web\AbsResponse;
use Illuminate\Http\Request;

/**
 * VIP客户管理
 * Class AbsVipManage
 * @package App\Http\Controllers\Web\VipManage
 */
abstract class AbsVipManage extends AbsResponse
{
    /**
     * 获取推广员
     * @param int $type (1=>推广员，3=>主管,2=>副主管)
     * @return array
     */
    public function getPromoters(Request $request)
    {
        $data = [];
        $data2 = [];

        $type = $request->input('type', 1);
        $style = $request->input('style', 1);

        $permissions_admin_id = \App\Models\Web\Admin::getPermissionsAdminId($this->user, 0, 0, 1);

        if (in_array($type, [1])) {
            $data = \DB::table('admin as a')
                ->leftJoin('admin_group as ag', 'ag.id', '=', 'a.group_id')
                ->select('a.id', 'a.truename', 'a.account')
                ->where([['ag.type', 2]])
                ->whereIn('a.id', $permissions_admin_id)
                ->orderBy('a.truename', 'asc')
                ->distinct()
                ->get();
        }
        if (in_array($type, [2, 3])) {
            $data = \DB::table('admin_group as ag')
                ->leftJoin('admin as a', 'a.group_id', '=', 'ag.id')
                ->select('a.id', 'a.truename', 'a.account', 'a.group_id')
                ->where([['a.type', 3], ['ag.type', 2]])
                ->whereIn('a.id', $permissions_admin_id)
                ->orderBy('a.truename', 'asc')
                ->distinct()
                ->get();
        }

        foreach ($data as $k => $v) {
            $data[$k]->truename = $v->truename . "-" . $v->account;
        }

        if ($style == 1) {
            $data2 = &$data;
        } else if ($style == 2) {
            foreach ($data as $k => $v) {
                $data2[$v->truename] = $v->id;
            }
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data2];
    }

}
