<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/3/6
 * Time: 13:37
 */

namespace App\Http\Controllers\Api\Periods;


use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

class Search extends AbsResponse
{
    var $default_params = ['page' => 1, 'page_size' => 16, 'goods_id' => 0, 'periods' => 0];
    var $p = ['execute' => 3, 'aaa' => 5];

    /**
     * 查询揭晓列表
     * @param array $params
     * @return array
     */
    public function execute(array $params)
    {
        $params = array_merge($this->default_params, $params);
        $query = DB::table('periods')
            ->leftJoin('user', 'periods.user_id', '=', 'user.id')
            ->leftJoin('goods', 'periods.goods_id', '=', 'goods.id')
            ->leftJoin('order', 'periods.order_id', '=', 'order.id')
            ->select([
                'user.nickname',
                'periods.lucky_code',
                'periods.lottery_at',
                'periods.user_id',
                'periods.lottery_show_at',
                'periods.status',
                'goods.title',
                'goods.icon',
                'periods.goods_id',
                'periods.order_id',
                'periods.periods',
                'periods.buy',
                'periods.lucky_code',
                'periods.id',
                'user.icon as user_icon',
                'order.ip'
            ])->whereNotNull('lottery_show_at')
            ->forPage($params['page'], $params['page_size'])->orderBy('lottery_show_at', 'desc');
        if ($params['goods_id'] != 0) {
            $query->where(['periods.goods_id' => $params['goods_id']])->whereNotNull('lottery_show_at');
        }
        if ($params['periods'] != 0) {
            $query->where(['periods.periods' => $params['periods']]);
        }
        $list = $query->get();
        foreach ($list as &$p) {
            $p->count = 0;
            $p->user_icon = Helper::getAvatar($p->user_icon);
            if ($p->status == 2 && !$p->lottery_at && strtotime($p->lottery_show_at) < time()) {
                unset($p->lucky_code);
                // unset($p->user_id);
                //   unset($p->user_icon);
                unset($p->ip);
                $p->lottery_show_at = date('Y-m-d H:i:s', time() + 10);
            } else if ($p->status == 3 && strtotime($p->lottery_show_at) > time()) {
                unset($p->lucky_code);
                unset($p->lucky_code);
                unset($p->user_id);
                unset($p->user_icon);
                unset($p->ip);
                $p->status = 2;
            } else {
                $p->ip = $p->ip . ' ' . Helper::ipToAddress($p->ip);
                $p->count = DB::table('order')->where(['user_id' => $p->user_id, 'periods' => $p->periods, 'goods_id' => $p->goods_id])->sum('num');
            }
            unset($p->lottery_at);
        }
        return ['errcode' => 0, 'msg' => '查询成功', 'data' => $list];
    }
}