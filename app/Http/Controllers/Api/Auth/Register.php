<?php

namespace App\Http\Controllers\Api\Auth;

use App\Common\Aes;
use App\Common\Prize;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use App\Common\Helper;


/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/5/26
 * Time: 15:06
 */
class Register extends AbsResponse
{
    /**
     * 系统注册
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        Helper::isAllowReg();
        $phone = $params['phone'];
        $captcha = $params['captcha'] ?? '';
        $type = $params['type'] ?? 0;
        $password = $params['password'] ?? '';

        if (!$type) {
            if (!$captcha) {
                throw new \Exception('验证码不能为空', 500);
            }
            if ($captcha != \Cache::get('reg_sms_' . $phone)['code']) {
                throw new \Exception('验证码错误', 500);
            }
        }
        if ($password) {
            if (!Helper::CheckPassword($password)) {
                throw new \Exception('密码格式不对', 500);
            }
        }
        $user = DB::table('user')->where(['phone' => $phone])->first();
        if ($user) {
            throw new \Exception('手机号已存在', 1);
        } else {

            //注册
            $token = Helper::getToken(Helper::getMicrotime());
            if (!$this->request->header('ver')) {
                $version = '';
            } else {
                $version = $this->request->header('ver');
            }
            //新系统
            $id = DB::table('user')->insertGetId([
                'phone' => $phone,
                'nickname' => substr_replace($phone, '****', 3, 4),
                'password' => Helper::password($params['password']),
                'icon' => random_int(1, 13),
                'token' => $token,
                'create_at' => date('Y-m-d H:i:s'),
                'idaf' => $this->request->header('device') ?? '',
                'create_ip' => $this->request->getClientIp(),
                'device' => $this->request->header('type') == 'ios' ? 2 : 1,
                'version' => $version,
                'reg' => 1
            ]);
            //老系统
            DB::connection('anyou')->table('vip')->insert([
                'uid' => $id,
                'name' => substr_replace($phone, '****', 3, 4),
                'photo' => $phone,
                'ip' => $this->request->getClientIp(),
                'ip2' => $this->request->getClientIp(),
                'atime' => time(),
                'dltime' => time(),
                'passs' => Helper::mima($params['password']),
                'pt' => $this->request->header('type') == 'ios' ? 'i' : 'a',
                'tgqd' => 'pgyg',
                'zfbid' => '',
                'zfbname' => '',
                'reg' => 1,
            ]);

            //注册成功直接登陆
            $user = (new TokenLogin())->execute(['token' => $token, 'ip' => $this->request->getClientIp()])['data'];
            //user_login_log
            Helper::userLoginLog([
                'user_id' => $user->id,
                'idaf' => $this->request->header('device') ?? '',
                'device' => $this->request->header('type') == 'ios' ? 2 : 1,
                'ip' => $this->request->ip(),
                'version' => $this->request->header('version', 0),
            ]);
            //user_use
            Helper::userUse([
                'idaf' => $this->request->header('device') ?? '',
                'device' => $this->request->header('type') == 'ios' ? 2 : 1,
                'ip' => $this->request->ip()
            ]);
            //注册成功送新人红包
            if ($user) {
                $red_list = DB::table('red')->select(['id'])->where(['event_id' => 1])->get();
                foreach ($red_list as $v) {
                    Prize::red($user->id, $v->id, 1, 1);
                }
            }
            //发送消息
            Helper::addUserMessage('新人红包', '66元夺宝红包已发放到您的账号上，立即开始夺宝吧！', $user->id, 2);
        }
        return ['errcode' => 0, 'msg' => '注册成功', 'data' => $user];
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
            if ($user) {
                throw new \Exception('手机号已存在', 1);
            }
            $code = mt_rand(0, 9999);
            $code = str_pad($code, 4, '0', STR_PAD_LEFT);
            $extend = ['code' => $code];
            $result = Helper::sendSMS($phone, '您好，您的验证码是 ' . $code . ' [10分钟内有效,注册成功后作废]', 5, $extend, null, 'reg_sms_');
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

    /**
     * 检查验证码
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function checkCaptcha(array $params)
    {
        $phone = $params['phone'];
        $captcha = $params['captcha'] ?? '';

        if (!$captcha) {
            throw new \Exception('验证码不能为空', 500);
        }
        if ($captcha != \Cache::get('reg_sms_' . $phone)['code']) {
            throw new \Exception('验证码错误', 500);
        }
        return ['errcode' => 0, 'msg' => '', 'data' => []];
    }

}