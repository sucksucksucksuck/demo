<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/5/8
 * Time: 14:13
 */
//同步user表的phone字段
class SyncPhone extends AbsResponse
{
    public function execute(array $params)
    {
        $phone = $params['phone'] ?? '';

        $user = DB::table('user')->where(['phone' => $phone])->first();
        if($user){
            throw new \Exception('手机号已存在', 500);
        }
        if($phone){
            DB::table('user')->where(['id' => $this->user->id])->update(['phone' => $phone]);
        }
        return ['errcode' => 0, 'msg' => '', 'data' => []];
    }
}