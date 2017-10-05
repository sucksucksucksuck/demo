<?php

namespace App\Http\Controllers\Web\MessageManage;

use Illuminate\Http\Request;
use DB;

/**
 * 盘古消息
 * Class LevelSearch
 * @package App\Http\Controllers\Web\TurntableManage
 */
class PanguMessage extends AbsMessageManage
{
    public $permission = [
        'execute' => 1,
        'getInfo' => 1,
        'create' => 2,
        'edit' => 3,
        'del' => 4
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['803']??0;
    }

    /**
     *  盘古消息
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $title = $request->input('title');
        $visible = $request->input('visible');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');

        $query = DB::table('app_message as am')
            ->leftJoin('admin as a','a.id','=','am.admin_id');
        if ($title)
            $query->where('am.title', 'like', "%{$title}%");
        if ($visible)
            $query->where('am.visible',$visible);
        if ($start_time)
            $query->where('am.create_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query->where('am.create_at', '<=', trim($end_time) . ' 23:59:59');
        $query->where('am.type',4)->whereNull('am.delete_at');

        $total = $query->count();
        $list = $query
            ->select('am.*','a.truename')
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
     *  添加盘古公告
     * @param Request $request
     * @return array
     */
    public function create(Request $request)
    {
        $data = [];

        $title = $request->input('title','盘古商城');
        $content = $request->input('content','');
        $visible = $request->input('visible',1);
        $event_id = intval($request->input('event_id',0));
        $image_list = $request->input('image_list',[]);

        if (!$title || iconv_strlen($title, "UTF-8") > 100) {
            throw new \Exception('标题长度超出范围！！！', 1001);
        }

        $data['title'] = $title;
        $data['visible'] = $visible;
        $data['type'] = 4;
        $data['content'] = $content;
        $data['event_id'] = $event_id;
        $data['admin_id'] = $this->user->id;
        $data['image'] = json_encode($image_list);

        //保存图片
        $path = '';
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            if ($file->getSize() > 2097152) {
                throw new \Exception('图片超过了2M！！！', 1002);
            }
            if (!in_array($file->getMimeType(), array('image/jpeg', 'image/gif', 'image/jpg', 'image/png', 'image/bmp'))) {
                throw new \Exception('图片类型不正确！！！', 1003);
            }
            if ($file->isValid()) {
                $client_name = $file->getClientOriginalName();
                $entension = $file->getClientOriginalExtension();
                $new_name = md5(date("Y-m-d H:i:s") . $client_name) . "." . $entension;

                $img_path = 'upload/message/' . date('Y_m') . '/' . date('d') . '/';
                $url_path = asset($img_path . $new_name);
                $file_path = public_path($img_path);

                $file->move($file_path, $new_name);
                $path = $url_path;
            }
            $data['icon'] = $path;
        }

        $re = DB::table('app_message')->insertGetId($data);

        if ($re) {
            $log = ['id' => $re, 'msg' => '推送盘古公告'];
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => json_encode($log, JSON_UNESCAPED_UNICODE), 'type' => 2, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '添加成功'];
        } else {
            return ['errcode' => 4002, 'msg' => '添加失败'];
        }
    }

    /**
     *  修改盘古公告
     * @param Request $request
     * @return array
     */
    public function edit(Request $request)
    {
        $data = [];
        $id = $request->input('id');
        $title = $request->input('title','盘古商城');
        $content = $request->input('content','');
        $visible = $request->input('visible');
        $event_id = intval($request->input('event_id',0));
        $image_list = $request->input('image_list',[]);

        if (!$id) {
            throw new \Exception('请输入id！！！', 1001);
        }

        if (!$title || iconv_strlen($title, "UTF-8") > 100) {
            throw new \Exception('标题长度超出范围！！！', 1002);
        }

        $data['title'] = $title;
        $data['visible'] = $visible;
        $data['type'] = 4;
        $data['content'] = $content;
        $data['event_id'] = $event_id;
        $data['admin_id'] = $this->user->id;
        $data['image'] = json_encode($image_list);

        //保存图片
        $path = '';
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            if ($file->getSize() > 2097152) {
                throw new \Exception('图片超过了2M！！！', 1002);
            }
            if (!in_array($file->getMimeType(), array('image/jpeg', 'image/gif', 'image/jpg', 'image/png', 'image/bmp'))) {
                throw new \Exception('图片类型不正确！！！', 1003);
            }
            if ($file->isValid()) {
                $client_name = $file->getClientOriginalName();
                $entension = $file->getClientOriginalExtension();
                $new_name = md5(date("Y-m-d H:i:s") . $client_name) . "." . $entension;

                $img_path = 'upload/message/' . date('Y_m') . '/' . date('d') . '/';
                $url_path = asset($img_path . $new_name);
                $file_path = public_path($img_path);

                $file->move($file_path, $new_name);
                $path = $url_path;

            }
            $data['icon'] = $path;
        }

        $re = DB::table('app_message')->where([['id', $id],['type',4]])->update($data);

        if ($re) {
            $log = ['id' => $re, 'msg' => '修改盘古公告'];
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => json_encode($log, JSON_UNESCAPED_UNICODE), 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功'];
        } else {
            return ['errcode' => 4002, 'msg' => '没有数据被修改'];
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

        $re = DB::table('app_message')->where([['id', $id],['type',4]])->update(['delete_at' => date('Y-m-d H:i:s')]);

        if ($re) {
            $log = ['id' => $re, 'msg' => '删除盘古公告'];
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => json_encode($log, JSON_UNESCAPED_UNICODE), 'type' => 4, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '删除成功'];
        } else {
            return ['errcode' => 4002, 'msg' => '没有数据被修改'];
        }
    }

}
