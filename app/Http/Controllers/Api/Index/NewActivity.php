<?php

namespace App\Http\Controllers\Api\Index;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/5/8
 * Time: 18:03
 */
//最新活动
class NewActivity extends AbsResponse
{
    var $default_params = ['page' => 1, 'page_size' => 10];
    public function execute(array $params)
    {
        $now = date('Y-m-d H:i:s');
        $params = array_merge($this->default_params, $params);
        $data = DB::table('app_event')
            ->whereIn('type', [2, 3])
            ->where('status', '=', 1)
            ->whereRaw(" ((begin_at <= '$now' and end_at >= '$now') or (begin_at is null and end_at is null)) ")
            ->select('id', 'title', 'describe', 'url', 'icon', 'extend', 'content', 'visible', 'action')
            ->orderBy('create_at', 'desc')
            ->forPage($params['page'], $params['page_size'])
            ->get();
        Helper::event($data);
        foreach ($data as $key => $value){
            if($this->user){
                //客服或者测试
                if ($value->visible == 2 && ($this->user->type != 2 && $this->user->type != 4)) {
                    unset($data[$key]);
                    continue;
                }
                //测试
                if ($value->visible == 3 && $this->user->type != 2) {
                    unset($data[$key]);
                    continue;
                }
            }
        }
        return ['errcode' => 0, 'msg' => '', 'data' => array_values(json_decode(json_encode($data), true))];
    }
}


