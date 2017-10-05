<?php

namespace App\Http\Controllers\Api\User;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/2
 * Time: 13:06
 */
class BindPhone extends AbsResponse
{
    /**
     * 绑定手机号
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function bindPhone(array $params)
    {
        $phone = $params['phone'] ?? '';
        $captcha = $params['captcha'] ?? '';
        $password = $params['password'] ?? '';
        if(!$captcha){
            throw new \Exception('验证码不能为空', 500);
        }
        if($password){
            if(!Helper::CheckPassword($password)){
                throw new \Exception('密码格式不对', 500);
            }
        }
        if ($captcha != \Cache::get('bind_sms_' . $phone)['code']) {
            throw new \Exception('验证码错误', 500);
        }
        if($phone){
            $user_phone = DB::table('user')->where(['phone' => $phone])->first();
            if($user_phone){
                throw new \Exception('手机号已经被绑定', 500);
            }
            //更新user
            if($password){
                DB::table('user')->where(['id' => $this->user->id])->update(['phone' => $phone, 'password' => Helper::password($password)]);
                DB::connection('anyou')->table('vip')->where(['uid' => $this->user->id])->update(['photo' => $phone, 'passs' => Helper::mima($password)]);
            }else{
                DB::table('user')->where(['id' => $this->user->id])->update(['phone' => $phone]);
                DB::connection('anyou')->table('vip')->where(['uid' => $this->user->id])->update(['photo' => $phone]);
            }
            $this->user->phone = $phone;
            $this->user->bind = Helper::getUserBindInfo($this->user);
        }
        return ['errcode' => 0, 'msg' => '绑定成功', 'data' => $this->user];
    }

    /**
     * 发送短信
     * @param $params
     * @return array
     * @throws \Exception
     */
    public function sendSms(array $params){
        $phone = $params['phone'] ?? '';
        if($phone){
            $code = mt_rand(0, 9999);
            $code = str_pad($code, 4, '0', STR_PAD_LEFT);
            $extend = ['code' => $code];
            $result = Helper::sendSMS($phone, '您好，您的验证码是 ' . $code . ' [10分钟内有效,登录成功后作废]', 5, $extend, null, 'bind_sms_');
            if (!$result) {
                $data = [];
                if (isset($extend['difference'])) {
                    $data['difference'] = $extend['difference'];
                }
                throw new \Exception('你获取短信验证码过于频繁,请稍后再试', 500);
            }
            return ['errcode' => 0, 'msg' => '短信发送成功', 'data' => []];
        }else{
            throw new \Exception('请输入手机号码', 500);
        }
    }

    /**
     * 解绑手机
     * @return array
     * @throws \Exception
     */
    public function unBind()
    {
        $data = DB::table('user')->where(['id' => $this->user->id])->select('phone')->first();
        if(!$data && $data->phone){
            throw new \Exception('手机未被绑定', 500);
        }
        $bind = Helper::getUserBindInfo($this->user);
        if($bind->bind_count <= 1){
            throw new \Exception('绑定数量不能少于1', 500);
        }
        DB::table('user')->where('id','=', $this->user->id)->update(['phone' => null, 'password' => '']);
        DB::connection('anyou')->table('vip')->where(['uid' => $this->user->id])->update(['photo' => '', 'passs' => '']);
        $this->user->phone = '';
        $this->user->bind = Helper::getUserBindInfo($this->user);

        return ['errcode' => 0, 'msg' => '解绑成功', 'data' => $this->user];
    }

    /**
     * 绑定手机号(old app)
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $phone = $params['phone'] ?? '';
        $captcha = $params['captcha'] ?? '';
        if(!$captcha){
            throw new \Exception('验证码不能为空', 500);
        }
        if($phone){
            if ($captcha != \Cache::get('bind_sms_' . $phone)['code']) {
                throw new \Exception('验证码错误', 500);
            }
            $user_phone = DB::table('user')->where(['phone' => $phone])->first();
            if($user_phone){
                throw new \Exception('手机号已经被绑定', 500);
            }
            //更新anyou数据库vip表手机号
            if(isset($params['system']) && $params['system'] == 'old'){
                $vip = DB::connection('anyou')->table('vip')->where(['photo' => $phone])->first();
                if($vip){
                    throw new \Exception('手机号已经被绑定', 500);
                }
                DB::connection('anyou')->table('vip')->where(['uid' => $this->user->id])->update(['photo' => $phone]);
            }
            //更新user
            DB::table('user')->where(['id' => $this->user->id])->update(['phone' => $phone]);
            $this->user->phone = $phone;
            $this->user->bind = Helper::getUserBindInfo($this->user);
        }
        return ['errcode' => 0, 'msg' => '绑定成功', 'data' => $this->user];
    }

}