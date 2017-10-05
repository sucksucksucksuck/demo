<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;
use App\Common\Helper;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/20
 * Time: 14:18
 */
class UserLuckyCode extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    /**
     * 查看用户夺宝号码
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $data = [];
        $data = DB::table('lucky_code')
            ->where(['user_id' => $this->user->id, 'periods_id' => $params['periods_id']])
            ->select('lucky_code')
            ->get();

        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}