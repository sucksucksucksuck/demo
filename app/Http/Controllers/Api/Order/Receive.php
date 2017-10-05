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

//添加或更新收货信息（user_deliver）
class Receive extends AbsResponse
{
    public function execute(array $params)
    {
        $uid = $this->user->id;
        $info1 = DB::table('user_deliver')->where(['user_id' => $uid, 'type' => 'matter'])->first();
        $info2 = DB::table('user_deliver')->where(['user_id' => $uid, 'type' => 'ali'])->first();

        $contact_name = $params['contact_name'] ?? '';
        if(!$contact_name){
            if($info1){
                $contact_name = $info1->name;
            }else{
                $contact_name = '';
            }
        }
        $contact_phone = $params['contact_phone'] ?? '';
        if(!$contact_phone){
            if($info1){
                $contact_phone = $info1->phone;
            }else{
                $contact_phone = '';
            }
        }
        $contact_id = $params['contact_id'] ?? '';
        if(!$contact_id){
            if($info1){
                $contact_id = $info1->address;
            }else{
                $contact_id = '';
            }
        }
        $alipay_id = $params['alipay_id'] ?? '';
        if(!$alipay_id){
            if($info2){
                $alipay_id = $info2->address;
            }else{
                $alipay_id = '';
            }
        }
        $alipay_name = $params['alipay_name'] ?? '';
        if(!$alipay_name){
            if($info2){
                $alipay_name = $info2->name;
            }else{
                $alipay_name = '';
            }
        }
        $data = [
            'name' => $contact_name,
            'phone' => $contact_phone,
            'address' => $contact_id,
            'alipay_id' => $alipay_id,
            'alipay_name' => $alipay_name
        ];
        DB::table('user_deliver')
            ->updateOrInsert(
                ['user_id' => $uid, 'type' => 'matter'],
                ['address' => $contact_id, 'phone' => $contact_phone, 'name' => $contact_name, 'status' => 2]
            );
        if(!$info2 && $alipay_id && $alipay_name){
            DB::table('user_deliver')
                ->insert([
                    'user_id' => $uid,
                    'type' => 'ali',
                    'address' => $alipay_id,
                    'phone' => '',
                    'name' => $alipay_name,
                    'status' => 2]);
        }


        return ['errcode' => 0, 'msg' =>'', 'data' => $data];
    }
}