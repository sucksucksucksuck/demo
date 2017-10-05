<?php

namespace App\Http\Controllers\Api\Log;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/7
 * Time: 9:58
 */
class IntegralLog extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    static public $title = [
        1 => '签到',
        2 => '转盘',
        3 => '消费',
        4 => '购买'
    ];

    /**
     * 积分明细
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $page = $params['page'] ?? 1;
        $page_size = $params['page_size'] ?? 20;
        $data = DB::table('user_integral_log')
            ->where(['user_id' => $this->user->id])
            ->orderBy('id', 'desc')
            ->forPage($page, $page_size)
            ->get();

        foreach ($data as $d){
            $d->title = self::$title[$d->type];
        }
        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}