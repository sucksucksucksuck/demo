<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/8/4
 * Time: 16:28
 */

namespace App\Http\Controllers\Wx\Pgash;

use App\Common\Prize;
use EasyWeChat\Core\Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Wx\Helper;
use App\Common\Helper as Helper2;
use EasyWeChat\Foundation\Application;

class Page
{
    protected $wx_id = 1;
    protected $data;

    public function __construct()
    {
        $this->data = Helper::getWxDate($this->wx_id);
        if ($this->data->domain && substr($this->data->domain, 0, 7) != 'http://') {
            $this->data->domain = 'http://' . $this->data->domain;
        }
    }

    /**
     * 红包信息
     * @param Request $request
     * @return array
     */
    public function getRedInfo(Request $request)
    {
        $red_id = $request->input('red_id');
        $data = DB::table('red')
            ->where(['id' => $red_id])
            ->first();
        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }

    /**
     * 判断是否已经领取过红包
     * @param Request $request
     * @return array
     */
    public function red(Request $request)
    {
        $open_id = $request->input('open_id') ?? '';
        if ($open_id) {
            $info = DB::table('user_other_login')->where(['open_id' => $open_id, 'type' => 'wxpn'])->first();
            if ($info) {
                if ($info->user_id > 0) {
                    $data = DB::table('user_red')
                        ->leftJoin('red', 'red.id', '=', 'user_red.red_id')
                        ->where(['red.event_id' => 3, 'user_red.user_id' => $info->user_id])
                        ->first();
                    return ['errcode' => 501, 'msg' => '已领取', 'data' => $data];
                } else {
                    return ['errcode' => 0, 'msg' => '未领取', 'data' => []];
                }
            } else {
                return ['errcode' => 502, 'msg' => '未关注公众号', 'data' => []];
            }
        }
        return ['errcode' => 503, 'msg' => '未登录', 'data' => []];
    }

    /**
     * 发送短信
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function sendSms(Request $request)
    {
        $phone = $request->input('phone') ?? '';
        if ($phone) {
            $user = DB::table('user')->where(['phone' => $phone])->first();
            if (!$user) {
                return ['errcode' => 503, 'msg' => '手机号尚未注册盘古云购', 'data' => []];
            } else {
                $bind = DB::table('user_other_login')->where(['user_id' => $user->id, 'type' => 'wxpn'])->first();
                if ($bind) {
                    return ['errcode' => 504, 'msg' => '手机号已绑定微信', 'data' => []];
                }
            }
            $code = mt_rand(0, 9999);
            $code = str_pad($code, 4, '0', STR_PAD_LEFT);
            $extend = ['code' => $code];
            $result = Helper2::sendSMS($phone, '您好，您的验证码是 ' . $code . ' [10分钟内有效,登录成功后作废]', 5, $extend, null, 'wx_sms_');
            if (!$result) {
                $data = [];
                if (isset($extend['difference'])) {
                    $data['difference'] = $extend['difference'];
                }
                return ['errcode' => 500, 'msg' => '你获取短信验证码过于频繁,请稍后再试', 'data' => []];
            }
            return ['errcode' => 0, 'msg' => '短信发送成功', 'data' => []];
        } else {
            return ['errcode' => 500, 'msg' => '请输入手机号码', 'data' => []];
        }
    }

    /**
     * 绑定手机号
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function bindPhone(Request $request)
    {
        $phone = $request->input('phone') ?? '';
        $captcha = $request->input('captcha') ?? '';
        $open_id = $request->input('open_id') ?? '';
        if (!$phone) {
            return ['errcode' => 500, 'msg' => '手机号不能为空', 'data' => []];
        } else {

            $info = DB::table('user_other_login')->where(['open_id' => $open_id, 'type' => 'wxpn'])->first();
            if ($info) {
                if ($info->user_id > 0) {
                    return ['errcode' => 501, 'msg' => '该微信已绑定手机', 'data' => []];
                }
            } else {
                return ['errcode' => 502, 'msg' => '未关注公众号', 'data' => []];
            }

            if (!$captcha) {
                return ['errcode' => 501, 'msg' => '验证码不能为空', 'data' => []];
            }
            if ($captcha != \Cache::get('wx_sms_' . $phone)['code']) {
                return ['errcode' => 502, 'msg' => '验证码错误', 'data' => []];
            }
            $user = DB::table('user')->where(['phone' => $phone])->first();
            if (!$user) {
                return ['errcode' => 503, 'msg' => '手机号尚未注册盘古云购', 'data' => []];
            } else {
                $bind = DB::table('user_other_login')->where(['user_id' => $user->id, 'type' => 'wxpn'])->first();
                if ($bind) {
                    return ['errcode' => 504, 'msg' => '手机号已绑定微信', 'data' => []];
                }
                DB::table('user_other_login')->where(['open_id' => $open_id, 'type' => 'wxpn'])->update(['user_id' => $user->id]);
                //发送红包
                $prize = Helper::getRedId();
                $prize_id = $prize['prize_id'];
                $red_id = $prize['red_id'];
                Prize::red($user->id, $red_id);
                DB::table('user_prize')->insert([
                    'user_id' => $user->id,
                    'prize_id' => $prize_id,
                    'create_at' => date('Y-m-d H:i:s'),
                    'status' => 1,
                    'event_id' => 3
                ]);
                $data['red'] = DB::table('red')->where(['id' => $red_id])->first();
                $data['user'] = $user;
                return ['errcode' => 0, 'msg' => '绑定成功', 'data' => $data];
            }
        }
    }

    /**
     * 根据微信返回的code获取open_id
     * @param Request $request
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     * @throws \Exception
     */
    public function getAuth(Request $request)
    {
        $data = Helper::getWxDate($this->wx_id);
        $code = $request->input('code');
        $open_id = Cache::get($code, false);
        if (!$open_id) {
            $params = [
                'appid' => $data->app_id,
                'secret' => $data->secret,
                'code' => $request->input('code'),
                'grant_type' => 'authorization_code',
            ];
            $http = new Http();
            $result = $http->get('https://api.weixin.qq.com/sns/oauth2/access_token', $params)->getBody();
            $result = json_decode($result, true);
            if (isset($result['errcode'])) {
                return $result['errmsg'];
            } else {
                $open_id = $result['openid'];
                Cache::put($code, $open_id, 10);
            }
        }
        //判读是否领取红包
        $info = DB::table('user_other_login')->where(['open_id' => $open_id, 'type' => 'wxpn'])->first();
        if ($info && $info->user_id > 0) {
            $data = DB::table('user_red')
                ->leftJoin('red', 'red.id', '=', 'user_red.red_id')
                ->where(['red.event_id' => 3, 'user_red.user_id' => $info->user_id])
                ->select('user_red.amount')
                ->first();
            return view('weixin', ['open_id' => $open_id, 'red' => $data->amount]);
        }
        return view('weixin', ['open_id' => $open_id, 'red' => '']);
    }

