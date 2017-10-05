<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/4/25
 * Time: 16:37
 */

namespace App\Http\Controllers\Api\Periods;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

//首页取三条中奖纪录做公告
class Notice extends AbsResponse
{
    var $default_params = ['page' => 1, 'page_size' => 10];
    public function execute(array $params)
    {
        $params = array_merge($this->default_params, $params);
        $now = date('Y-m-d H:i:s');
        $list = DB::table('periods')
            ->leftJoin('user', 'user.id' ,'=','periods.user_id')
            ->leftJoin('goods', 'goods.id' ,'=','periods.goods_id')
            ->where('lottery_show_at','<=', $now)
            ->where(['periods.status' => 3])
            ->orderBy('periods.lottery_show_at', 'desc')
            ->select(
                'periods.user_id',
                'periods.lucky_code',
                'periods.goods_id',
                'periods.periods',
                'user.type',
                'user.nickname',
                'goods.title')
            ->forPage($params['page'], $params['page_size'])
            ->get();
        return ['errcode' => 0, 'msg' => '查询成功', 'data' => $list];
    }
}