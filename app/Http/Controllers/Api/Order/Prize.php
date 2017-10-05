<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/3/17
 * Time: 11:02
 * Description: 单个中奖信息
 */

namespace App\Http\Controllers\Api\Order;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

//确认中奖页面
class Prize extends AbsResponse
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
        $prefix = DB::getTablePrefix();
        $info = DB::table('periods')
            ->leftJoin('goods', 'periods.goods_id', '=', 'goods.id')
            ->leftJoin('order', 'periods.order_id', '=', 'order.id')
            ->where(['periods.user_id' => $this->user->id])
            ->where(['periods.id' => $params['periods_id']])
            ->select([
                'periods.user_type',
                'periods.goods_id',
                'periods.goods_type',
                'periods.periods',
                'periods.unit_price',
                'periods.order_type',
                'periods.order_status',
                'periods.lucky_code',
                'periods.contact_id',
                'periods.share_id',
                'periods.contact_name',
                'periods.contact_phone',
                'periods.payment_no',
                'periods.payment_channel',
                'periods.lottery_show_at',
                'periods.confirm_at',
                'periods.deliver_at',
                'periods.total',
                'periods.buy',
                'periods.id',
                'periods.user_id',
                DB::raw("(select SUM(num) from {$prefix}order where periods_id = {$prefix}periods.id and user_id = {$prefix}periods.user_id) as num2"),
                'order.ip',
                'order.create_at',
                'goods.title',
                'goods.icon'])
            ->get();

        foreach ($info as &$d) {
            if ($d->user_type == 1) { //用户类型
                $robot = 1;
            } else {
                $robot = 0;
            }
            if($d->order_type == 1){
                $d->payment_no = '';
                $d->payment_channel = '';
            }
            if(isset($params['system']) && $params['system'] == 'old'){
                $d->order_status = ($d->order_status - 1);
            }

            $d->robot = $robot;  //机器人 1=>是 0=>否
            $d->city = 0; //城市id  ???
        }
        return ['errcode' => 0, 'msg' => '', 'data' => $info];
    }
}
