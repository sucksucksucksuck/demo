<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/7/10
 * Time: 9:35
 * Description: 个人中心
 */

namespace App\Http\Controllers\Api\Center;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

class Index extends AbsResponse
{
    public function execute(array $params)
    {
        $user = DB::table('user')
            ->where(['id' => $params['user_id']])
            ->select('id', 'nickname', 'icon')
            ->first();

        $user->icon = Helper::getAvatar($user->icon);
        return ['errcode' => 0, 'msg' => '', 'data' => $user];
    }

}