<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/7/25
 * Time: 9:58
 */

namespace App\Http\Controllers\Notify;


use App\Common\Helper;
use EasyWeChat\Core\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;

class FuQianLa
{

    /**
     * @param $amount
     * @param $order_no
     * @param string $channel wx_app|ali_app
     * @return array|mixed|string
     */
    public static function pay($amount, $order_no, $channel = 'ali_pay_wap')
    {
        $data = [
            'title' => '付钱了支付',
            'params' => [
                'app_id' => config('pay.fu_qian_la.app_id'),
                'order_no' => $order_no,
                'amount' => strval($amount * 100),
                'channel' => $channel,
                'subject' => 'wangpan6',
                'notify_url' => url('/notify/fu_qian_la/result_notice')
            ]
        ];
        if ($channel == 'ali_pay_wap' || $channel == 'ali_pay_scan') {
            $data['params']['extra']['return_url'] = url('/return_url');
        } else if ($channel == 'wx_pay_pub') {
            $data['params']['extra'] = [
                'openid' => config('pay.fu_qian_la.open_id'),
                'cb' => 'callback'
            ];
        }
        $data['params'] = str_replace('"callback"', 'callback', json_encode($data['params'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        return [
            'errcode' => 0,
            'data' => [
                'mode' => 'web',
                'type' => 3,//
                'pay' => [
                    'type' => 'win',
                    'isLogin' => true,
                    'param' => [
                        'name' => 'h5_pay',
                        'url' => 'widget://html/new_win.html',
                        'bounces' => true,
                        'bgColor' => '#FFFFFF',
                        'delay' => 500,
                        'pageParam' => [
                            'script' => './lib/util/win.js',
                            'title' => '支付',
                            'page' => [
                                'name' => 'fu_qian_la_pay',
                                'url' => url('/fu_qian_la?') . http_build_query($data)
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }

    private static function is_assoc($arr)
    {
        return array_keys($arr) !== range(0, count($arr) - 1);
    }

    private static function getSign(array $params)
    {
        $sign = '';
        ksort($params);
        foreach ($params as $key => $val) {
            if ($val || $val === 0) {
                if (is_array($val) && self::is_assoc($val)) {
                    //  $sing_params = array_merge($sing_params, $val);
                    $v = self::getSign($val);
                    $sign .= "&$key={{$v}}";
                }
                if (!is_array($val) && strtolower($key) != 'sign_info' && strtolower($key) != 'sign_type') {
                    $sign .= "&$key=$val";
                    //$sing_params[$key] = $val;
                }
            }
        }
        return substr($sign, 1);
    }

    public static function query($order_no)
    {
        $data = [
            'charset' => 'UTF-8',
            'app_id' => config('pay.fu_qian_la.app_id'),
            'order_no' => $order_no,
            'version' => 'V2.1.1',
            'sign_type' => 'MD5'
        ];
        $sign = self::getSign($data);
        $data['sign_info'] = $sign . '&key=' . config('pay.fu_qian_la.key');
        $data['sign_info'] = strtoupper(md5($data['sign_info']));
        $http = new Http();
        $ret = $http->json('https://api.fuqian.la/services/order/singleQuery', $data);
        $json = $ret->getBody();
        $json = json_decode($json, true);
        if ($json['ret_code'] == '0000') {
            if ($json['ret_data']['status'] == '02') {
                self::success($json['ret_data']);
                return ['errcode' => 0, 'msg' => '查询成功'];
            }
            return ['errcode' => 1, 'msg' => ['01' => '支付初始', '02' => '支付成功', '03' => '支付失败', '04' => '支付受理中'][$json['ret_data']['status']]];
        }
        return ['errcode' => 1, 'msg' => $json['ret_desc']];
    }

    function resultNotice()
    {
        $json = file_get_contents('php://input', 'r');
        //Log::debug($json);
        $params = json_decode($json, true);
        if ($params) {
            // $params = ['a' => 0, 'b' => ['c' => '', 'd' => 3], 'dd' => 'aaa'];
            $sign = self::getSign($params);
            $sign_type = strtolower($params['sign_type'] ?? 'md5');
            $sign_info = $params['sign_info'];
            if ($sign_type == 'md5') {
                $sign_data = md5($sign . '&key=' . config('pay.fu_qian_la.key'));
                if (strtolower($sign_data) == strtolower($sign_info)) {
                    self::success($params);
                    return 'success';
                }
            } else {
                $sign = sha1($sign);
                openssl_public_encrypt($sign_info, $sign_data, config('pay.fu_qian_la.public_key'));
                //Log::debug($sign_data);
                if (strtolower($sign_data) == strtolower($sign)) {
                    self::success($params);
                    return 'success';
                }
            }
        }
        return 'fail';
        //   Log::debug($sign);
    }

    private static function success($params)
    {
        $charge_id = $params['charge_id'];
        $order_no = $params['order_no'];
        $pay_amt = $params['amount'] / 100;
        list($user_id) = explode('X', $order_no);
        Helper::payLog($user_id, $pay_amt, $charge_id, $order_no, 6, '付钱啦');
    }
}