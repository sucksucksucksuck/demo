<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Api\AbsResponse;
use App\Http\Controllers\Notify\FuQianLa;
use App\Http\Controllers\Notify\Hee;
use App\Http\Controllers\Notify\MoYun;
use App\Http\Controllers\Notify\Rm;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Common\Helper;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/13
 * Time: 17:30
 */
class Pay extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    private function getOrderNo()
    {
        $order_no = Cache::get('now_order_no', date("Ymd") . sprintf("%06d", mt_rand(2, 10)));
        if ($order_no < (date("Ymd") . "000000")) {
            $order_no = date("Ymd") . sprintf("%06d", mt_rand(2, 10));
        } else {
            $order_no += mt_rand(2, 10);
        }
        Cache::forever('now_order_no', $order_no);
        return $order_no;
    }

    /**
     * 支付
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $amount = $params['amount'];
        $order = $params['buy'] ?? '';
        $red_id = $params['red_id'] ?? '';
        $order_no = $this->user->id . 'X' . $this->getOrderNo();
        $order_no .= 'X';
        $order_no .= $order;
        $order_no .= 'X';
        $order_no .= $red_id;
        switch (intval($params['type'])) {
            case 3:
                return Hee::pay($amount, $order_no, $params['channel']);
            case 4:
                return Rm::pay($amount, $order_no, $params['channel']);
            case 5:
                return MoYun::pay($amount, $order_no, $params['channel']);
            case 6:
                return FuQianLa::pay($amount, $order_no, $params['channel']);
        }
        return ['errcode' => 404, 'msg' => '未能找到相应的支付'];
    }
}