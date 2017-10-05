<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/7/10
 * Time: 9:35
 * Description: 云购记录
 */

namespace App\Http\Controllers\Api\Center;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

//云购记录
class Record extends AbsResponse
{
    var $default_params = ['page' => 1, 'page_size' => 10];

    public function execute(array $params)
    {
        $data = [];
        $params = array_merge($this->default_params, $params);

        $prefix = DB::getTablePrefix();
        $sql = DB::table('order')->whereRaw("periods_id = {$prefix}periods.id and user_id = {$prefix}periods.user_id")->select([DB::raw('SUM(pg_order.num)')])->toSql();
        $sql2 = DB::table('order')->selectRaw("SUM(num) as num,periods_id,max(create_at)as create_at,MAX(user_id)as user_id")->where('order.user_id', '=', $params['user_id'])->groupBy('periods_id')
            ->orderBy("create_at", 'desc')->forPage($params['page'], $params['page_size'])
            ->toSql();
        $query = DB::table(DB::raw("({$sql2}) as {$prefix}f"))->addBinding($params['user_id'])//添加bind参数
        ->leftJoin('periods', 'f.periods_id', '=', 'periods.id')
            ->leftJoin('goods', 'periods.goods_id', '=', 'goods.id')
            ->leftJoin('user', 'periods.user_id', '=', 'user.id')
            ->select([
                'f.num',
                'f.periods_id',
                'user.nickname',
                'periods.create_at',
                'periods.lucky_code',
                'periods.unit_price',
                'periods.user_id',
                'periods.periods',
                'periods.buy',
                'periods.total',
                'periods.lottery_at',
                'periods.lottery_show_at',
                'periods.status',
                'goods.id',
                'goods.title',
                'goods.icon',
                DB::raw("({$sql}) as num2")]);

        if ($this->request->ip() != config('app.old_ip')) {
            $time = date('Y-m-d', strtotime('-30 day'));
            $query->where('periods.create_at', '>', $time);
        }
        $order = $query->get();
        foreach ($order as &$o) {
            $o->schedule = intval($o->buy / $o->total * 100); //进度
            $o->surplus = $o->total - $o->buy; //剩余
            $lottery_status = Helper::getLotteryStatus($o->status, $o->lottery_show_at);
            if ($lottery_status == 2) {
                $o->status = 2;
            }else if($lottery_status == 3){
                $o->status = 3;
            }
        }

        return ['errcode' => 0, 'msg' => '', 'data' => $order];
    }

}