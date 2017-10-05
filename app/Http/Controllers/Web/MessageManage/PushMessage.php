<?php

namespace App\Http\Controllers\Web\MessageManage;

use Illuminate\Http\Request;
use DB;

/**
 * 推送消息
 * Class PushMessage
 * @package App\Http\Controllers\Web\MessageManage
 */
class PushMessage extends AbsMessageManage
{
    public $permission = [
        'execute' => 1,
        'getInfo' => 1,
        'create' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['801']??0;
    }

    /**
     *  消息列表
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

        $query = DB::table('app_message as am')
            ->leftJoin('admin as a','a.id','=','am.admin_id')
            ->leftJoin('event as e','e.id','=','am.event_id');
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
        $query->where('am.type',1)->whereNull('am.delete_at');

        $total = $query->count();
        $list = $query
            ->select('am.*','a.truename','e.title as event_title')
            ->orderBy('am.id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        foreach ($list as $k => $v) {
            $list[$k]->user_id = implode(',',json_decode($list[$k]->user_id??'[]', true));
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    public function getInfo(Request $request){
        $id = $request->input('id');

        if (!$id) {
            throw new \Exception('请输入id！！！', 1001);
        }

        $data = DB::table('app_message')->select('id','title','icon','content','visible','event_id','user_id')->where('id',$id)->first();
        if($data){
            $data->user_id = implode(',',json_decode($data->user_id??'[]',true));
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' =>$data];
    }

    /**
     *  添加推送消息
     * @param Request $request
     * @return array
     */
    public function create(Request $request)
    {
        $data = [];

        $title = $request->input('title','盘古商城');
        $user_id = $request->input('user_id');
        $content = $request->input('content','');
        $event_id = intval($request->input('event_id',0));

        if ($user_id && !preg_match('/^([\d]{1,12})([，；,;#][\d]{1,12}){0,50}$/', $user_id, $arr)) {
            throw new \Exception('id格式错误！！！', 1001);
        }

        if (iconv_strlen($content, "UTF-8") > 36) {
            throw new \Exception('内容长度超出范围！！！', 1002);
        }

        if($user_id){
            $user_id = explode(',', str_replace(array("，", "；", ";", "#", ".", "|", " "), ',', $user_id));
            $data['user_id'] = json_encode($user_id);
        }
        $data['title'] = $title;
        $data['type'] = 1;
        $data['content'] = $content;
        $data['event_id'] = $event_id;
        $data['admin_id'] = $this->user->id;

        $data2 = ['alias'=>[],'event_id'=>$event_id,'content'=>$content,'title'=>$title];
        foreach ($user_id as $v){
            $data2['alias'][] = 'uid_'.$v;
        }
        \App\Common\JPush::push($data2);

        $re = DB::table('app_message')->insertGetId($data);

        if ($re) {
            $user_id = json_encode($user_id);
            $log = ['id'=> $re,'user_id' => "{$user_id}", 'msg' => '推送消息'];
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => json_encode($log, JSON_UNESCAPED_UNICODE), 'type' => 2, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '添加成功'];
        } else {
            return ['errcode' => 4002, 'msg' => '添加失败'];
        }
    }

}
