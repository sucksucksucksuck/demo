<?php

namespace App\Http\Controllers\Web\Auth;

use App\Common\Helper;
use App\Exceptions\AppException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Mews\Captcha\Facades\Captcha;

/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/2/15
 * Time: 14:36
 */
class Login extends AbsAuth
{
    public function execute(Request $request)
    {
        $account = $request->input('user_id');
        $password = $request->input('password');
        $captcha = $request->input('captcha');
        $code = $request->input('code');
        if (empty($account)) {
            throw new \Exception('请输入用户名', 100);
        }
        if (empty($password)) {
            throw new \Exception('请输入密码', 100);
        }
        if (!config('app.global.AdminLoginSMSCode', true)) {
            if (empty($captcha)) {
                throw new \Exception('请输入图片验证码', 100);
            }
            if (!Captcha::check($captcha)) {
                $request->session()->remove('captcha');
                throw new \Exception('验证码错误', 100);
            }
        }
        $user = DB::table('admin as a')->leftJoin('admin_group as ag', 'ag.id', '=', 'a.group_id')->select('a.*', 'ag.title')->where(['account' => $account])->first();
        if (empty($user)) {
            throw new \Exception('用户名不存在', 100);
        }
        if ($user->status != 1) {
            throw new \Exception('用户已经被锁定', 100);
        }
        if ($user->group_id && $user->site != 0 && $user->site != config("app.site")) {
            throw new \Exception('非法登录，请核对账号', 100);
        }
        if (config('app.global.AdminLoginSMSCode', true)) {
            if (empty($code)) {
                throw new \Exception('请输入短信验证码', 100);
            }
            $sms = Cache::get('login_sms_' . $user->phone);
            if ($code != $sms['code']) {
                //     if ($code != 123456) {
                throw new \Exception('短信验证码错误', 100);
            }
        }
        if ($user->password != Helper::password($password)) {
            throw new \Exception('密码输入错误', 100);
        }
        DB::table('admin')->where(['id' => $user->id])->update(['last_login_at' => date('Y-m-d H:i:s')]);
        DB::table('admin_log')->insert([
            'admin_id' => $user->id,
            'log' => '登录成功',
            'type' => 1,
            'ip' => substr(implode(',', $request->ips()), 0, 200)
        ]);
        $user->session_id = $request->session()->getId();
        if ($user->permission) {
            $user->permission = json_decode($user->permission, true);
        }
        $user->lock = json_decode($user->lock??'[]', true);
        $user->title = $user->group_id ? $user->title : '超级管理员';
        session(['admin' => $user]);
        Cache::forget('login_sms_' . $user->phone);
        return ['errcode' => 0, 'msg' => '登录成功', 'data' => ['user' => $user, 'menu' => $this->getMenu()]];
    }

    /**
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function getCode(Request $request)
    {
        $account = $request->input('user_id');
        $password = $request->input('password');
        $captcha = $request->input('captcha');
        if (empty($account)) {
            throw new \Exception('请输入用户名', 100);
        }
        if (empty($password)) {
            throw new \Exception('请输入密码', 100);
        }
        if (empty($captcha)) {
            throw new \Exception('请输入图片验证码', 100);
        }
        if (!Captcha::check($captcha)) {
            $request->session()->remove('captcha');
            throw new \Exception('验证码错误', 100);
        }
        $user = DB::table('admin')->where(['account' => $account])->first();
        if (empty($user)) {
            throw new \Exception('用户名不存在', 100);
        }
        if ($user->status != 1) {
            throw new \Exception('用户已经被锁定', 100);
        }
        if ($user->password != Helper::password($password)) {
            throw new \Exception('密码输入错误', 100);
        }
        $code = mt_rand(0, 999999);
        $code = str_pad($code, 6, '0', STR_PAD_LEFT);
        $extend = ['code' => $code];
        $resutl = Helper::sendSMS($user->phone, '您好，您的验证码是 ' . $code . ' [10分钟内有效,登录成功后作废]', 5, $extend, null, 'login_sms_');
        if (!$resutl) {
            $data = [];
            if (isset($extend['difference'])) {
                $data['difference'] = $extend['difference'];
            }
            throw new AppException('你获取短信验证码过于频繁,请稍后再试', 100, $data);
        }
        return ['errcode' => 0, 'msg' => '短信发送成功'];
    }

    protected function getMenu()
    {
        $user = session('admin');
        $permission = $user->permission;
        $menu_id = false;
        if ($permission !== null) {
            $menu_id = array_keys($permission);
            $pid = [];
            $p_menu = DB::table('menu')->whereIn('id', $menu_id)->get(['pid']);
            foreach ($p_menu as $p) {
                if ($p->pid && !in_array($p->pid, $pid)) {
                    $pid[] = $p->pid;
                }
            }
            $menu = DB::table('menu')->whereNull('pid')->where(['show' => 1, 'status' => 1])->whereIn('id', $pid)->orderBy('sort', 'desc')->get(['class', 'id', 'pid', 'module', 'title', 'url', 'extend']);
        } else {
            $menu = DB::table('menu')->whereNull('pid')->where(['show' => 1, 'status' => 1])->orderBy('sort', 'desc')->get(['class', 'id', 'pid', 'module', 'title', 'url', 'extend']);
        }
        foreach ($menu as &$m) {
            $m->extend = json_decode($m->extend, true);
            $query = DB::table('menu')->where(['pid' => $m->id, 'show' => 1, 'status' => 1])->orderBy('sort', 'desc');
            if ($menu_id) {
                $query->whereIn('id', $menu_id);
            }
            $m->sub = $query->get(['class', 'id', 'pid', 'module', 'title', 'url', 'extend']);
            if ($m->sub->count() > 0) {
                $m->has_sub = true;
                foreach ($m->sub as &$sub) {
                    $sub->extend = json_decode($sub->extend, true);
                }
            } else {
                $m->has_sub = false;
            }
        }
        return $menu;
    }

    function ping()
    {
        Session::reflash();
        $user = session('admin');
        return ['errcode' => 0, 'msg' => 'ping成功', 'data' => ['isLogin' => !!$user]];
    }
}