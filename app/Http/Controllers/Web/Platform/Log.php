<?php

namespace App\Http\Controllers\Web\Platform;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Log extends AbsPlatform
{
    public $permission = [
        'execute' => 1
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1203']??0;
    }

    /**
     *  日志列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $id = $request->input('id');

        if (!$id) return ['errcode' => 1001, 'msg' => '请输入id！！！'];

        $query = DB::table('admin_log');
        $query->where('admin_id', $id);

        $list = $query
            ->select('id', 'type', 'log', 'create_at', 'ip')
            ->orderBy('create_at', 'desc')
            ->where('create_at', '>', date('Y-m-d', strtotime('-30 day')))
            ->forPage($this->page, $this->page_size)
            ->get();

        $user_info = DB::table('admin as a')
            ->leftJoin('admin_group as ag', 'ag.id', '=', 'a.group_id')
            ->select('a.id', 'a.account', 'a.phone', 'a.truename', 'a.employee_id', 'a.sex', 'a.create_at', 'a.status', 'a.group_id', 'ag.title')
            ->where('a.id', $id)
            ->first();
        if (!$user_info->group_id) $user_info->title = '超级管理员';

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['user_info' => $user_info, 'rows' => $list, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }


}
