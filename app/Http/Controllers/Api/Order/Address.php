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

//收货地址（订单）
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
        $uid = $this->user->id;
        $periods_id = $params['periods_id'] ?? 0;

        if ($uid) {
            $user = DB::table('user')->where(['id' => $uid])->first(['id']);
            if (!$user) {
                throw new \Exception('用户不存在', 100);
            } else {

                $address_info = DB::table('user_deliver')->where(['user_id' => $uid, 'type' => 'matter'])->first();
                $contact_id = $params['contact_id'] ?? '';
                if(!$contact_id){
                    if($address_info){
                        $contact_id = $address_info->address;
                    }else{
                        $contact_id = '';
                    }
                }
                $contact_phone = $params['contact_phone'] ?? '';
                if(!$contact_phone){
                    if($address_info){
                        $contact_phone = $address_info->phone;
                    }else{
                        $contact_phone = '';
                    }
                }
                $contact_name = $params['contact_name'] ?? '';
                if(!$contact_name){
                    if($address_info){
                        $contact_name = $address_info->name;
                    }else{
                        $contact_name = '';
                    }
                }
                if($periods_id){
                    $periods = DB::table('periods')->where(['id' => $periods_id])->first(['contact_phone', 'order_status', 'goods_type', 'goods_id', 'buy']);
                    if ($periods->order_status == 1) {

                        $data['foff'] = 1; //订单状态
                        $data['contact_name'] = $contact_name;
                        $data['contact_phone'] = $contact_phone;
                        $data['contact_id'] = $contact_id;
                        $data['goods_id'] = $periods->goods_id;
                        $data['buy'] = $periods->buy;
                        $data['mark'] = 1;

                        $update_info = [
                            'order_status' => 2,
                            'contact_id' => $contact_id,
                            'contact_phone' => $contact_phone,
                            'contact_name' => $contact_name,
                            //'goods_type' => 0,
                            'order_type' => 2,
                            'confirm_at' => date('Y-m-d H:i:s')
                        ];
                        DB::table('periods')->where(['id' => $periods_id])->update($update_info);
                        DB::table('user_deliver')
                            ->updateOrInsert(
                                ['user_id' => $uid, 'type' => 'matter'],
                                ['address' => $contact_id, 'phone' => $contact_phone, 'name' => $contact_name, 'status' => 2]
                            );
                    } else if ($periods->order_status == 2) {
                        $data['mark'] = 2;
                    } else if ($periods->order_status == 3) {
                        DB::table('periods')->where(['id' => $periods_id])->update(['order_status' => 4]);
                        $data['mark'] = 3;
                    } else {
                        $data['mark'] = 4;
                    }
                }else{
                    DB::table('user_deliver')
                        ->updateOrInsert(
                            ['user_id' => $uid, 'type' => 'matter'],
                            ['address' => $contact_id, 'phone' => $contact_phone, 'name' => $contact_name, 'status' => 2]
                        );
                }
            }
        }

        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}