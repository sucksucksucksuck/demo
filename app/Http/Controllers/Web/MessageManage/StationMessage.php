<?php

namespace App\Http\Controllers\Web\MessageManage;

use Illuminate\Http\Request;
use DB;

/**
 * 站内消息
 * Class LevelSearch
 * @package App\Http\Controllers\Web\TurntableManage
 */
class StationMessage extends AbsMessageManage
{
    public $permission = [
        'execute' => 1,
        'getInfo' => 1,
        'create' => 2,
        'del' => 3
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['802']??0;
    }

    /**
     *  站内消息
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $title = $request->input('title');
        $content = $request->input('content');
        $user_id = $request->input('user_id');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');
        $type = $request->input('type');

        $query = DB::table('app_message as am')
            ->leftJoin('admin as a', 'a.id', '=', 'am.admin_id');
        if ($title)
            $query->where('am.title', 'like', "%{$title}%");
        if ($content)
            $query->where('am.content', 'like', "%{$content}%");
        if ($user_id && $user_id == '全体')
            $query->whereNull('am.user_id');
        else if ($user_id)
            $query->where('am.user_id', 'like', "%\"{$user_id}\"%");
        if ($start_time)
            $query->where('am.create_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query->where('am.create_at', '<=', trim($end_time) . ' 23:59:59');
        if ($type)
            $query->where('am.type', $type);
        $query->whereIn('am.type', [2, 3])->whereNull('am.delete_at');

        $total = $query->count();
        $list = $query
            ->select('am.*', 'a.truename')
            ->orderBy('am.id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        foreach ($list as $k => $v) {
            $list[$k]->user_id = implode(',', json_decode($list[$k]->user_id??'[]', true));
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    public function getInfo(Request $request)
    {
        $id = $request->input('id');

        if (!$id) {
            throw new \Exception('请输入id！！！', 1001);
        }

        $data = DB::table('app_message')->select('id', 'title', 'icon', 'content', 'visible', 'event_id', 'user_id')->where('id', $id)->first();
        if ($data) {
            $data->user_id = implode(',', json_decode($data->user_id??'[]', true));
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     *  创建站内消息
     * @param Request $request
     * @return array
     */
    public function create(Request $request)
    {
        $data = [];

        $title = $request->input('title', '盘古商城');
        $user_id = $request->input('user_id', '');
        $content = $request->input('content', '');
        $type = $request->input('type', 2);

        if ($user_id && !preg_match('/^([\d]{1,12})([，；,;#][\d]{1,12}){0,50}$/', $user_id, $arr)) {
            throw new \Exception('id格式错误！！！', 1001);
        }

        if ($type == 3 && iconv_strlen($title, "UTF-8") > 36) {
            throw new \Exception('标题长度超出范围！！！', 1003);
        }

        if ($type == 3 && iconv_strlen($content, "UTF-8") > 180) {
            throw new \Exception('内容长度超出范围！！！', 1002);
        }

        if ($user_id) {
            $user_id = explode(',', str_replace(array("，", "；", ";", "#", ".", "|", " "), ',', $user_id));
            $data['user_id'] = json_encode($user_id);
        }
        $data['type'] = $type;
        $data['content'] = $content;
        $data['title'] = $title;
        $data['admin_id'] = $this->user->id;

        $re = DB::table('app_message')->insertGetId($data);

        if ($re) {
            $user_id = json_encode($user_id);
            $log = ['id' => $re, 'user_id' => "{$user_id}", 'msg' => '推送站内消息'];
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => json_encode($log, JSON_UNESCAPED_UNICODE), 'type' => 2, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '添加成功'];
        } else {
            return ['errcode' => 4002, 'msg' => '添加失败'];
        }
    }

    /**
     * 删除消息
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function del(Request $request)
    {
        $id = $request->input('id');

        if (!$id) {
            throw new \Exception('请输入id！！！', 1001);
        }

        $re = DB::table('app_message')->where([['id', $id]])->whereIn('type', [2, 3])->update(['delete_at' => date('Y-m-d H:i:s')]);

        if ($re) {
            $log = ['id' => $re, 'msg' => '删除站内消息'];
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => json_encode($log, JSON_UNESCAPED_UNICODE), 'type' => 4, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '删除成功'];
        } else {
            return ['errcode' => 4002, 'msg' => '没有数据被修改'];
        }
    }

}
