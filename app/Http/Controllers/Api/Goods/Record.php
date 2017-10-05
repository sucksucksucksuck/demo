<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/3/14
 * Time: 17:53
 */

namespace App\Http\Controllers\Api\Goods;


use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

class Record extends AbsResponse
{

    var $default_params = ['goods_id' => 0, 'periods' => 0, 'periods_id' => 0, 'page' => 1, 'page_size' => 10];

    /**
     * 购买记录
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $params = array_merge($this->default_params, $params);
        $goods_id = $params['goods_id'];
        $periods = $params['periods'];
        $periods_id = $params['periods_id'];
        $page = $params['page'];
        $page_size = $params['page_size'];

        if (!$periods) {
            $goods = DB::table('goods')->where(['id' => $goods_id])->first(['id', 'title', 'periods', 'image']);
            $periods = $goods->periods;
        }
        if (!$periods_id) {
            $p = DB::table('periods')->where(['goods_id' => $goods_id, 'periods' => $periods])->first(['id']);
            if ($p) {
                $periods_id = $p->id;
            } else {
                throw new \Exception('当前期数不存在', 100);
            }
        }
        $data = DB::table('order')
            ->where(['periods_id' => $periods_id])
            ->leftJoin('user', 'user.id', '=', 'order.user_id')
            ->forPage($page, $page_size)
            ->select(['user.nickname', 'user.id', 'user.icon', 'order.ip', 'user.create_ip', 'user.last_login_ip', 'order.num', 'order.create_at'])
            ->orderBy('create_at', 'desc')
            ->get();
        foreach ($data as &$d) {
            $ip = $d->ip ?? $d->last_login_ip ?? $d->create_ip;
            $d->ip = $ip . ' ' . Helper::ipToAddress($ip);
            unset($d->last_login_ip);
            unset($d->create_ip);
            $d->icon = Helper::getAvatar($d->icon);
        }
        return ['errcode' => 0, 'msg' => '查询成功', 'data' => $data];
    }
}