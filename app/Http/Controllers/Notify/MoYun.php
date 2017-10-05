<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/7/13
 * Time: 13:06
 */

namespace App\Http\Controllers\Notify;


use App\Common\Helper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MoYun
{
    public static function pay($amount, $order_no, $channel = 'alipay_scan')
    {
        $params = [
            'user_no' => config('pay.moYun.apiName'),
            'bill_no' => $order_no,
            'bill_time' => date('YmdHis'),
            'choosePayType' => $channel,
            'money' => '0.01',// $amount,
            'return_url' => url('/return_url'),// url('/notify/mo_yun/result_notice'),
            'client_ip' => request()->getClientIp(),
            'product_desc' => 'wangpan'
        ];
        ksort($params);
        $signString = '';
        foreach ($params as $key => $val) {
            $signString .= "{$key}={$val}&";
        }
        $signString .= config('pay.moYun.apiKey');
        $params['signMsg'] = md5($signString);
        $params['notify_url'] = url('/notify/mo_yun/result_notice');
        $data = [
            'title' => '魔云支付',
            'action' => 'http://moyun.sieiss85.top/api/pay?input_charset=UTF-8',
            'params' => $params
        ];
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
                                'name' => 'mo_yun_pay',
                                'url' => url('/auto_post?') . http_build_query($data)
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }

    function resultNotice(Request $request)
    {
        $params = [
            'accDate' => $request->input('accDate'),
            'bill_no' => $request->input('bill_no'),
            'money' => $request->input('money'),
            'orderNo' => $request->input('orderNo'),
            'orderStatus' => $request->input('orderStatus'),
            'tradeDate' => $request->input('tradeDate'),
            'User_no' => config('pay.moYun.apiName')
        ];
        //    ksort($params);
        $signString = '';
        foreach ($params as $key => $val) {
            $signString .= "{$key}={$val}&";
        }
        $signString .= config('pay.moYun.apiKey');
        $sign = $request->input('signMsg');
        if (strcasecmp($sign, md5($signString)) == 0) {
            $orderNo = $params['orderNo'];
            $bill_no = $params['bill_no'];
            list($user_id) = explode('X', $bill_no);
            Helper::payLog($user_id, $params['money'], $bill_no, $orderNo, 5, '');
            return 'success';
        }
        return 'fail';
    }
}