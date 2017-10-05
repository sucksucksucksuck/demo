<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;
use App\Common\Helper;


/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/7/15
 * Time: 10:06
 */
class ResetPassword extends AbsResponse
{
    //找回密码
    public function execute(array $params)
    {
        $phone = $params['phone'];
        $captcha = $params['captcha'] ?? '';
        $password = $params['password'] ?? '';

        $user = DB::table('user')->where(['phone' => $phone])->first();
        if (!$user) {
            throw new \Exception('手机号不存在', 1);
        } else {
            if (!$captcha) {
                throw new \Exception('验证码不能为空', 500);
            }
            if ($captcha != \Cache::get('ret_sms_' . $phone)['code']) {
                throw new \Exception('验证码错误', 500);
            }
            if ($password) {
                if (!Helper::CheckPassword($password)) {
                    throw new \Exception('密码格式不对', 500);
                }
            }
            DB::table('user')->where('phone', '=', $phone)->update(['password' => Helper::password($password)]);

        }
        return ['errcode' => 0, 'msg' => 'ok', 'data' => []];
    }

    /**
     * 发送短信
     * @param $params
     * @return array
     * @throws \Exception
     */
    public function sendSms(array $params)
    {
        $phone = $params['phone'] ?? '';
        if ($phone) {
            $user = DB::table('user')->where(['phone' => $phone])->first();
            if (!$user) {
                throw new \Exception('手机号不存在', 1);
            }
            $code = mt_rand(0, 9999);
            $code = str_pad($code, 4, '0', STR_PAD_LEFT);
            $extend = ['code' => $code];
            $result = Helper::sendSMS($phone, '您好，您的验证码是 ' . $code . ' [10分钟内有效,注册成功后作废]', 5, $extend, null, 'ret_sms_');
            if (!$result) {
                $data = [];
                if (isset($extend['difference'])) {
                    $data['difference'] = $extend['difference'];
                }
                throw new \Exception('你获取短信验证码过于频繁,请稍后再试', 500);
            }
            return ['errcode' => 0, 'msg' => '短信发送成功', 'data' => []];
        } else {
            throw new \Exception('请输入手机号码', 500);
        }
    }

}