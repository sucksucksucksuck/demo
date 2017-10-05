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

//修改虚拟发货
class ChangeAli extends AbsResponse
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
            ->updateOrInsert(
                ['user_id' => $this->user->id, 'type' => 'ali'],
                [
                    'address' => $params['address'],
                    'phone' => $params['phone'],
                    'name' => $params['name'],
                    'status' => 2
                ]);

        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}