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

class Periods extends AbsResponse
{
    /**
     * 查询揭晓列表
     * @param array $params
     * @return array
     */
    public function execute(array $params)
    {
        $data = DB::table('periods as p')
            ->leftJoin('user as u', 'p.user_id', '=', 'u.id')
            ->leftJoin('goods as g', 'p.goods_id', '=', 'g.id')
            ->where(['p.id' => $params['periods_id']])
            ->select(
                'p.id',
                'p.lucky_code',
                'p.user_id',
                'p.lottery_show_at',
                'p.status',
                'p.periods',
                'u.nickname',
                'u.icon',
                'g.id as goods_id',
                'g.title',
                'g.icon')
            ->first();

        $data->ip = $this->request->getClientIp();
        $data->count = DB::table('order')->where(['user_id' => $data->user_id, 'periods' => $data->periods, 'goods_id' => $data->goods_id])->sum('num');
        return ['errcode' => 0, 'msg' => '查询成功', 'data' => $data];
    }
}