<?php

namespace App\Http\Controllers\Web\Setting;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Common\Helper;

/**
 *  APP支付设置
 */
class AppPaySetting extends AbsSetting
{
    public function execute(Request $request)
    {
        $data['pay'] = DB::table('dictionary')
//            ->where('pid', '=', 6)
            ->where('id', '>', 6000)
            ->where('id', '<', 7000)
            ->select('id', 'pid', 'describe', 'status', 'sort', 'index')
            ->get();
        foreach ($data['pay'] as $d) {
            switch ($d->status) {
                case 1:
                    $d->ios = 1;
                    $d->android = 1;
                    break;
                case 2:
                    $d->ios = 1;
                    $d->android = 0;
                    break;
                case 3:
                    $d->ios = 0;
                    $d->android = 1;
                    break;
                default:
                    $d->ios = 0;
                    $d->android = 0;
                    break;
            }
            $d->ios_version = $d->pid;
            $d->android_version = $d->index;
            unset($d->index);
            unset($d->status);
        }

        $data['tag'] = DB::table('dictionary')
            ->select('id','extend')
            ->where([['pid',3]])
            ->whereNull('delete_at')
            ->get();

        foreach ($data['tag'] as $k=>$v){
            $data['tag'][$k]->extend = json_decode($data['tag'][$k]->extend,true);
        }

        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }

    /**
     * 更新排序
     * @param Request $request
     * @return array
     */
    public function updateSort(Request $request)
    {
        $sorts = $request->input('sort');

        $sorts = json_decode($sorts, true);
        foreach ($sorts as $s){
            DB::table('dictionary')
                ->where('id', '=', $s['id'])
                ->update(['sort' => $s['sort']]);
        }
        return ['errcode' => 0, 'msg' => 'ok', 'data' => []];
    }

    /**
     * 更新status
     * @param Request $request
     * @return array
     */
    public function updateStatus(Request $request)
    {
        $ios = $request->input('ios');
        $android = $request->input('android');
        $id = $request->input('id');
        if ($ios && $android) {
            $status = 1;
        } else if ($ios) {
            $status = 2;
        } else if ($android) {
            $status = 3;
        } else {
            $status = 0;
        }
        DB::table('dictionary')
            ->where('id', '=', $id)
            ->update(['status' => $status]);
        return ['errcode' => 0, 'msg' => 'ok', 'data' => []];
    }

    /**
     * 更新版本
     * @param Request $request type 1=>ios 2=>android
     * @return array
     */
    public function updateVersion(Request $request)
    {
        $id = $request->input('id');
        $version = $request->input('version');
        $type = $request->input('type');
        if ($type == 1) {
            DB::table('dictionary')
                ->where('id', '=', $id)
                ->update(['pid' => $version]);
        } else {
            DB::table('dictionary')
                ->where('id', '=', $id)
                ->update(['index' => $version]);
        }
        return ['errcode' => 0, 'msg' => 'ok', 'data' => []];
    }

    /**
     * 更新版本(global.json)
     * @param Request $request
     * @return array
     */
    public function updateGlobalVersion(Request $request)
    {
        $ios = $request->input('ios');
        $android = $request->input('android');

        $file_path = Helper::globalConfig();
        $params = [
            "IosVersion" => $ios,
            "AndroidVersion" => $android
        ];
        if (file_exists($file_path)) {
            $json = file_get_contents($file_path);
            $config = json_decode($json, true);
            $config = array_merge($config, $params);
            if ($config != null) {
                file_put_contents($file_path, json_encode($config));
            }
        } else {
            $json = json_encode(config('app.global'));
            file_put_contents($file_path, $json);
        }
        return ['errcode' => 0, 'msg' => 'ok', 'data' => []];
    }

    /**
     * 修改商品标签图标
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function upGoodsTag(Request $request)
    {
        $id = $request->input('id');

        if (!$id) {
            throw new \Exception('请输入id！！！', 1001);
        }

        $path = '';
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            if ($file->getSize() > 2097152) {
                return ['errcode' => 2002, 'msg' => "图片超过了2M"];
            }
            if (!in_array($file->getMimeType(), array('image/jpeg', 'image/gif', 'image/jpg', 'image/png', 'image/bmp'))) {
                return ['errcode' => 2002, 'msg' => "图片类型不正确！"];
            }

            if ($file->isValid()) {
                $client_name = $file->getClientOriginalName();
                $entension = $file->getClientOriginalExtension();
                $new_name = md5(date("Y-m-d H:i:s") . $client_name) . "." . $entension;

                $img_path = 'upload/goods_tag/' . date('Y_m') . '/' . date('d') . '/';
                $url_path = asset($img_path . $new_name);
                $file_path = public_path($img_path);

                $file->move($file_path, $new_name);
                $path = $url_path;
            }

            $extend = DB::table('dictionary')->where('id',$id)->value('extend');
            $extend = json_decode($extend??'[]',true);
            $extend['tag_img'] = $path;
            $data['extend'] = json_encode($extend);
            $re = DB::table('dictionary')->where('id',$id)->update($data);

            if ($re) {
                DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，修改商品标签图标", 'type' => 3,'ip'=>$request->getClientIp()]);
                return ['errcode' => 0, 'msg' => '编辑成功'];
            } else {
                return ['errcode' => 5010, 'msg' => '没有数据被修改'];
            }
        }
    }

}
