<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/3/20
 * Time: 15:02
 * Description: 确认收货地址
 */

namespace App\Http\Controllers\Api\Order;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

class Goods extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    public function execute(array $params)
    {
        $data = DB::table('periods')
            ->where(['periods.id' => $params['periods_id']])
            ->select(['periods.goods_type'])
            ->first();
        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}