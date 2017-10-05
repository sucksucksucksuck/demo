<?php

namespace App\Http\Controllers\Api\Log;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/1
 * Time: 10:06
 */
class AmountLog extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    /**
     * 用户消费记录
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $page = $params['page'] ?? 1;
        $page_size = $params['page_size'] ?? 20;
        $time = date('Y-m-d H:i:s', strtotime('-30 day'));
        $data = DB::table('user_amount_log')
            ->where(['user_id' => $this->user->id])
            ->where('create_at', '>', $time)
            ->forPage($page, $page_size)
            ->orderBy('id', 'desc')
            ->get();

        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}