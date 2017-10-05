<?php

namespace App\Http\Controllers\Wx;

use App\Common\Helper;
use App\Common\Prize;
use EasyWeChat\Core\Http;
use EasyWeChat\Foundation\Application;
use EasyWeChat\Message\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/7/26
 * Time: 17:46
 */
class Index
{
    protected $app;

    public function __construct()
    {
        $option = [
            'debug' => true,
            'app_id' => config('wechat.app_id'),
            'secret' => config('wechat.secret'),
            'token' => config('wechat.token'),
            'aes_key' => config('wechat.aes_key'),
            'open_platform' => [
                'app_id' => config('wechat.app_id'),
                'secret' => config('wechat.secret'),
                'token' => config('wechat.token'),
                'aes_key' => config('wechat.aes_key'),
            ],
        ];
        try {
            //接入公众号
            $this->app = new Application($option);
            $this->app->access_token->getToken();
        } catch (\Exception $e) {
            throw new \Exception('初始化失败' . $e->getMessage(), 502);
        }
    }

    /**
     * 自定义消息回复
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function message(Request $request)
    {
        $server = $this->app->server;
        $server->setMessageHandler(function ($message) use ($request) {
            $open_id = $request->input('openid');
            $data = DB::table('user_other_login')
                ->where(['open_id' => $open_id, 'type' => 'wxpn'])
                ->first();
            if (!$data) {
                //插入用户数据
                DB::table('user_other_login')->insert([
                    'user_id' => 0,
                    'open_id' => $open_id,
                    'type' => 'wxpn',
                    'create_at' => date('Y-m-d H:i:s')
                ]);
            }
            switch ($message->MsgType) {
                case 'event':
                    switch (strtolower($message->Event)) {
                        case 'subscribe': //关注
                            $news = new News([
                                'title' => '关注公众号领红包福利',
                                'description' => '轻松三步，福利到手',
                                'url' => $this->getURL('get_auth'),
                                'image' => url('event/weixin/images/wx_banner_08.png'),
                            ]);
                            return $news;
                        case 'unsubscribe': //取消关注
                            break;
                        case 'click':
                            if ($message->EventKey == 'TEASE_KF') {
                                return '您好。有任何疑问，请拨打客服热线：400-076-7871  或者客服QQ：4000767871 我们会有专业客服帮您解答哦!';
                            }
                            break;
                    }
                    break;
                case 'text':
                    switch ($message->Content) {
                        case '8';
                            $news = new News([
                                'title' => '关注公众号领红包福利',
                                'description' => '轻松三步，福利到手',
                                'url' => $this->getURL('get_auth'),
                                'image' => url('event/weixin/images/wx_banner_08.png'),
                            ]);
                            return $news;
                            break;
                    }
                    break;
            }
        });
        return $server->serve();
    }

    /**
     * 根据微信返回的code获取open_id
     * @param Request $request
     * @return mixed
     */
    public function getAuth(Request $request)
    {
        $code = $request->get('code');
        $open_id = Cache::get($code, false);
        if (!$open_id) {
            $params = [
                'appid' => config('wechat.app_id'),
                'secret' => config('wechat.secret'),
                'code' => $code,
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
     * 获取点击链接用户的code
     */
    public function getAuthUrl()
    {
        $app_id = config('wechat.app_id');
        $redirect_uri = url('/wx/index/get_auth');
        $url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' . $app_id . '&redirect_uri=' . $redirect_uri . '&response_type=code&scope=snsapi_userinfo&state=wechat#wechat_redirect';
        return ['errcode' => 0, 'msg' => '', 'data' => $url];
    }

    /**
     * 用户个人中心
     * @param Request $request
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function userInfo(Request $request)
    {
        $params = [
            'appid' => config('wechat.app_id'),
            'secret' => config('wechat.secret'),
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
//                $user->icon = Helper::getAvatar($user->icon);
                return view('weixin_user', ['icon' => $user->icon, 'nickname' => $user->nickname, 'phone' => $user->phone, 'id' => $user->id, 'open_id' => $open_id]);
            } else {
                return view('weixin_user', ['icon' => '', 'nickname' => '', 'phone' => '', 'id' => '', 'open_id' => $open_id]);
            }
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
                $prize = $this->getRedId();
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
            $result = Helper::sendSMS($phone, '您好，您的验证码是 ' . $code . ' [10分钟内有效,登录成功后作废]', 5, $extend, null, 'wx_sms_');
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
     * 获取红包id
     */
    public function getRedId()
    {
        $prize_info = DB::table('event_prize as e')
            ->leftJoin('red as r', 'r.id', '=', 'e.prize')
            ->select('e.id', 'e.chance', 'e.prize')
            ->where([['e.event_id', 3], ['e.status', 1], ['e.type', 3]])
            ->get();
        $probability = [];
        foreach ($prize_info as $v) {
            $probability[] = json_decode($v->chance, true)[0];
        }
        $num = Prize::probability($probability, 10000);
        $prize = $prize_info[$num[0]];
        return ['prize_id' => $prize->id, 'red_id' => $prize->prize];
    }

    /**
     * 获取url
     * @param $params
     * @return string
     */
    public function getURL($params)
    {
        $params = [
            'appid' => config('wechat.app_id'),
            'redirect_uri' => url('/wx/index/' . $params),
            'response_type' => 'code',
            'scope' => 'snsapi_base',
            'state' => 1
        ];
        return 'https://open.weixin.qq.com/connect/oauth2/authorize?' . http_build_query($params) . '#wechat_redirect';
    }

    /**
     * 分享
     * @param Request $request
     * @return array
     */
    public function share(Request $request)
    {
        $js = $this->app->js;
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
     * 自定义菜单
     */
    public function addMenu()
    {
        $menu = $this->app->menu;
        $buttons = [
            [
                "name" => "盘古福利",
                "sub_button" => [
                    [
                        "type" => "view",
                        "name" => "红包福利",
                        'url' => $this->getURL('get_auth'),
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
                        'url' => $this->getURL('user_info'),
                    ]
                ]
            ]
        ];
        $menu->add($buttons);
    }

}