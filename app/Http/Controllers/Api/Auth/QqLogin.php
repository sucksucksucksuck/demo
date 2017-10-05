<?php

namespace App\Http\Controllers\Api\Auth;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/5/8
 * Time: 18:37
 */
class QqLogin extends AbsResponse
{
    /**
     * 系统登录(qq登陆)
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $reg = isset($params['reg']) ? $params['reg'] : 3;  //$reg = 3;
        $access_token = $params['accessToken'];
        $open_id = $params['openid'];
        $app_id = config('app.id');

        $url = 'https://graph.qq.com/user/get_user_info?access_token=' . $access_token . '&openid=' . $open_id . '&oauth_consumer_key=' . $app_id . '&format=json';
        $json = Helper::ssl_get($url);
        $data = json_decode($json, true);
        if (!empty($data['nickname'])) {
            $info = DB::table('user_other_login')->where(['open_id' => $open_id, 'type' => 'qq'])->first();
            //如果user_other_login表里面没有记录，同时向user表和user_other_login表插入一条记录
            if (!$info) {
                //如果新系统用户不存在，查看老系统是否存在
                $vip = DB::connection('anyou')
                    ->table('vip')
                    ->where(['openid' => 'qq_' . $open_id])
                    ->first();
                if ($vip) {
                    //如果老系统存在，更新新系统user表和user_other_login表
                    $id = Helper::insertUserByVip($vip, ['phone' => $vip->photo]);
                    Helper::insertOtherLoginUserByVip($vip, 'qq');
                    DB::table('user')->where(['id' => $id])->first();
                    //新系统登陆过以后，更新email字段为1，禁止老系统登陆
                    Helper::updateOldEmail($id);
                    $user = DB::table('user')->where(['id' => $id])->first();
                } else { //老系统和新系统都不在，即注册
                    Helper::isAllowReg();
                    $insert_info = [
                        'nickname' => $data['nickname'],
                        'icon' => $data['figureurl_qq_2'],
                        'create_at' => date('Y-m-d H:i:s'),
                        'create_ip' => $this->request->ip()
                    ];
                    $user_id = DB::table('user')->insertGetId($insert_info);
                    DB::connection('anyou')->table('vip')->insert([
                        'uid' => $user_id,
                        'openid' => 'qq_' . $open_id,
                        'name' => $data['nickname'],
                        'email' => 1,
                        'pic' => $data['figureurl_qq_2'],
                        'dltime' => time(),
                        'ip' => $this->request->getClientIp(),
                        'ip2' => $this->request->getClientIp(),
                        'pt' => $this->request->header('type') == 'ios' ? 'i' : 'a',
                        'tgqd' => 'pgyg',
                        'zfbid' => '',
                        'zfbname' => '',
                        'reg' => 3,
                    ]);
                    $update_info = [
                        'user_id' => $user_id,
                        'open_id' => $open_id,
                        'type' => 'qq',
                        'create_at' => date('Y-m-d H:i:s'),
                    ];
                    DB::table('user_other_login')->insert($update_info);
                    //返回数据
                    $user = DB::table('user')->where(['id' => $user_id])->first();
                }
            } else {
                $user = DB::table('user')->where(['id' => $info->user_id])->first();
                $user->is_reg = true;
                $user->reg = $reg;
                //新系统登陆过以后，更新email字段为1，禁止老系统登陆
                Helper::updateOldEmail($user->id);
                //更新账户余额
                $vip = DB::connection('anyou')
                    ->table('vip')
                    ->where(['uid' => $user->id])
                    ->select('uid', 'jine')
                    ->first();
                if($vip){
                    DB::table('user')->where(['id' => $vip->uid])->update(['residual_amount' => $vip->jine]);
                }
            }
            $user->token = Helper::getToken($user->id);
            DB::table('user')->where(['id' => $user->id])->update([
                'token' => $user->token,
                'login_times' => $user->login_times + 1,
                'last_login_ip' => $this->request->ip(),
                'last_login_at' => date('Y-m-d H:i:s'),
                'reg' => 3
            ]);
            //获取账户绑定情况
            $user->bind = Helper::getUserBindInfo($user);
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
        } else {
            throw new \Exception('非法获取', 101);
        }

        return ['errcode' => 0, 'msg' => '登录成功', 'data' => $user];
    }
}