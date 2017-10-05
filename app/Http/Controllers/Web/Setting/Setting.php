<?php

namespace App\Http\Controllers\Web\Setting;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Web\AbsResponse;
use App\Common\Helper;

/**
 *  系统设置
 */
class Setting extends AbsResponse
{
    public function execute(Request $request)
    {
        $file_path = Helper::globalConfig();
        $params = [
            "BuySpeed" => 1,
            "SinglePeopleBuy" => 100
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
