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

//虚拟发货
class Ali extends AbsResponse
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
            ->where(['user_id' => $this->user->id, 'type' => 'ali'])
            ->first();

        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}