    /**
     * 用户个人中心
     * @param Request $request
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     * @throws \Exception
     */
    public function userInfo(Request $request)
    {
        $params = [
            'appid' => $this->data->app_id,
            'secret' => $this->data->secret,
            'code' => $request->input('code'),
            'grant_type' => 'authorization_code',
        ];
        $http = new Http();
        $result = $http->get('https://api.weixin.qq.com/sns/oauth2/access_token', $params)->getBody();
        $result = json_decode($result, true);
        if (isset($result['errcode'])) {
            return $result['errmsg'];
        } else {
            $open_id = $result['openid'];
            $user = DB::table('user_other_login as l')
                ->leftJoin('user as u', 'l.user_id', '=', 'u.id')
                ->where(['l.open_id' => $open_id, 'l.type' => 'wxpn'])
                ->select(['u.icon', 'u.nickname', 'u.phone', 'u.id'])
                ->first();
            if ($user) {
                return view('weixin_user', ['icon' => $user->icon, 'nickname' => $user->nickname, 'phone' => $user->phone, 'id' => $user->id, 'open_id' => $open_id]);
            } else {
                return view('weixin_user', ['icon' => '', 'nickname' => '', 'phone' => '', 'id' => '', 'open_id' => $open_id]);
            }
        }
    }

    /**
     * 自定义菜单
     */
    public function addMenu()
    {
        $option = [
            'debug' => true,
            'app_id' => $this->data->app_id,
            'secret' => $this->data->secret,
            'token' => $this->data->token,
        ];
        try {
            //接入公众号
            $app = new Application($option);
        } catch (\Exception $e) {
            throw new \Exception('初始化失败' . $e->getMessage(), 502);
        }
        $menu = $app->menu;
        $buttons = json_decode($this->data->menu, true);
        return $menu->add($buttons);
    }

    /**
     * 分享
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function share(Request $request)
    {
        $option = [
            'debug' => true,
            'app_id' => $this->data->app_id,
            'secret' => $this->data->secret,
            'token' => $this->data->token,
        ];
        try {
            //接入公众号
            $app = new Application($option);
        } catch (\Exception $e) {
            throw new \Exception('初始化失败' . $e->getMessage(), 502);
        }
        $js = $app->js;
        $url = $request->input('url');
        $js->setUrl($url);
        $data = $js->config(array('onMenuShareTimeline', 'onMenuShareAppMessage'), true, false, false);
        if ($data) {
            return ['errcode' => 0, 'msg' => '', 'data' => $data];
        } else {
            return ['errcode' => 500, 'msg' => '', 'data' => []];
        }
    }

    /**
     * @return \EasyWeChat\Support\Collection
     */
    public function getMenu()
    {
        $buttons = [
            [
                "name" => "盘古福利",
                "sub_button" => [
                    [
                        "type" => "view",
                        "name" => "红包福利",
                        'url' => Helper::getURL($this->data->app_id, $this->data->domain . '/wx/pgash/page/get_auth'),
//                        'url' => Helper::getURL($this->data->app_id, 'http://back.pgyg.com/fetch?url=' . urlencode(url('/wx/pgash/page/get_auth'))),
                    ]
                ],
            ],
            [
                "name" => "盘古神器",
                "sub_button" => [
                    [
                        "type" => "view",
                        "name" => "下载APP",
                        "url" => "http://a.app.qq.com/o/simple.jsp?pkgname=com.k851830011.ptn"
                    ],
                    [
                        "type" => "view",
                        "name" => "常见问题",
                        "url" => "https://mp.weixin.qq.com/s/z_OcF-U3gG63wKlrsx3r4g"
                    ],
                    [
                        "type" => "view",
                        "name" => "盘古简介",
                        "url" => "http://www.pgyg.com/cms.php?ev_id=16"
                    ],
                ],
            ],
            [
                "name" => "联系客服",
                "sub_button" => [
                    [
                        "type" => "click",
                        "name" => "挑逗客服",
                        "key" => "TEASE_KF"
                    ],
                    [
                        "type" => "view",
                        "name" => "个人中心",
                        'url' => Helper::getURL($this->data->app_id, $this->data->domain . '/wx/pgash/page/user_info'),
//                        'url' => Helper::getURL($this->data->app_id, 'http://back.pgyg.com/fetch?url=' . urlencode(url('/wx/pgash/page/user_info'))),
                    ]
                ]
            ]
        ];
        return json_encode($buttons);
    }
}