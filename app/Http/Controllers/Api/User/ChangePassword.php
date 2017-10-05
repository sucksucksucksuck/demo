<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;
use App\Common\Helper;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/8
 * Time: 11:30
 */
class ChangePassword extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    /**
     * 修改密码
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $old_password = $params['old_password'] ?? '';
        $new_password = $params['new_password'] ?? '';

        if(!Helper::CheckPassword($new_password)){
            throw new \Exception('新密码格式不对', 502);
        }
        $user = DB::table('user')->where(['id' => $this->user->id])->select('password')->first();
        if($user->password){
            if(Helper::password($old_password) != $user->password){
                throw new \Exception('原密码错误', 500);
            }
        }
        DB::table('user')->where(['id' => $this->user->id])->update(['password' => Helper::password($new_password)]);
        $this->user->bind = Helper::getUserBindInfo($this->user);

        return ['errcode' => 0, 'msg' => '修改成功', 'data' => $this->user];
    }
}