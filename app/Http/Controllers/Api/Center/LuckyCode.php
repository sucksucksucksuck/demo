<?php

namespace App\Http\Controllers\Api\Center;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/7/10
 * Time: 10:22
 */

//查看用户夺宝号码
class LuckyCode extends AbsResponse
{
    public function execute(array $params)
    {
        $data = [];
        $data = DB::table('lucky_code')
            ->where(['user_id' => $params['user_id'], 'periods_id' => $params['periods_id']])
            ->select('lucky_code')
            ->get();

        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}