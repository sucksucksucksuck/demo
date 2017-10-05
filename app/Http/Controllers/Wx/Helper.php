<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/8/4
 * Time: 16:27
 */

namespace App\Http\Controllers\Wx;
use App\Common\Prize;
use Illuminate\Support\Facades\DB;

class Helper
{
    /**
     * 获取公众号信息
     * @param $wx_id
     * @return mixed
     */
    static public function getWxDate($wx_id)
    {
        $data = DB::table('wx')
            ->where('id', '=', $wx_id)
            ->first();
        return $data;
    }

    /**
     * 获取url
     * @param $app_id
     * @param $url
     * @return string
     */
    static public function getURL($app_id, $url)
    {
        $param = [
            'appid' => $app_id,
            'redirect_uri' => $url,
            'response_type' => 'code',
            'scope' => 'snsapi_base',
            'state' => 1
        ];
        return 'https://open.weixin.qq.com/connect/oauth2/authorize?' . http_build_query($param) . '#wechat_redirect';
    }

    /**
     * 通过公众号id或者verify_key或者verify_value
     * @param $param
     * @return mixed
     */
    static public function getVerifyValue($param)
    {
        if(is_numeric($param)){ //wx_id
            $data = DB::table('wx')
                ->where('id', '=', $param)
                ->select('verify_value')
                ->first();
        }else{ //key
            $data = DB::table('wx')
                ->where('verify_key', '=', $param)
                ->select('verify_value')
                ->first();
        }
        return $data->verify_value;
    }

    /**
     * 获取红包id
     */
    static public function getRedId()
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

}