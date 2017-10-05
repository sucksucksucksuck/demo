<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/3/23
 * Time: 22:24
 */

namespace App\Http\Controllers\Notify;


use App\Common\DuiBaApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DuiBa
{
    private function sign($array)
    {
        ksort($array);
        $string = "";
        while (list(, $val) = each($array)) {
            $string = $string . $val;
        }
        return md5($string);
    }

    private function signVerify($array)
    {
        if ($array['appKey'] != config('dui_ba.app_key')) {
            return false;
        }
        if ($array["timestamp"] == NULL) {
            return false;
        }
        $new = array();
        $new["appSecret"] = config('dui_ba.app_secret');
        reset($array);
        while (list($key, $val) = each($array)) {
            if ($key != "sign") {
                $new[$key] = $val;
            }
        }
        $sign = $this->sign($new);
        if ($sign == $array["sign"]) {
            return TRUE;
        }
        return FALSE;
    }

    private function getBizIdNo()
    {
        $order_no = Cache::get('DuiBaOrderNo');
        if (!$order_no || $order_no < (date("Ymd") . "000000")) {
            $order_no = date("Ymd") . sprintf("%06d", mt_rand(2, 10));
        } else {
            $order_no = floatval($order_no) + mt_rand(2, 10);
        }
        Cache::forever('DuiBaOrderNo', $order_no);
        return $order_no;
    }

    function index(Request $request)
    {
        $user_id = 0;
        $credits = 0;
        if ($request->has('token')) {
            //$user = DB::table('user')->find($user_id);
            $user = DB::table('user')->where(['token' => $request->get('token')])->first();
            if ($user) {
                $credits = $user->residual_integral;
            }
        }
        return DuiBaApi::getLoginUrl($user_id, $credits);
    }

    function consumer(Request $request)
    {
        $params = $request->all();
        //Log::debug(print_r($params, true));
        if ($this->signVerify($params)) {
            $user = DB::table('user')->find($params['uid']);
            if (empty($user)) {
                return [
                    'status' => 'fail',
                    'errorMessage' => '账号不存在',
                    'credits' => $params['credits']
                ];
            } else if ($user->residual_integral < $params['credits']) {
                return [
                    'status' => 'fail',
                    'errorMessage' => '您的积分不够不能兑换',
                    'credits' => $user->residual_integral
                ];
            } else {
                $data = [
                    'status' => 'ok',
                    'errorMessage' => '',
                    'bizId' => $this->getBizIdNo(),
                    'credits' => $user->residual_integral - $params['credits']
                ];
                $insert = [
                    'credits' => $params['credits'],
                    'biz_id' => $data['bizId'],
                    'dui_ba_order_no' => $params['orderNum'] ?? '',
                    'user_id' => $user->id,
                    'amount' => ($params['facePrice'] ?? 0) / 100,
                    'description' => $params['description'] ?? '',
                    'wait_audit' => $params['waitAudit'] != 'false',
                    'type' => $params['type'],
                    'params' => $params['params'] ?? '',
                    'status' => 1,
                    'face_price' => $params['facePrice']
                ];
                DB::table('dui_ba')->insert($insert);
                return $data;
            }
        }
        return [
            'status' => 'fail',
            'errorMessage' => '验证失败',
            'credits' => 0,
        ];
    }

    function resultNotice(Request $request)
    {
        $params = $request->all();
        if ($this->signVerify($params)) {
            $dui_ba = DB::table('dui_ba')->where(['dui_ba_order_no' => $params['orderNum']])->first();
            $dui_ba_update = ['biz_id' => $params['bizId']];
            $periods_update = [];
            if ($params['success'] != 'false') {
                // $dui_ba_update['status'] = 4;
                $dui_ba_update['result'] = $params['errorMessage'] ?? '';
                $periods_update['error'] = '';
                $periods_update['payment_type'] = 4;
                $periods_update['order_status'] = 5;
                $periods_update['deliver_at'] = date('Y-m-d H:i:s');
                $periods_update['payment_channel'] = '兑吧';
                $periods_update['real_amount'] = intval($dui_ba->amount);
            } else {
                $dui_ba_update['status'] = 3;
                $dui_ba_update['result'] = $params['errorMessage'] ?? '';
                // Log::debug(strstr($params['errorMessage'], '收款账户有误或不存在'));
                if (strstr($params['errorMessage'], '审核不通过')) {
                    //$periods_update['error'] = '系统发现您作弊,拒绝打款';
                    $periods_update['payment_type'] = 3;
                    $periods_update['order_status'] = 5;
                } else {
                    $periods_update['error'] = '您所填写的支付宝账号及姓名有误，请重新填写并提交';
                    $periods_update['payment_type'] = 1;
                    $periods_update['order_status'] = 1;
                }
            }
            if ($dui_ba) {
                $user = DB::table('user')->find($dui_ba->user_id);
                if ($user && $user->id != 6) {
                    DB::table('user')
                        ->where(['id' => $user->id])
                        ->decrement('residual_integral', $dui_ba->credits);
                }
                DB::table('dui_ba')->where(['id' => $dui_ba->id])->update($dui_ba_update);
                DB::table('periods')->where(['id' => $dui_ba->periods_id])->update($periods_update);
            }
            return 'ok';
        }
        return 'fail';
    }
}