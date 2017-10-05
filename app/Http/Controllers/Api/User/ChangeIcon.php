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
class ChangeIcon extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    /**
     * 修改头像
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $icons = $this->file ?? [];
        if($icons){
            foreach ($icons as $i){
                $img = md5($i);
                $save_dir = 'image/user_icon'. date('/Y_m/d/');
                $icon = Helper::Base64ToImg("$i", $save_dir , $img);
                DB::table('user')->where(['id' => $this->user->id])->update(['icon' => $icon]);
                $this->user->icon = $icon;
                $this->user->bind = Helper::getUserBindInfo($this->user);
            }
        }else{
            throw new \Exception('修改头像失败', 500);
        }

        return ['errcode' => 0, 'msg' => '修改成功', 'data' => $this->user];
    }
}