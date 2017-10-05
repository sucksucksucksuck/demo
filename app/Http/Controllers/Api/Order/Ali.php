<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/4/17
 * Time: 19:02
 * Description: 确认收货地址
 */

namespace App\Http\Controllers\Api\Order;

use App\Http\Controllers\Api\AbsResponse;
use App\Jobs\DuiBa;
use Illuminate\Support\Facades\DB;

//兑奖确认虚拟收货信息页面
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
        $periods_id = $params['periods_id'] ?? 0;
        $contact_id = $params['contact_id'] ?? ''; //支付宝id
        $contact_name = $params['contact_name'] ?? ''; //支付宝姓名

        $periods = DB::table('periods')->where(['id' => $periods_id])->first();
        $data = DB::table('user_deliver')->where(['user_id' => $this->user->id, 'type' => 'ali'])->first();
        if (empty($contact_id) || empty($contact_name)) {
            $ali_data = [
                'zfbid' => $data->address,
                'zfbname' => $data->name
            ];
            return ['errcode' => 0, 'msg' => '请求成功', 'data' => $ali_data];
        } else {
            if (strlen($contact_id) < 4 || strlen($contact_id) > 32) {
                throw new \Exception('支付宝账户不合法', 100);
            }
            if (strlen($contact_name) < 1) {
                throw new \Exception('请填写正确的支付宝姓名', 100);
            }
            if ($periods->order_status == 1) {
                DB::table('periods')->where([
                    'id' => $periods_id,
                    'user_id' => $this->user->id
                ])
                    ->update([
                        'contact_id' => $contact_id,
                        'contact_name' => $contact_name,
                        'order_status' => 2,
                        //'goods_type' => 1
                        'order_type' => 1,
                        'confirm_at' => date('Y-m-d H:i:s')
                    ]);
                $info = DB::table('user_deliver')->where(['user_id' => $this->user->id, 'type' => 'ali'])->first();
                if (!$info && $contact_id && $contact_name) {
                    DB::table('user_deliver')
                        ->insert([
                            'user_id' => $this->user->id,
                            'type' => 'ali',
                            'address' => $contact_id,
                            'phone' => '',
                            'name' => $contact_name,
                            'status' => 2]);
                }

//                if (in_array($periods->amount, config('dui_ba.amount')) && $periods->user_type == 0) {
//                    $job = new DuiBa($periods->id);
//                    dispatch($job);
//                }
            }
            $ali_data = [
                'zfbid' => $contact_id,
                'zfbname' => $contact_name
            ];
            return ['errcode' => 0, 'msg' => '请求成功', 'data' => $ali_data];
        }
    }
}