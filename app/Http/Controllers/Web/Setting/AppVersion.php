<?php

namespace App\Http\Controllers\Web\Setting;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Common\Helper;

/**
 *  APP版本控制
 */
class AppVersion extends AbsSetting
{
    public function execute(Request $request)
    {
        $version = config('app.global.IosVersion') ?? '';
        return ['errcode' => 0, 'msg' => 'ok', 'data' => $version];
    }

    /**
     * 上传安装包
     * @param Request $request
     * @return array
     */
    public function upload(Request $request){
        if ($request->hasFile('file')) {
            $file = $request->file('file');
//            if (!in_array($file->getMimeType(), array('apk'))) {
//                return ['errcode' => 500, 'msg' => "文件类型不正确！"];
//            }
            if ($file->isValid()) {
                $name = $file->getClientOriginalName();
                $file_path = config_path();
                $file->move($file_path, $name);
            }
        }
        return ['errcode' => 0, 'msg' => 'ok', 'data' => []];
    }

    /**
     * 更新版本
     * @param Request $request
     * @return array
     */
    public function updateVersion(Request $request)
    {
        $ios = $request->input('ios');
//        $android = $request->input('android');

        $file_path = Helper::globalConfig();
        $params = [
            "IosVersion" => $ios,
//            "AndroidVersion" => $android
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
}
