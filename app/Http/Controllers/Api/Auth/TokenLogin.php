<?php

namespace App\Http\Controllers\Api\Auth;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/5/26
 * Time: 10:06
 */
class TokenLogin extends AbsResponse
{

    /**
     * 系统登录(token)
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        if(isset($params['position'])){
            $position = $params['position'] ?? ''; //判断登陆位置，更新登陆时间和ip地址等信息
        }else{
            $position = '';
        }
        $user = DB::table('user')->where(['token' => $params['token']])->first();
        if ($user->status == 2) {
            throw new \Exception('用户已停用', 1);
        }
        $update_data = [
            'login_times' => $user->login_times + 1,
            'last_login_ip' => $params['ip'],
            'last_login_at' => date('Y-m-d H:i:s'),
        ];
        DB::table('user')->where(['id' => $user->id])->update($update_data);

        $user->bind = Helper::getUserBindInfo($user);
        $user->icon = Helper::getAvatar($user->icon);
        unset($user->password);
        unset($user->recharge_amount);
        unset($user->winning_amount);
        unset($user->exchange_amount);
        unset($user->type);
        unset($user->status);
        unset($user->recharge_times);
        unset($user->create_at);
        unset($user->update_at);
        unset($user->channel);
        unset($user->login_times);
        unset($user->total_integral);
        unset($user->update_at);
//        unset($user->idaf);
        unset($user->device);
        unset($user->create_ip);
        unset($user->version);
        return ['errcode' => 0, 'msg' => '登录成功', 'data' => $user];
    }
}