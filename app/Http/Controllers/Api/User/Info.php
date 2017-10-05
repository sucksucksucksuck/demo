<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/9
 * Time: 10:02
 * Description: 可用红包
 */

namespace App\Http\Controllers\Api\User;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

//用户 盘古币可用红包数量
class Info extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    public function execute(array $params)
    {
        $data = [];
        $time = date('Y-m-d H:i:s');
        $time2 = date('Y-m-d H:i:s', strtotime('-30 day'));
        $data['red_available'] = DB::table('user_red')
            ->where(['user_id' => $this->user->id, 'status' => 1])
            ->where('begin_at', '<', $time)
            ->where('end_at', '>=', $time)
            ->count();

        $data['red_inoperative'] = DB::table('user_red')
            ->where(['user_id' => $this->user->id, 'status' => 1])
            ->where('begin_at', '>', $time)
            ->count();

        $data['red_used'] = DB::table('user_red')
            ->where(['user_id' => $this->user->id, 'status' => 2])
            ->count();

        $data['red_expired'] = DB::table('user_red')
            ->where(['user_id' => $this->user->id, 'status' => 1])
            ->where('end_at', '<', $time)
            ->where('user_red.create_at', '>', $time2)
            ->count();

        $this->user->bind = Helper::getUserBindInfo($this->user);
        $data['user'] = $this->user;
        $data['user']->icon = Helper::getAvatar($this->user->icon);
        unset($data['user']->password);
        unset($data['user']->recharge_amount);
        unset($data['user']->winning_amount);
        unset($data['user']->exchange_amount);
        unset($data['user']->type);
        unset($data['user']->status);
        unset($data['user']->recharge_times);
        unset($data['user']->create_at);
        unset($data['user']->update_at);
        unset($data['user']->channel);
        unset($data['user']->login_times);
        unset($data['user']->total_integral);
        unset($data['user']->update_at);
//        unset($data['user']->idaf);
        unset($data['user']->device);
        unset($data['user']->create_ip);
        unset($data['user']->version);
        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }

}