<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/29
 * Time: 15:15
 */

namespace app\Http\Controllers\Notify;


use App\Common\Helper;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

include 'jdpay/XMLUtil.php';
use XMLUtil;

class Jd
{

    function resultNotice(Request $request)
    {
        $xml = file_get_contents('php://input', 'r');
        //Log::debug($xml);
        if (empty($xml)) {
            return "fail";
        }
        $flag = XMLUtil::decryptResXml($xml, $resData);
        if (!$flag) {
            list($user_id) = explode('X', $resData['tradeNum']);
            Helper::payLog($user_id, $resData['amount'] / 100, $resData['tradeNum'], $resData['tradeNum'], 6, '京东');
            echo '验签成功';
            //echo json_encode($resdata);
        } else {
            echo '验签失败';
        }
    }
}