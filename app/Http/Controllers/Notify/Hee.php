<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/13
 * Time: 19:51
 */

namespace App\Http\Controllers\Notify;


use App\Common\Helper;
use function GuzzleHttp\Psr7\str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class Hee
{
    private static function encrypt($data, $key)
    {
        $decodeKey = base64_decode($key);
        $iv = substr($decodeKey, 0, 16);
        return @mcrypt_encrypt(MCRYPT_RIJNDAEL_128, $decodeKey, $data, MCRYPT_MODE_CBC, $iv);
    }

    private static function decrypt($data, $key)
    {
        $decodeKey = base64_decode($key);
        $data = base64_decode($data);
        $iv = substr($decodeKey, 0, 16);
        return mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $decodeKey, $data, MCRYPT_MODE_CBC, $iv);
    }

    public static function short_pay($amount, $order_no, $card_type = '1')
    {
        $data = [
            'version' => '1',
            'user_identity' => md5(request()->header('device')),
            'hy_auth_uid' => '',
            'mobile' => '',
            'device_type' => request()->header('type'),
            'device_id' => request()->header('device'),
            'custom_page' => '',
            'display' => '0',
            'notify_url' => url('/notify/hee/short_notice'),
            'return_url' => url('/return_url'),
            'agent_bill_id' => $order_no,
            'agent_bill_time' => date('YmdHis'),
            'pay_amt' => $amount,
            'goods_name' => 'pay_for_goods',
            'goods_note' => '',
            'goods_num' => '1',
            'user_ip' => request()->getClientIp(),
            'ext_param1' => '',
            'ext_param2' => '',
            'auth_card_type' => $card_type,
            'timestamp' => time() . '000'
        ];
        $signString = '';
        foreach ($data as $key => $val) {
            $signString .= "&{$key}={$val}";
        }
        $signString = substr($signString, 1);
        $params = [
            'encrypt_data' => base64_encode(self::encrypt($signString, config('pay.hee.aesKey'))),
            'agent_id' => config('pay.hee.agentId')
        ];
        $data['agent_id'] = config('pay.hee.agentId');
        $data['key'] = config('pay.hee.singKey');
        ksort($data);
        $signString = '';
        foreach ($data as $key => $val) {
            $signString .= "&{$key}={$val}";
        }
        $signString = substr($signString, 1);
        $params['sign'] = md5(strtolower($signString));

        $xml = Helper::get('https://Pay.heepay.com/ShortPay/SubmitOrder.aspx', $params);
        $xml = simplexml_load_string($xml);
        if (intval($xml->ret_code)) {
            return [
                'errcode' => intval($xml->ret_code),
                'msg' => $xml->ret_msg
            ];
        }
        list(, $url) = explode('redirect_url=', trim(self::decrypt((string)$xml->encrypt_data, config('pay.hee.aesKey'))));

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
                            'title' => '骏卡支付',
                            'page' => [
                                'name' => 'jun_ka_pay',
                                'url' => $url
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }

    public static function jun_ka_pay($amount, $order_no)
    {
        $params = [
            'version' => '2',
            // $params['user_identity'] = md5(request()->header('device'));
            'agent_id' => config('pay.hee.agentId'),
            'agent_bill_id' => $order_no,
            'agent_bill_time' => date('YmdHis'),
            'pay_amt' => $amount,
            'notify_url' => url('/notify/hee/result_notice'),
            'return_url' => url('/return_url'),
            'user_ip' => request()->getClientIp(),
            'device_type' => 'WAP',
            'key' => config('pay.hee.singKey')
        ];
        $signString = '';
        foreach ($params as $key => $val) {
            $signString .= "&{$key}={$val}";
        }
        $signString = substr($signString, 1);
        // dd($str);
        $params['sign'] = md5($signString);
        $params['goods_name'] = 'pay_for_goods';
        $params['remark'] = '';
        unset($params['key']);
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
                            'title' => '骏卡支付',
                            'page' => [
                                'name' => 'jun_ka_pay',
                                'url' => 'https://pay.junka.com/Junka/Pay.aspx?' . http_build_query($params)
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }

    /**
     * @param $amount
     * @param $order_no
     * @param string $channel wx_app|ali_app
     * @return array|mixed|string
     */
    public static function pay($amount, $order_no, $channel = '22')
    {
        if (intval($channel) == 10) {
            return self::jun_ka_pay($amount, $order_no);
        }
        if (intval($channel) == 18) {
            return self::short_pay($amount, $order_no, 0);
        }
        if (intval($channel) == 19) {
            return self::short_pay($amount, $order_no, 1);
        }
        $params = [
            'version' => '1',
            // $params['user_identity'] = md5(request()->header('device'));
            'agent_id' => config('pay.hee.agentId'),
            'agent_bill_id' => $order_no,
            'agent_bill_time' => date('YmdHis'),
            'pay_type' => $channel,
            'pay_amt' => $amount,
            'notify_url' => url('/notify/hee/result_notice'),
            'user_ip' => request()->getClientIp(),
            //  'user_identity' => md5(request()->header('device')),
            'key' => config('pay.hee.singKey')
        ];
        $signString = '';
        foreach ($params as $key => $val) {
            $signString .= "&{$key}={$val}";
        }
        $signString = substr($signString, 1);
        // dd($str);
        $params['sign'] = md5($signString);
        $params['goods_name'] = 'wanpan3';
        $params['goods_num'] = '1';
        $params['remark'] = '';
        $params['return_url'] = url('/');
        $xml = Helper::get(config('pay.hee.payUrl'), $params);
        $p = xml_parser_create();
        xml_parse_into_struct($p, $xml, $values, $tags);
        xml_parser_free($p);
        if ($values[0]['tag'] == 'TOKEN_ID') {
            return [
                'errcode' => 0,
                'data' => [
                    'mode' => 'app',
                    'type' => 3,//
                    'pay' => "{$values[0]['value']},{$params['agent_id']},{$params['agent_bill_id']},$channel"
                ]
            ];
        } else {
            if ('风控验证失败' == $values[0]['value']) {
                return [
                    'errcode' => 1,
                    'msg' => '单次充值不允许超过3000元'
                ];
            }
        }
        return [
            'errcode' => 1,
            'msg' => '发起交易失败'//print_r($values, true),//
        ];
    }

    function resultNotice(Request $request)
    {
        // Log::debug($request->all());
        try {
            $return_sign = $request->get('sign');
            if (!$return_sign) {
                return 'fail';
            }
            $result = $request->get('result');
            $agent_id = $request->get('agent_id');
            $jnet_bill_no = $request->get('jnet_bill_no');
            $agent_bill_id = $request->get('agent_bill_id');
            $pay_type = $request->get('pay_type', '');
            $pay_amt = $request->get('pay_amt');
            $remark = $request->get('remark');

            $remark = iconv("GB2312", "UTF-8//IGNORE", urldecode($remark));//签名验证中的中文采用UTF-8编码;
            //$signStr = '';
            $signStr = 'result=' . $result;
            $signStr .= '&agent_id=' . $agent_id;
            $signStr .= '&jnet_bill_no=' . $jnet_bill_no;
            $signStr .= '&agent_bill_id=' . $agent_bill_id;
            $signStr .= '&pay_type=' . $pay_type;
            $signStr .= '&pay_amt=' . $pay_amt;
            $signStr .= '&remark=' . $remark;
            $signStr .= '&key=' . config('pay.hee.singKey'); //商户签名密钥
            $sign = strtolower(md5($signStr));
            if ($sign == $return_sign && $agent_id == config('pay.hee.agentId')) {
                list($user_id) = explode('X', $agent_bill_id);
                Helper::payLog($user_id, $pay_amt, $jnet_bill_no, $agent_bill_id, 3, $pay_type);
                return 'ok';
            }
        } catch (\Exception $e) {

        }
        return 'fail';
    }

    function shortNotice(Request $request)
    {
        $encrypt_data = $request->get('encrypt_data', '');
        $return_sign = $request->get('sign');
        $agent_id = $request->get('agent_id');
        $re_str = self::decrypt($encrypt_data, config('pay.hee.aesKey'));
        parse_str($re_str, $data);
        $data['agent_id'] = $agent_id;
        $data['key'] = config('pay.hee.singKey');
        ksort($data);
        $signStr = '';
        foreach ($data as $k => $v) {
            $signStr .= "&{$k}={$v}";
        }
        $signStr = ltrim($signStr, '&');
        $sign = md5(strtolower($signStr));
        if ($return_sign == $sign) {
            if (strtoupper($data['status']) == 'SUCCESS') {
                $jnet_bill_no = $data['hy_bill_no'];
                $agent_bill_id = $data['agent_bill_id'];
                $pay_amt = $data['pay_amt'];
                list($user_id) = explode('X', $agent_bill_id);
                Helper::payLog($user_id, $pay_amt, $jnet_bill_no, $agent_bill_id, 3, '快捷支付');
            }
            return 'ok';
        }
        return 'error';
    }
}