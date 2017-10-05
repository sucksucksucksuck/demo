<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/3/16
 * Time: 22:21
 */

namespace App\Http\Controllers\Api\Goods;


use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

class Number extends AbsResponse
{

    /**
     * 查询用户购买的幸运码
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $goods_id = $params['goods_id'];
        $periods = $params['periods'];
        $periods = DB::table('periods')->where(['goods_id' => $goods_id, 'periods' => $periods])->first(['id']);
        if (!$periods) {
            throw new \Exception('数据不存在', 100);
        }
        $data = DB::table('lucky_code')->where(['periods_id' => $periods->id, 'user_id' => $this->user->id])->orderBy('id', 'desc')->get(['lucky_code']);
        $lucky_code = [];
        foreach ($data as $d) {
            $lucky_code[] = $d->lucky_code;
        }
        return ['errcode' => 0, 'msg' => '查询成功', 'data' => $lucky_code];
    }
}