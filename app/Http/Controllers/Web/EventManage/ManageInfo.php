<?php

namespace App\Http\Controllers\Web\EventManage;

use Illuminate\Http\Request;
use DB;

class ManageInfo extends AbsEventManage
{
    public $permission = [
        'execute' => 1,
        'edit' => 1
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['708']??0;
    }

    /**
     *  活动详情
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $id = $request->input('id');

        if (!$id) throw new \Exception('请输入活动id！！！', 1001);

        $data = DB::table('event')->select('id', 'title', 'begin_at', 'end_at')->where('id', $id)->first();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     * 编辑活动
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function edit(Request $request)
    {
        $id = $request->input('id');
        $title = $request->input('title');
        $begin_at = $request->input('begin_at');
        $end_at = $request->input('end_at');

        if (!$id || !$title) {
            throw new \Exception('资料填写不正确！！！', 1001);
        }

        $data['title'] = $title;
        if ($begin_at) $data['begin_at'] = $begin_at.' 00:00:00';
        if ($end_at) $data['end_at'] = $end_at.' 23:59:59';

        $re = DB::table('event')->where('id', $id)->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，活动管理编辑", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '编辑成功'];
        } else {
            return ['errcode' => 1010, 'msg' => '没有数据被修改'];
        }
    }

}
