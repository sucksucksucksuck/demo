<?php

namespace App\Http\Controllers\Web\EventManage;

use Illuminate\Http\Request;
use DB;

class DisplayInfo extends AbsEventManage
{
    public $permission = [
        'execute' => 1,
        'create' => 2,
        'edit' => 3,
        'editUrl' => 3,
        'editEventId' => 3,
        'editGoods' => 3,
        'editContent' => 3,
        'upImg' => 3,
        'delImg' => 3
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['703']??0;
    }

    /**
     * 活动详情
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function execute(Request $request)
    {
        $id = $request->input('id');

        if (!$id) throw new \Exception('请输入活动id！！！', 1001);

        $data = DB::table('app_event')
            ->select('id', 'title', 'describe', 'icon', 'begin_at', 'end_at', 'type', 'status', 'sort', 'clicks', 'visible', 'url', 'content', 'extend', 'action')
            ->where('id', $id)
            ->first();
        $data->extend = json_decode($data->extend??'[]', true);

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     * 添加活动
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function create(Request $request)
    {
        $title = trim($request->input('title'));
        $describe = $request->input('describe');
        $begin_at = $request->input('begin_at');
        $end_at = $request->input('end_at');
        $visible = $request->input('visible');
        $type = $request->input('type');
        $action = $request->input('action');
        $icon = $request->input('icon');

        if (!$title || !$visible || !$type) {
            throw new \Exception('资料填写不正确！！！', 1001);
        }

        $data['status'] = 2;
        $data['title'] = $title;
        if ($describe) $data['describe'] = $describe;
        if ($begin_at) $data['begin_at'] = $begin_at.' 00:00:00';
        if ($end_at) $data['end_at'] = $end_at.' 23:59:59';
        $data['visible'] = $visible;
        $data['type'] = $type;
        if ($action) $data['action'] = $action;

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

                $img_path = 'upload/event/' . date('Y_m') . '/' . date('d') . '/';
                $url_path = asset($img_path . $new_name);
                $file_path = public_path($img_path);

                $file->move($file_path, $new_name);
                $path = $url_path;

            }
        }else{
            if ($icon) $path = $icon;
        }

        if (!empty($path)) $data['icon'] = $path;
        $re = DB::table('app_event')->insertGetId($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$re}，活动添加", 'type' => 2, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '保存成功'];
        } else {
            return ['errcode' => 1010, 'msg' => '保存失败'];
        }
    }

    /**
     * 编辑活动
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function edit(Request $request)
    {
        $id = trim($request->input('id'));
        $title = trim($request->input('title'));
        $describe = $request->input('describe');
        $begin_at = $request->input('begin_at');
        $end_at = $request->input('end_at');
        $visible = $request->input('visible');
        $type = $request->input('type');
        $action = $request->input('action');
        $icon = $request->input('icon');

        if (!$id || !$title || !$visible || !$type) {
            throw new \Exception('资料填写不正确！！！', 1001);
        }

        $data['title'] = $title;
        if ($describe) $data['describe'] = $describe;
        if ($begin_at) $data['begin_at'] = $begin_at.' 00:00:00';
        if ($end_at) $data['end_at'] = $end_at.' 23:59:59';
        $data['visible'] = $visible;
        $data['type'] = $type;
        if ($action) $data['action'] = $action;

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

                $img_path = 'upload/event/' . date('Y_m') . '/' . date('d') . '/';
                $url_path = asset($img_path . $new_name);
                $file_path = public_path($img_path);

                $file->move($file_path, $new_name);
                $path = $url_path;
            }
        }else{
            if ($icon) $path = $icon;
        }

        $query = DB::table('app_event');
        if (!empty($path)) {
            $icon = $query->where('id', $id)->value('icon');
            if ($icon) {
                $tempu = parse_url($icon);
                @unlink($_SERVER['DOCUMENT_ROOT'] . $tempu['path']);
            }
            $data['icon'] = $path;
        }

        $re = $query->where('id', $id)->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，活动展示编辑", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '编辑成功'];
        } else {
            return ['errcode' => 1010, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 修改跳转链接
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function editUrl(Request $request)
    {
        $id = $request->input('id');
        $sort = $request->input('sort');
        $url = $request->input('url');

        if (!$id || !$url) {
            throw new \Exception('资料填写不正确！！！', 1001);
        }

        if (strlen($url) > 255) {
            throw new \Exception('链接字符太长了', 1002);
        }

        $data['action'] = 1;
        $data['url'] = $url;
        if (is_numeric($sort)) $data['sort'] = $sort;

        $re = DB::table('app_event')->where('id', $id)->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，修改跳转链接", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '编辑成功'];
        } else {
            return ['errcode' => 1010, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 修改关联活动
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function editEventId(Request $request)
    {
        $id = $request->input('id');
        $sort = $request->input('sort');
        $event_id = $request->input('event_id');
        $content = $request->input('content', '');

        if (!$id || !$event_id) {
            throw new \Exception('资料填写不正确！！！', 1001);
        }

        $extend = DB::table('app_event')->where('id', $id)->value('extend');
        $extend = json_decode($extend??'[]', true);
        $extend['event_id'] = $event_id;

        $data['action'] = 2;
        $data['extend'] = json_encode($extend);
        $data['content'] = $content;
        if (is_numeric($sort)) $data['sort'] = $sort;

        $re = DB::table('app_event')->where('id', $id)->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，修改关联活动", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '编辑成功'];
        } else {
            return ['errcode' => 1010, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 修改关联商品
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function editGoods(Request $request)
    {
        $id = $request->input('id');
        $sort = $request->input('sort');
        $extend = $request->input('extend');

        if (!$id || !$extend) {
            throw new \Exception('资料填写不正确！！！', 1001);
        }

        $data['action'] = 3;
        $data['extend'] = $extend;
        if (is_numeric($sort)) $data['sort'] = $sort;

        $re = DB::table('app_event')->where('id', $id)->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，修改关联商品", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '编辑成功'];
        } else {
            return ['errcode' => 1010, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 修改专栏内容
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function editContent(Request $request)
    {
        $id = $request->input('id');
        $sort = $request->input('sort');
        $content = $request->input('content', '');

        if (!$id) {
            throw new \Exception('请输入id！！！', 1001);
        }

        $data['action'] = 4;
        $data['content'] = $content;
        if (is_numeric($sort)) $data['sort'] = $sort;

        $re = DB::table('app_event')->where('id', $id)->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，修改专栏内容", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '编辑成功'];
        } else {
            return ['errcode' => 1010, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 上传活动图片
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function upImg(Request $request)
    {
        $id = $request->input('id', 0);
        $url = $request->input('url', '');

        if (!$id) throw new \Exception('请输入活动id！！！', 1001);

        //保存图片
        $path = [];
        if ($url) {
            $path[] = $url;
        } else {
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                foreach ($file as $k => $v) {
                    if ($v->getSize() > 2097152) {
                        return ['errcode' => 2002, 'msg' => "第" . ($k + 1) . "张图片超过了2M", 'data' => $k];
                    }
                    if (!in_array($v->getMimeType(), array('image/jpeg', 'image/gif', 'image/jpg', 'image/png', 'image/bmp'))) {
                        return ['errcode' => 2002, 'msg' => "图片类型不正确！"];
                    }
                }
                foreach ($file as $k => $v) {
                    if ($v->isValid()) {
                        $client_name = $v->getClientOriginalName();
                        $entension = $v->getClientOriginalExtension();
                        $new_name = md5(date("Y-m-d H:i:s") . $client_name) . "." . $entension;

                        $img_path = 'upload/event/' . date('Y_m') . '/' . date('d') . '/';
                        $url_path = asset($img_path . $new_name);
                        $file_path = public_path($img_path);

                        $v->move($file_path, $new_name);
                        $path[] = $url_path;
                    }
                }
            }
        }

        $image = DB::table('app_event')->where('id', $id)->value('image');
        $image = json_decode($image??'[]', true);
        $image = array_merge($image, $path);
        $image = json_encode($image);

        $re = DB::table('app_event')->where('id', $id)->update(['image' => $image]);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，上传活动图片", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '上传完成', 'data' => $path];
        } else {
            return ['errcode' => 1010, 'msg' => '上传失败'];
        }
    }

    /**
     * 获取活动图片
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function getImg(Request $request)
    {
        $id = $request->input('id', 0);

        if (!$id) throw new \Exception('请输入活动id！！！', 1001);

        $image = DB::table('app_event')->where('id', $id)->value('image');
        $image = json_decode($image??'[]', true);

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $image];
    }

    /**
     * 删除活动图片
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function delImg(Request $request)
    {
        $id = $request->input('id', 0);
        $index = $request->input('index', 0);
        if (!$id || !is_numeric($index)) throw new \Exception('请输入活动id和图片索引 ！！！', 1001);

        $image = DB::table('app_event')->where('id', $id)->value('image');
        $image = json_decode($image??'[]', true);

        if ($image[$index]) {
            $tempu = parse_url($image[$index]);
            if (file_exists($_SERVER['DOCUMENT_ROOT'] . $tempu['path'])) {
                @unlink($_SERVER['DOCUMENT_ROOT'] . $tempu['path']);
            }
            unset($image[$index]);
            $image = array_values($image);
        }
        $re = DB::table('app_event')->where('id', $id)->update(['image' => json_encode($image)]);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，删除活动图片", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '删除完成'];
        } else {
            return ['errcode' => 1010, 'msg' => '删除失败'];
        }
    }

}
