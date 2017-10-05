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

//收货地址列表
class AddressList extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    public function execute(array $params)
    {
        $data = [];
        $data = DB::table('user_deliver')
            ->where(['user_id' => $this->user->id, 'type' => 'matter'])
            ->orderBy('status', 'desc')
            ->get();

        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}