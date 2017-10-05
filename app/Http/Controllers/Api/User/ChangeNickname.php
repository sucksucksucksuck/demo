<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;
use App\Common\Helper;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/13
 * Time: 17:30
 */
class ChangeNickname extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    /**
     * 修改昵称
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $nickname = $params['nickname'] ?? '';
        if($nickname){
            DB::table('user')->where(['id' => $this->user->id])->update(['nickname' => $nickname]);
            $this->user->nickname = $nickname;
            $this->user->bind = Helper::getUserBindInfo($this->user);
        }else{
            throw new \Exception('修改昵称失败', 500);
        }

        return ['errcode' => 0, 'msg' => '修改成功', 'data' => $this->user];
    }
}