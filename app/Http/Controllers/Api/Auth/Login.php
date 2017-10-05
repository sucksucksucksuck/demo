<?php

namespace App\Http\Controllers\Api\Auth;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/2/28
 * Time: 10:06
 */
class Login extends AbsResponse
{
    /**
     * 系统登录
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $phone = $params['phone'] ?? '';
        $password = $params['password'] ?? '';
        $user = DB::table('user')->where(['phone' => $phone])->first();
        if (!$user) {
            //如果新系统用户不存在，查看老系统是否存在
            $vip = DB::connection('anyou')
                ->table('vip')
                ->where(['photo' => $phone, 'passs' => Helper::mima($password)])
                ->first();
            if ($vip) {
                $id = Helper::insertUserByVip($vip, ['phone' => $vip->photo, 'password' => Helper::password($password), 'idaf' => $this->request->header('device') ?? '']);
                $user = DB::table('user')->where(['id' => $id])->first();
                //新系统登陆过以后，更新email字段为1，禁止老系统登陆
                Helper::updateOldEmail($user->id);
            } else {
                throw new \Exception('用户不存在或者密码错误', 1);
            }
        } else if ($user->password != Helper::password($password)) {
            $old_user = DB::connection('anyou')
                ->table('vip')
                ->where(['photo' => $phone, 'passs' => Helper::mima($password)])
                ->where('email', '!=', '1')
                ->first();
            if ($old_user) {
                //新系统登陆过以后，更新email字段为1，禁止老系统登陆
                Helper::updateOldEmail($user->id);
                //如果老系统有密码且密码正确，更新新系统密码
                DB::table('user')->where(['id' => $user->id])->update(['password' => Helper::password($password), 'residual_amount' => $old_user->jine]);
            } else {
                throw new \Exception('密码错误', 1);
            }
        }
        if ($user->status == 2) {
            throw new \Exception('用户已停用', 1);
        }
        $user->token = Helper::getToken($user->id);
        DB::table('user')->where(['id' => $user->id])->increment('login_times', '1', [
            'token' => $user->token,
            'last_login_ip' => $this->request->ip(),
            'last_login_at' => date('Y-m-d H:i:s')
        ]);
        //获取账户绑定情况
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
        unset($user->idaf);
        unset($user->device);
        unset($user->create_ip);
        unset($user->version);
        return ['errcode' => 0, 'msg' => '登录成功', 'data' => $user];
    }
}