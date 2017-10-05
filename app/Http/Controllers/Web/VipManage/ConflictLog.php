<?php

namespace App\Http\Controllers\Web\VipManage;

use Illuminate\Http\Request;
use DB;

class ConflictLog extends AbsVipManage
{
    public $permission = [
        'execute' => 1,
        'settle' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1504']??0;
    }

    /**
     * 冲突日志
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $user_id = intval($request->input('user_id'));
        $operator = $request->input('operator');
        $status = intval($request->input('type'));

        $query = DB::table('admin_join_user as aju')
            ->leftJoin('admin as a', 'a.id', '=', 'aju.operator_id')
            ->leftJoin('admin as a2', 'a2.id', '=', 'aju.admin_id');

        $is_where = false;
        if ($user_id) {
            $is_where =true;
            $query->where([['aju.user_id', $user_id]]);
        }
        if ($operator){
            $is_where =true;
            $query->where('a.truename', 'like', "%{$operator}%");
        }
        if ($status){
            $is_where =true;
            $query->where('aju.status', $status);
        }

        //$permissions_admin_id = \App\Models\Web\Admin::getPermissionsAdminId($this->user);
        //$query->whereIn('aju.admin_id',$permissions_admin_id);
        if(!$is_where){
            $query->where([['aju.status',2],['aju.type', 2]]);
        }

        $total = $query->count();
        $list = $query
            ->select('aju.id', 'aju.user_id', 'aju.status', 'aju.create_at', 'aju.update_at',
                'a.truename',
                'a2.truename as promoters_truename'
            )
            ->orderBy('aju.user_id', 'desc')
            ->orderBy('aju.id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    /**
     * 处理vip冲突
     * @param Request $request
     * @return array
     */
    public function settle(Request $request)
    {
        $id = $request->input('id');

        if (!$id) {
            throw new \Exception('请输入id！！！', 1001);
        }

        $aju_info = DB::table('admin_join_user')->select('user_id','status')->where('id', $id)->first();
        if ($aju_info->status == 3) {
            throw new \Exception('次关联数据已解决！！！', 1001);
        }

        $re = DB::table('admin_join_user')->where('id', $id)->update(['status' => 1, 'type' => 1, 'update_at' => date('Y-m-d H:i:s')]);
        $re2 = DB::table('admin_join_user')->where([['id', '!=', $id], ['user_id', $aju_info->user_id],['status' ,'<', 3]])->update(['status' => 3,'type' => 2, 'update_at' => date('Y-m-d H:i:s')]);

        if ($re) {
            $log = ['id' => $id, 'user_id' => "{$aju_info->user_id}", 'msg' => '解除vip争议'];
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => json_encode($log, JSON_UNESCAPED_UNICODE), 'type' => 11, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功'];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }


}
