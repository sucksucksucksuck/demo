<?php

namespace App\Http\Controllers\Web\Goods;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\DB;


class Info extends AbsGoods
{
    public $permission = [
        'execute' => 1,
        'create' => 2,
        'edit' => 3
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['101']??0;
    }

    /**
     *  商品详情
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $id = $request->input('id');

        if (!$id) return ['errcode' => 1001, 'msg' => '请输入id！'];

        $data = DB::table('goods')->where('id', $id)->select('id', 'title', 'category_id', 'type', 'unit_price', 'total', 'amount', 'describe', 'content', 'category_id', 'sort', 'url', 'image', 'icon', 'up_shelf_at','periods','max_periods','tag','purchase_volume')->first();
        $data->image = json_decode($data->image??'[]', true);
        if($data->tag == '"null"')$data->tag = '[]';
        $data->tag = json_decode($data->tag??'[]', true);
        $data->purchase_volume = json_decode($data->purchase_volume??'[]', true);

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     * 添加商品
     * @param Request $request
     * @return array
     */
    public function create(Request $request)
    {
        $title = trim($request->input('title'));
        $category_id = $request->input('category_id');
        $type = $request->input('type');
        $unit_price = $request->input('unit_price');
        $total = $request->input('total');
        $amount = $request->input('amount');
        $content = $request->input('content');
        $sort = intval($request->input('sort'));
        $url = $request->input('url');
        $icon = intval($request->input('icon',0));
        $max_periods = $request->input('max_periods',99999);
        $periods = abs($request->input('periods',0));
        $tag = $request->input('tag',[]);
        $purchase_volume = $request->input('purchase_volume',[]);

        if (!$title || !$category_id || !is_numeric($unit_price) || !is_numeric($total) || !is_numeric($amount) || !is_numeric($max_periods) || !is_numeric($periods) || ($max_periods >= 0 && $max_periods < $periods)) {
            return ['errcode' => 1001, 'msg' => "资料填写不正确！！！"];
        }
        if ($title && strlen($title) > 100) {
            throw new \Exception('标题字符太长了！！！', 1002);
        }

        $data['status'] = 3;
        $data['title'] = $title;
        $data['category_id'] = $category_id;
        $data['type'] = $type == 1 ? 1 : 0;
        $data['unit_price'] = $unit_price;
        $data['total'] = $total;
        $data['amount'] = $amount;
        if ($content) $data['content'] = $content;
        $data['sort'] = $sort;
        if ($url) $data['url'] = $url;
        $data['max_periods'] = $max_periods;
        $data['periods'] = $periods;
        $data['tag'] = json_encode($tag);
        $data['purchase_volume'] = json_encode($purchase_volume);

        //保存图片
        $path = array();
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

                    $img_path = 'upload/goods/' . date('Y_m') . '/' . date('d') . '/';
                    $url_path = asset($img_path . $new_name);
                    $file_path = public_path($img_path);

                    $v->move($file_path, $new_name);
                    $path[] = $url_path;
                }
            }
        }

        $query = DB::table('goods');
        $data['content'] = '';
        $data['image'] = json_encode($path);
        if (!empty($path[$icon])) $data['icon'] = $path[$icon];
        $re = $query->insertGetId($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$re}，商品添加", 'type' => 2,'ip'=>$request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '保存成功'];
        } else {
            return ['errcode' => 1010, 'msg' => '保存失败'];
        }
    }

    /**
     * 编辑商品
     * @param Request $request
     * @return array
     */
    public function edit(Request $request)
    {
        $id = intval($request->input('id'));
        $title = trim($request->input('title'));
        $category_id = intval($request->input('category_id'));
        $type = $request->input('type');
        $unit_price = $request->input('unit_price');
        $total = $request->input('total');
        $amount = $request->input('amount');
        $content = $request->input('content');
        $sort = intval($request->input('sort'));
        $url = $request->input('url');
        $icon = gettype($request->input('icon')) != 'NULL' ? intval($request->input('icon')) : -2;
        $img_del = $this->forArr($request->input('img_del'));
        $max_periods = $request->input('max_periods',99999);
        $periods = abs($request->input('periods',0));
        $tag = $request->input('tag',[]);
        $purchase_volume = $request->input('purchase_volume',[]);

        if (!$id || !$title || !$category_id || !is_numeric($unit_price) || !is_numeric($total) || !is_numeric($amount) || !is_numeric($max_periods) || !is_numeric($periods) || ($max_periods != -1 && $max_periods < $periods)) {
            return ['errcode' => 1001, 'msg' => "资料填写不正确！！！"];
        }

        $periods_db = DB::table('goods')->where('id',$id)->value('periods');
        if($periods_db > $periods){
            return ['errcode' => 1003, 'msg' => "修改的期数不能小于当前期数！！！"];
        }

        if ($title) $data['title'] = $title;
        if ($category_id) $data['category_id'] = $category_id;
        $data['type'] = $type == 1 ? 1 : 0;
        if (is_numeric($unit_price)) $data['unit_price'] = $unit_price;
        if (is_numeric($total)) $data['total'] = $total;
        if (is_numeric($amount)) $data['amount'] = $amount;
        $data['content'] = $content;
        $data['sort'] = $sort;
        if ($url) $data['url'] = $url;
        $data['max_periods'] = $max_periods;
        $data['periods'] = $periods;
        $data['tag'] = json_encode($tag);
        $data['purchase_volume'] = json_encode($purchase_volume);

        //保存图片
        $path = array();

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

                    $img_path = 'upload/goods/' . date('Y_m') . '/' . date('d') . '/';
                    $url_path = asset($img_path . $new_name);
                    $file_path = public_path($img_path);

                    $v->move($file_path, $new_name);
                    $path[] = $url_path;
                }
            }
        }

        $query = DB::table('goods');
        $info = $query->select('icon', 'image')->where('id', $id)->first();
        $image_arr = json_decode($info->image,true);
        if ($icon == -1) $data['icon'] = '';
        if (empty($image_arr)) $image_arr = array();
        $image_arr = array_merge($image_arr, $path);
        if (!empty($image_arr[$icon])) $data['icon'] = $image_arr[$icon];
        foreach ($img_del as $k => $v) {
            if (isset($image_arr[$v])) {
                if ($image_arr[$v] == $data['icon']) {
                    $data['icon'] = '';
                }
                $tempu = parse_url($image_arr[$v]);
                @unlink($_SERVER['DOCUMENT_ROOT'] . $tempu['path']);
                unset($image_arr[$v]);
            }
        }

        $image_arr = array_values($image_arr);
        $data['image'] = json_encode($image_arr);
        $re = $query->where('id', $id)->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，商品编辑", 'type' => 3,'ip'=>$request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '编辑成功'];
        } else {
            return ['errcode' => 5010, 'msg' => '没有数据被修改'];
        }
    }

}
