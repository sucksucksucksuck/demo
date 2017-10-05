<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/8/4
 * Time: 16:27
 */

namespace App\Http\Controllers\Wx\Pgash;

use EasyWeChat\Foundation\Application;
use EasyWeChat\Message\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Wx\Helper;

class Message
{
    protected $wx_id = 1; //数据库wx表对应的id
    protected $app;
    protected $data;

    public function __construct()
    {
        $this->data = Helper::getWxDate($this->wx_id);
        if ($this->data->domain && substr($this->data->domain, 0, 7) != 'http://') {
            $this->data->domain = 'http://' . $this->data->domain;
        }
        $option = [
            'debug' => true,
            'app_id' => $this->data->app_id,
            'secret' => $this->data->secret,
            'token' => $this->data->token,
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
    public function execute(Request $request)
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
                                'url' => Helper::getURL($this->data->app_id, $this->data->domain . '/wx/pgash/page/get_auth'),
//                                'url' => Helper::getURL($this->data->app_id, 'http://back.pgyg.com/fetch?url=' . urlencode(url('/wx/pgash/page/get_auth'))),
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
                                'url' => Helper::getURL($this->data->app_id, $this->data->domain . '/wx/pgash/page/get_auth'),
//                                'url' => Helper::getURL($this->data->app_id, 'http://back.pgyg.com/fetch?url=' . urlencode(url('/wx/pgash/page/get_auth'))),
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
}