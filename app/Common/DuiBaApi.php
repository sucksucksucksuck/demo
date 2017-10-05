<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/3/22
 * Time: 18:44
 */

namespace App\Common;


use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DuiBaApi
{
    static $cookie_file = 'dui_ba' . DIRECTORY_SEPARATOR . 'dui_ba.cookie';

    /**
     * @param $p
     * @return string
     */
    static function sign($p)
    {
        $str = '';
        $str .= $p["appKey"];
        $str .= $p["appSecret"];
        $str .= $p["credits"];
        $str .= $p["timestamp"];
        $str .= $p["uid"];
        return md5($str);
    }

    public static function getLoginUrl($uid, $credits)
    {
        $params = [
            'uid' => $uid,
            'credits' => $credits,
            'appSecret' => config('dui_ba.app_secret'),
            'appKey' => config('dui_ba.app_key'),
            'timestamp' => number_format(time() * 1000 * 1000, 0, '.', ''),
        ];
        $params['sign'] = self::sign($params);
        // echo config('dui_ba.login_url') . '?' . http_build_query($params);
        return Helper::get(config('dui_ba.login_url'), $params, [], storage_path(self::$cookie_file));
    }

    /**
     * 获取登录地址
     * @return bool
     */
    function login()
    {
        //  Cache::forever('DUI_BA_COOKIE', $cookie);
        $content = self::getLoginUrl(config('dui_ba.user_id'), config('dui_ba.credits'));
        //Log::debug($content);
        return !!strstr($content, '<title>盘古积分兑换</title>');
    }

    function exposureNew()
    {
        $params = [
            'data[user_agent]' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
            'data[os]' => '1',
            'data[device_id]' => '',
            'data[finger_print]' => '',
            'data[coordinate]' => '',
            'data[url]' => 'http//goods.m.duiba.com.cn/mobile/detail?itemId=53&dbnewopen&dpm=25816.5.18.1&dcm=102.965498.0.0',
            'data[url_pattern]' => 'http//goods.m.duiba.com.cn/mobile/detail',
            'data[pre_url]' => 'http//home.m.duiba.com.cn/chome/index',
            'data[preurl_pattern]' => 'http//home.m.duiba.com.cn/chome/index',
            'data[session_id]' => '',
            'data[consumer_id]' => '655719812',
            'data[info_type]' => '1',
            'data[login_type]' => '25816',
            'data[item_id]' => '53',
            'data[app_item_id]' => '965498',
            'data[button_type]' => '80001',
            'data[ip]' => '120.85.206.174',
            'data[domain]' => '//embedlog.duiba.com.cn/',
            'data[app_id]' => '25816',
            'data[info]' => '53',
            'data[type]' => '0',
            '_' => time() * 1000,
            'callback' => 'tracks',
        ];
        return Helper::get('http://embedlog.duiba.com.cn/embed/exposureNew', $params, [], storage_path(self::$cookie_file));
    }

    function clickNew()
    {
        $params = [
            'data[user_agent]' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
            'data[os]' => '1',
            'data[device_id]' => '',
            'data[finger_print]' => '',
            'data[coordinate]' => '',
            'data[url]' => 'http//goods.m.duiba.com.cn/mobile/detail?itemId=53&dbnewopen&dpm=25816.5.18.1&dcm=102.965498.0.0',
            'data[url_pattern]' => 'http//goods.m.duiba.com.cn/mobile/detail',
            'data[pre_url]' => 'http//home.m.duiba.com.cn/chome/index',
            'data[preurl_pattern]' => 'http//home.m.duiba.com.cn/chome/index',
            'data[session_id]' => '',
            'data[consumer_id]' => '655719812',
            'data[info_type]' => '1',
            'data[login_type]' => '25816',
            'data[item_id]' => '53',
            'data[app_item_id]' => '965498',
            'data[button_type]' => '80001',
            'data[ip]' => '120.85.206.174',
            'data[domain]' => '//embedlog.duiba.com.cn/',
            'data[app_id]' => '25816',
            'data[info]' => '53',
            'data[type]' => '0',
            '_' => time() * 1000,
            'callback' => 'tracks',
        ];//{"consumer_id":655719812,"info_type":1,"os":"1","login_type":25816,"item_id":53,"app_item_id":965498,"button_type":"80001","ip":"120.85.206.174","domain":"//embedlog.duiba.com.cn/","app_id":25816,"info":53}
        return Helper::get('http://embedlog.duiba.com.cn/embed/clickNew', $params, [], storage_path(self::$cookie_file));
    }

    function initCaptcha()
    {
        return Helper::get(' http://api.geetest.com/get.php', ['callback' => 'initCaptcha'], [], storage_path(self::$cookie_file));
    }

    /**
     * 获取商品url
     * @return bool|string
     */
    function getItemUrl()
    {
        //http://home.m.duiba.com.cn/floor/3/0?duibaPageId=3&floorId=108&_=1491995197211&callback=jsonp6
        $url = config('dui_ba.item_url');
        $content = Helper::get($url['url'], $url['params'], [], storage_path(self::$cookie_file));
        // exit($content);
        $json = substr($content, 13, strlen($content) - 14);
        $data = json_decode($json, true);
        if ($data['success'] == 1) {
            foreach ($data['list'] as $d) {
                if ($d['type'] == 'alipay') {
                    return 'http:' . $d['link'];
                }
            }
        }
        return false;
    }

    /**
     * 获取一个token值
     * @param $uri
     * @return bool|string
     */
    function getBuyToken($uri = null)
    {
        if ($uri) {
            list(, $param) = explode('?', $uri);
            $url = 'http://www.duiba.com.cn/mobile/detail?' . $param;
            $content = Helper::get($url, [], [], storage_path(self::$cookie_file));
            preg_match('/save:function[^}]*}\)([\s\S]*)\$\.ajax/i', $content, $m);
            if (count($m) == 2) {
                $token = trim($m[1]) . "\r\n_token;";
                $v8js = new  \V8Js();
                return $v8js->executeString($token);
            }
        } else {
            $json = Helper::post(config('dui_ba.get_token'), [], [], storage_path(self::$cookie_file));
            //Log::debug($json);
            $data = json_decode($json, true);
            if ($data['success']) {
                $token = 'var window={};' . $data['token'];
                $v8js = new  \V8Js();
                return $v8js->executeString($token);
            }
        }
        return false;
    }

    /**
     * 兑换支付宝
     * @param string $alipay
     * @param string $realname
     * @param string|int $quantity
     * @param string $token
     * @return array
     */
    function buy($alipay, $realname, $quantity, $token)
    {
        $data = [
            'alipay' => $alipay,
            'degreeId' => in_array($quantity, config('dui_ba.amount')),
            'realname' => $realname,
            'token' => $token
        ];
//        $data = [
//            'alipay' => $alipay,
//            'quantity' => $quantity,
//            'realname' => $realname,
//            'token' => $token
//        ];
        $content = Helper::post(config('dui_ba.buy_url'), $data, [], storage_path(self::$cookie_file));
        // Log::debug('buy=>' . $content);
        $json = @json_decode($content, true);
        return $json;
    }

    function getRecordDetail($url)
    {
        $content = Helper::get($url, [], [], storage_path(self::$cookie_file));
        preg_match('/<p><span>订单编号：<\/span><strong>([^<]*)<\/strong><\/p>/i', $content, $m);
        if (count($m) == 2) {
            return trim($m[1]);
        }
        return false;
    }
}