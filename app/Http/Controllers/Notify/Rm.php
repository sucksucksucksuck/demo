<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/3/23
 * Time: 22:24
 */

namespace App\Http\Controllers\Notify;


use App\Common\Helper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class Rm
{
    private static function toUrlParams($arr)
    {
        $buff = "";
        if (isset($arr['extra'])) {
            foreach ($arr['extra'] as $key => $value) {
                $arr[$key] = $value;
            }
            unset($arr['extra']);
        }
        ksort($arr);
        //print_r($arr);
        foreach ($arr as $k => $v) {
            if ($v == '') {
                continue;
            }
            if ($k != "sign" && !is_array($v)) {
                $buff .= $k . "=" . $v . "&";
            } else if ($k == "details") {
                $buff .= $k . "=[{";
                foreach ($v as $kv) {
                    ksort($kv);
                    foreach ($kv as $key => $value) {
                        $buff .= $key . "=" . $value . "&";
                    }
                }
                $buff = trim($buff, "&");
                $buff .= "}]&";
            }
        }
        $buff = trim($buff, "&");
        return $buff;
    }

    /**
     * @param $amount
     * @param $order_no
     * @param string $channel wx_app|ali_app
     * @return array|mixed|string
     */
    public static function pay($amount, $order_no, $channel = 'wx_app')
    {
        //  {"sign":"C35AF90CF988CFF44E37DDA149C5F1EF","amount":"1","tradeType":"cs.pay.submit","body":"可乐","extra":{"callbackUrl":"http://www.baidu.com"},"mchOrderNo":"201703302323232000","cardType":"2","channel":"gateway","bankCode":"6666","bankPayType":"01","version":"2.0","mchNo":"100120000000035"}
        //  list($user_id) = explode('X', $order_no);
        $arr = [
            'amount' => strval($amount),
            'body' => 'wangpan4',
            'channel' => $channel,
            'amountSettle' => '',
            'timeExpire' => '',
            'timeSettle' => '',
            'subject' => '',
            'currency' => 'CNY',
            'description' => 'wangpan',
            'mchNo' => config('pay.rm.mchId'),
            'mchOrderNo' => $order_no,
            //  'cardType' => 2,
            //  'storeOiType' => '2',
            //  'bankPayType' => '01',
            //  'bankCode' => '6666',
            //  'timePaid' => '',
            'tradeType' => 'cs.pay.submit',
            // 'pay_id' => $user_id,
            'version' => '2.0',
            'details' => [['innerOrderNo' => $order_no, 'virAccNo' => '0', 'amount' => strval($amount)]],
            'extra' => [
                //  'openId' => config('pay.appId'),
                'callbackUrl' => url('/return_url'),
                'notifyUrl' => url('/notify/rm/result_notice')
            ]
        ];
        $string = self::toUrlParams($arr);
        $string .= '&key=' . config('pay.rm.key');
        $arr['sign'] = strtoupper(MD5($string));
        $str_json = json_encode($arr, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        Log::debug($str_json);
        $result = Helper::post(config('pay.rm.url'), $str_json, [], null, 'json');
        //Log::debug(print_r($result, true));
        if ($result) {
            $result = json_decode($result, true);
            if (isset($result['tokenId'])) {
//                return ['tokenId' => $result['tokenId']];
                if (in_array($channel, ['gateway', 'ali_h5', 'payh5'])) {
                    if ($channel == 'gateway') {
                        $url = 'http://www.rm-tech.com.cn/agent-platform/bankSelect.html?token_id=' . $result['tokenId'];
                    } else {
                        $url = 'https://www.rm-tech.com.cn/agent-platform/h5Pay.html?token_id=' . $result['tokenId'];
                    }
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
                                    'bounces' => false,
                                    'bgColor' => '#FFFFFF',
                                    'delay' => 500,
                                    'pageParam' => [
                                        'script' => './lib/util/win.js',
                                        'title' => '支付',
                                        'page' => [
                                            'name' => 'rm_pay',
                                            // 'url' => 'http://test.rm-tech.com.cn/platform/h5Pay.html?token_id=' . $result['tokenId']
                                            'url' => $url
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ];
                } else {
                    return [
                        'errcode' => 0,
                        'data' => [
                            'mode' => 'app',
                            'type' => 4,//
                            'pay' => ['token' => $result['tokenId'], 'channel' => $channel]// "{$result['tokenId']},{$result['mchNo']},{$result['mchOrderNo']},$channel"
                        ]
                    ];
                }
            } else {
                // return $result;
            }
        }
        return ['errcode' => 1, 'msg' => '交易失败'];
    }

    function resultOldNotice(Request $request)
    {
        try {
            $json = file_get_contents('php://input', 'r');
            // Log::debug('resultOldNotice=' . $json);
            $data = json_decode($json, true);
            if (!$data || !isset($data['sign'])) {
                return 'fail';
            }
            $sign = $data['sign'];
            unset($data['sign']);
            $stringA = self::toUrlParams($data);
            $sign_string = $stringA . '&key=' . config('pay.rm.old_key');
            $self_sign = strtoupper(MD5($sign_string));
            if ($self_sign == $sign) {
                list($user_id) = explode('X', $data['outTradeNo']);
                Helper::payLog($user_id, $data['totalFee'], $data['outChannelNo'], $data['outTradeNo'], 4, '融脉');
                return 'success';
            }
        } catch (\Exception $e) {
        }
        return 'fail';
    }

    function resultNotice(Request $request)
    {
        //
        try {
            $json = file_get_contents('php://input', 'r');
            //Log::debug('resultNotice=' . $json);
            $data = json_decode($json, true);
            if (!$data || !isset($data['sign'])) {
                return 'fail';
            }
            $sign = $data['sign'];
            unset($data['sign']);
            $stringA = self::toUrlParams($data);
            $sign_string = $stringA . '&key=' . config('pay.rm.key');
            $self_sign = strtoupper(MD5($sign_string));
            if ($self_sign == $sign) {
                if (intval($data['status']) == 0) {
                    list($user_id) = explode('X', $data['mchOrderNo']);
                    Helper::payLog($user_id, $data['totalFee'], $data['cpOrderNo'], $data['mchOrderNo'], 4, '融脉');
                }
                return 'success';
            }
        } catch (\Exception $e) {
        }
        return 'fail';
    }

    function callback(Request $request)
    {
        $json = file_get_contents('php://input', 'r');
        $data = json_decode($json, true);
        Log::debug('参数为=' . print_r($data, true));
        return '{"errcode":0,"msg":"sdadasdasdasdasdas","data":{"a":1,"b":2,"c":[1,2,3,4,5]}}';
    }
}