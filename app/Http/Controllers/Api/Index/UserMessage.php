<?php

namespace App\Http\Controllers\Api\Index;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/5
 * Time: 10:05
 */
//消息列表(我的消息)
class UserMessage extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    public function execute(array $params)
    {
        $page = $params['page'] ?? 1;
        $page_size = 20;
        $time = date('Y-m-d H:i:s', strtotime('-30 day'));
        $data = DB::table('user_message')
            ->where(['user_id' => $this->user->id])
            ->where('create_at', '>', $time)
            ->orderBy('create_at', 'desc')
            ->forPage($page, $page_size)
            ->get();

        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}