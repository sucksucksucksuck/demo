<?php

namespace App\Http\Controllers\Web\VipManage;

use Illuminate\Http\Request;
use DB;

class OperationLog extends AbsVipManage
{
    public $permission = [
        'execute' => 1
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1505']??0;
    }

    /**
     * 操作日志
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $user_id = $request->input('user_id');
        $operation = $request->input('operation');
        $type = $request->input('type');

        $query = DB::table('admin_log as al')
            ->leftJoin('admin as a','a.id','=','al.admin_id');
        if ($user_id)
            $query->where('al.log', 'like', "%user_id\":\"{$user_id}\"%");
        if ($operation)
            $query->where('a.truename', 'like', "%{$operation}%");
        if ($type)
            $query->where('al.type', $type);

        //$permissions_admin_id = \App\Models\Web\Admin::getPermissionsAdminId($this->user);
        //$query->whereIn('a.id',$permissions_admin_id);
        $query->whereIn('al.type', [6,7,8,9,12]);

        $total = $query->count();
        $list = $query
            ->select('al.id', 'al.type',  'al.create_at', 'al.admin_id','al.log',
            'a.truename')
            ->orderBy('al.id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        foreach ($list as $k=>$v){
            $list[$k]->log = json_decode($list[$k]->log,true);
            $list[$k]->user_id = $list[$k]->log['user_id']??'-';
            $list[$k]->msg = $list[$k]->log['msg']??'-';
            unset($list[$k]->log);
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => [ 'rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

}
