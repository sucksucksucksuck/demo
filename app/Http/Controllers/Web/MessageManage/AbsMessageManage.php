<?php

namespace App\Http\Controllers\Web\MessageManage;

use App\Http\Controllers\Web\AbsResponse;
use Illuminate\Http\Request;
use DB;

abstract class AbsMessageManage extends AbsResponse
{
    /**
     * 上传消息图片
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function upImg(Request $request)
    {
        $id = $request->input('id', 0);
        $url = $request->input('url', '');

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

                        $img_path = 'upload/message_html/' . date('Y_m') . '/' . date('d') . '/';
                        $url_path = asset($img_path . $new_name);
                        $file_path = public_path($img_path);

                        $v->move($file_path, $new_name);
                        $path[] = $url_path;
                    }
                }
            }
        }

        if(is_numeric($id)) {
            $image = DB::table('app_message')->where('id', $id)->value('image');
            $image = json_decode($image??'[]', true);
            $image = array_merge($image, $path);
            $image = json_encode($image);

            $re = DB::table('app_message')->where('id', $id)->update(['image' => $image]);
        }else{
            $key = 'PanguMessageImage_'.$this->user->id.'_'.$id;
            $image = \Cache::get($key);
            $image = json_decode($image??'[]', true);
            $image = array_merge($image, $path);
            $image = json_encode($image);
            \Cache::forget($key);
            \Cache::put($key, $image, 60*24);

            $re =true;
        }


        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，上传消息图片", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '上传完成', 'data' => $path];
        } else {
            return ['errcode' => 1010, 'msg' => '上传失败'];
        }
    }

    /**
     * 获取消息图片
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function getImg(Request $request)
    {
        $id = $request->input('id', 0);

        if (!$id) throw new \Exception('请输入活动id！！！', 1001);

        if(is_numeric($id)) {
            $image = DB::table('app_message')->where('id', $id)->value('image');
            $image = json_decode($image??'[]', true);
        }else{
            $key = 'PanguMessageImage_'.$this->user->id.'_'.$id;
            $image = \Cache::get($key);
            $image = json_decode($image??'[]', true);
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $image];
    }

    /**
     * 删除消息图片
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function delImg(Request $request)
    {
        $id = $request->input('id', 0);
        $index = $request->input('index', 0);
        if (!is_numeric($index)) throw new \Exception('请输入图片索引 ！！！', 1001);

        if(is_numeric($id)) {
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
        }else {
            $key = 'PanguMessageImage_'.$this->user->id.'_'.$id;
            $image = \Cache::get($key);

            $image = json_decode($image??'[]', true);

            if ($image[$index]) {
                $tempu = parse_url($image[$index]);
                if (file_exists($_SERVER['DOCUMENT_ROOT'] . $tempu['path'])) {
                    @unlink($_SERVER['DOCUMENT_ROOT'] . $tempu['path']);
                }
                unset($image[$index]);
                $image = array_values($image);
            }

            $image = json_encode($image);
            \Cache::forget($key);
            \Cache::put($key, $image, 60*24);
            $re =true;
        }
        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，删除消息图片", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '删除完成'];
        } else {
            return ['errcode' => 1010, 'msg' => '删除失败'];
        }
    }
}
