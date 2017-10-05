<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/22
 * Time: 15:12
 */

namespace App\Http\Controllers\Api\Address;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

//删除收货地址
class DeleteAddress extends AbsResponse
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

        DB::table('user_deliver')->where(['id' => $params['id']])->delete();

        return ['errcode' => 0, 'msg' => '', 'data' => []];
    }

}