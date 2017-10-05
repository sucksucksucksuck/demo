<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/19
 * Time: 10:09
 */

namespace App\Http\Controllers\Api\Address;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

//确认收货地址
class ConfirmAddress extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    public function execute(array $params)
    {
        $update_info = [
            'order_status' => 2,
            'contact_id' => $params['address'],
            'contact_phone' => $params['phone'],
            'contact_name' => $params['name'],
            'order_type' => 2,
            'confirm_at' => date('Y-m-d H:i:s')
        ];
        DB::table('periods')->where('id', '=', $params['periods_id'])->update($update_info);

        return ['errcode' => 0, 'msg' => '', 'data' => []];
    }
}