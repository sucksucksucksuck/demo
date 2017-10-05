<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/22
 * Time: 10:09
 */

namespace App\Http\Controllers\Api\Address;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

//实物收货地址和虚拟收货地址
class Address extends AbsResponse
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
        $data['address'] = DB::table('user_deliver')
            ->where(['user_id' => $this->user->id, 'type' => 'matter'])
            ->orderBy('status', 'desc')
            ->get();

        $data['ali'] = DB::table('user_deliver')
            ->where(['user_id' => $this->user->id, 'type' => 'ali'])
            ->first();

        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}