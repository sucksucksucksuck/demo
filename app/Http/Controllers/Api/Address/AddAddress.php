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

//添加收货地址
class AddAddress extends AbsResponse
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

        $address_count = DB::table('user_deliver')->where(['user_id' => $this->user->id, 'type' => 'matter'])->count();
        if($address_count >= 3){
            throw new \Exception('实物收货地址最多填写三条', 500);
        }else{
            $add_info = [
                'user_id' => $this->user->id,
                'address' => $params['address'],
                'phone' => $params['phone'],
                'name' => $params['name'],
                'type' => 'matter',
                'status' => $params['status'] ?? 1
            ];
            if(isset($params['status']) && $params['status'] == 2){
                DB::table('user_deliver')->where(['user_id' => $this->user->id, 'type' => 'matter', 'status' => 2])->update(['status' => 1]);
            }
            DB::table('user_deliver')->insert($add_info);

            return ['errcode' => 0, 'msg' => '', 'data' => []];
        }
    }
}