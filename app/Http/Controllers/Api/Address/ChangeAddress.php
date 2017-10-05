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

//修改收货地址
class ChangeAddress extends AbsResponse
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
        $update_info = [
            'address' => $params['address'],
            'phone' => $params['phone'],
            'name' => $params['name'],
            'status' => $params['status'] ?? 1
        ];

        if(isset($params['status']) && $params['status'] == 2){
            DB::table('user_deliver')->where(['user_id' => $this->user->id, 'type' => 'matter', 'status' => 2])->update(['status' => 1]);
        }
        DB::table('user_deliver')->where(['id' => $params['id']])->update($update_info);

        return ['errcode' => 0, 'msg' => '', 'data' => []];
    }

}