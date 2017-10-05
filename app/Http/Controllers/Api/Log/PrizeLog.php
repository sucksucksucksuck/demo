<?php

namespace App\Http\Controllers\Api\Log;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/6
 * Time: 17:46
 */
class PrizeLog extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    /**
     * 用户获奖记录
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $page = $params['page'] ?? 1;
        $page_size = $params['page_size'] ?? 20;

        $prefix = DB::getTablePrefix();
        $data = DB::table('user_prize as u')
            ->leftJoin('event_prize as e', 'u.prize_id', '=', 'e.id')
            ->leftJoin('event', 'e.event_id', '=', 'event.id')
            ->where(['u.user_id' => $this->user->id])
            ->where(['u.status' => 1])
            ->whereRaw("{$prefix}e.prize is not null")
            ->whereIn('e.type', [1, 2, 3, 4, 5])
            ->select(
                'u.create_at',
                'u.id',
                'e.title',
                'e.icon',
                'e.prize',
                'e.type',
                'e.event_id',
                'event.title as event_title')
            ->forPage($page, $page_size)
            ->orderBy('id', 'desc')
            ->get();


        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}