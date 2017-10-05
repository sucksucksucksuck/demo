<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/7/19
 * Time: 10:02
 * Description: 查看订单状态
 */

namespace App\Http\Controllers\Api\Order;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

//查看订单状态
class Status extends AbsResponse
{
    public function execute(array $params)
    {
        $data = DB::table('periods')
            ->where(['id' => $params['periods_id']])
            ->select('order_status')
            ->first();

        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}