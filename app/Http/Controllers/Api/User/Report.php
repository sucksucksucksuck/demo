<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/7
 * Time: 11:46
 */
class Report extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    /**
     * 用户成绩单
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $data = [];
        //用户中奖物品总价值和数量
        $data1 = DB::table('periods')
            ->where('user_id', '=', $this->user->id)
            ->selectRaw('sum(unit_price * total) as sum, count(id) as count')
            ->first();

        //用户获取的红包总金额
        $data2 = DB::table('user_red')
            ->where('user_id', '=', $this->user->id)
            ->sum('amount');

        //转盘获取的红包总金额
        $data3 = DB::table('user_prize as u')
            ->leftJoin('event_prize as e', 'u.prize_id', '=', 'e.id')
            ->leftJoin('red as r', 'e.prize', '=', 'r.id')
            ->where('u.user_id', '=', $this->user->id)
            ->where('e.type', '=', 3)
            ->sum('r.max_amount');

        $data['amount'] = $data1->sum + $data2 + $data3;
        $data['red'] = $data2 + $data3;
        $data['count'] = $data1->count;

        return ['errcode' => 0, 'msg' => $data3, 'data' => $data];
    }
}