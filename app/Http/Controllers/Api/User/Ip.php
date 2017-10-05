<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/7/11
 * Time: 13:51
 * Description: ip
 */

namespace App\Http\Controllers\Api\User;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;

//用户ip
class Ip extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    public function execute(array $params)
    {
        $city = $params['city'] ?? false;
        if(!$city){
            throw new \Exception('请选择城市', 500);
        }
        $ip = Helper::cityToIp($city);
        return ['errcode' => 0, 'msg' => '', 'data' => $ip];
    }

    public function city(){
        $city = Helper::cityList();
        return ['errcode' => 0, 'msg' => '', 'data' => $city];
    }

}