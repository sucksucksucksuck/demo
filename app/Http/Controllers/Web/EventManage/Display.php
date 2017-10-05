<?php

namespace App\Http\Controllers\Web\EventManage;

use Illuminate\Http\Request;
use DB;

/**
 * 活动展示
 * Class Display
 * @package App\Http\Controllers\Web\EventManage
 */
class Display extends AbsEventManage
{
    public $permission = [
        'execute' => 1,
        'status' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['701']??0;
    }

    /**
     *  活动列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $status = $request->input('status');
        $title = $request->input('title');
        $type = $request->input('type');
        $id = $request->input('id');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');
        $visible = $request->input('visible');
        $sort_field = $request->input('sort_field', 'id');
        $sort = $request->input('sort', 'desc');

        $query = DB::table('app_event');
        if ($status)
            $query->where('status', $status);
        if ($title)
            $query->where(function ($query) use ($title) {
                $query->where('title', 'like', "%{$title}%");
                $query->orWhere(function ($query) use ($title) {
                    $query->where('describe', 'like', "%{$title}%");
                });
            });
        if ($type)
            $query->where('type', $type);
        if ($id)
            $query->where('id', $id);
        if ($start_time)
            $query->where('begin_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query->where('end_at', '<=', trim($end_time) . ' 23:59:59');
        if ($visible)
            $query->where('visible', $visible);

        $total = $query->count();
        $list = $query
            ->select('id', 'title', 'describe', 'icon', 'begin_at', 'end_at', 'type', 'status', 'sort', 'clicks', 'visible','action','url','extend')
            ->orderBy($sort_field, $sort)
            ->forPage($this->page, $this->page_size)
            ->get();

        foreach ($list as $k=>$v){
            $list[$k]->extend = json_decode($v->extend??'[]',true);
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    /**
     * 修改状态
     * @param Request $request
     * @throws \Exception
     */
    public function status(Request $request)
    {
        $id = $request->input('id');
        $status = $request->input('status');

        if (!$id || !$status) throw new \Exception('请输入活动id和修改的状态！！！', 1001);

        $re = DB::table('app_event')->where('id', $id)->update(['status' => $status]);
        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，活动" . $status == 1 ? '上线' : '下线', 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => $status == 1 ? '上线' : '下线' . '成功'];
        } else {
            return ['errcode' => 1002, 'msg' => $status == 1 ? '上线' : '下线' . '失败'];
        }
    }

    /**
     * 活动列表
     * @return array
     */
    public function eventList(Request $request)
    {
        $status = $request->input('status');
        $type = $request->input('type');
        $action = $request->input('action');

        $query = DB::table('app_event');
        if ($status)
            $query->where('status', $status);
        if ($type)
            $query->where('type', $type);
        if ($action)
            $query->where('action', $action);

        $query->where(function ($query){
            $query->where('end_at', '>=', date('Y-m-d H:i:s'));
            $query->orWhere(function ($query){
                $query->whereNull('end_at');
            });
        });

        $list = $query
            ->select('id', 'title', 'action','url','extend')
            ->orderBy('id', 'desc')
            ->limit(1000)
            ->get();

        foreach ($list as $k=>$v){
            $list[$k]->extend = json_decode($list[$k]->extend??'[]',true);
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $list];
    }
}
