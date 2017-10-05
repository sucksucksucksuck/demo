<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/5/9
 * Time: 14:26
 */
//第三方登陆时同步openid
class SyncOtherLogin extends AbsResponse
{
    public function execute(array $params)
    {
        $openid = $params['openid'];

        if($openid){
            $prefix = substr($openid, 0, 2);
            $open_id = substr($openid, 3);
            if($prefix == 'wx'){
                DB::table('user_other_login')->updateOrInsert(['user_id' => $this->user->id, 'type' => 'wx'],['open_id' => $open_id, 'create_at' => date('Y-m-d H:i:s')]);
            }elseif($prefix == 'qq'){
                DB::table('user_other_login')->updateOrInsert(['user_id' => $this->user->id, 'type' => 'qq'],['open_id' => $open_id, 'create_at' => date('Y-m-d H:i:s')]);
            }
        }
        return ['errcode' => 0, 'msg' => '', 'data' => []];
    }
}