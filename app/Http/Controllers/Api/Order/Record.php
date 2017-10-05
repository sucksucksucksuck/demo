<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/3/6
 * Time: 14:23
 * Description: 云购记录
 */

namespace App\Http\Controllers\Api\Order;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

//云购记录
class Record extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    var $default_params = ['page' => 1, 'page_size' => 10];

    public function execute(array $params)
    {
        $data = [];
        $tab = isset($params['tab']) ? intval($params['tab']) : 1;
        $params = array_merge($this->default_params, $params);

        $prefix = DB::getTablePrefix();
        $sql = DB::table('order')->whereRaw("periods_id = {$prefix}periods.id and user_id = {$prefix}periods.user_id")->select([DB::raw('SUM(pg_order.num)')])->toSql();
        $sql2 = DB::table('order')->selectRaw("SUM(num) as num,periods_id,max(create_at)as create_at,MAX(user_id)as user_id")->where('order.user_id', '=', $this->user->id)->groupBy('periods_id')
            ->orderBy("create_at", 'desc')->forPage($params['page'], $params['page_size'])
            ->toSql();
        $query = DB::table(DB::raw("({$sql2}) as {$prefix}f"))->addBinding($this->user->id) //添加bind参数
            ->leftJoin('periods', 'f.periods_id', '=', 'periods.id')
            ->leftJoin('goods', 'periods.goods_id', '=', 'goods.id')
            ->leftJoin('user', 'periods.user_id', '=', 'user.id')
//            ->whereIn('periods.status', $params['status_list'])
            ->select([
                'f.num',
                'f.periods_id',
                'user.nickname',
                'periods.create_at',
                'periods.id',
                'periods.goods_id',
                'periods.lucky_code',
                'periods.unit_price',
                'periods.user_id',
                'periods.periods',
                'periods.buy',
                'periods.total',
                'periods.lottery_at',
                'periods.lottery_show_at',
                'periods.status',
                'goods.title',
                'goods.icon',
                DB::raw("({$sql}) as num2")]);
        if ($this->request->ip() != config('app.old_ip')) {
            $time = date('Y-m-d', strtotime('-30 day'));
            $query->where('periods.create_at', '>', $time);
        }
        $order = $query->get();
                switch ($tab) { //status 1=>未开奖 2=>等待开奖 3=>已开奖
                    case '1'://全部
                        foreach ($order as &$o) {
                            $o->schedule = intval($o->buy / $o->total * 100); //进度
                            $o->surplus = $o->total - $o->buy; //剩余
                            if ($o->status == 2 && !$o->lottery_at && strtotime($o->lottery_show_at) < time()) {
                                $o->lottery_show_at = date('Y-m-d H:i:s', time() + 10);
                            } else if ($o->status == 3 && strtotime($o->lottery_show_at) > time()) {
                                $o->status = 2;
                            }
                        }
                        break;
                    case '2'://进行中
                        foreach ($order as $k => &$o) {
                            $o->schedule = intval($o->buy / $o->total * 100); //进度
                            $o->surplus = $o->total - $o->buy; //剩余
                            if($o->status == 2 && !$o->lottery_at && strtotime($o->lottery_show_at) < time()){
                                $o->lottery_show_at = date('Y-m-d H:i:s', time() + 10);
                            } else if ($o->status == 3 && strtotime($o->lottery_show_at) > time()) {
                                $o->status = 2;
                            }else if($o->status == 3 && strtotime($o->lottery_show_at) <= time()){
                                unset($order[$k]);
                            }
                        }
                        break;
                    case '3'://已揭晓
                        foreach ($order as $k => &$o) {
                            $o->schedule = intval($o->buy / $o->total * 100); //进度
                            $o->surplus = $o->total - $o->buy; //剩余
                            if($o->status == 1 || $o->status == 2){
                                unset($order[$k]);
                            }
                        }
                        break;
                }

        return ['errcode' => 0, 'msg' => '', 'data' => array_values(json_decode(json_encode($order), true))];
    }

}