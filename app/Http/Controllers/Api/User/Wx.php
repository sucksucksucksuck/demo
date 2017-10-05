<?php

namespace App\Http\Controllers\Api\User;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/7/5
 * Time: 13:06
 */
class Wx extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    /**
     * 绑定wx
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        //获取openid 验证微信是否已经被绑定
        $open_id = $params['open_id'];
        $user = DB::table('user_other_login')->where(['open_id' => $open_id, 'type' => 'wx'])->first();
        if($user){
            throw new \Exception('微信已经被绑定，请登录其他账号解绑', 500);
        }
        //绑定
        $access_token = $params['access_token'];
        $url = 'https://api.weixin.qq.com/sns/userinfo?access_token=' . $access_token . '&openid=' . $open_id . '&lang=zh_CN';
        $json = Helper::ssl_get($url);
        $data = json_decode($json, true);
        if(!empty($data['nickname'])){
            //在user_other_login中插入一条数据同时把id存到user表
            $insert_info = [
                'user_id' => $this->user->id,
                'open_id' => $open_id,
                'type' => 'wx',
                'create_at' => date('Y-m-d H:i:s'),
            ];
            DB::table('user_other_login')->insert($insert_info);
            $this->user->bind = Helper::getUserBindInfo($this->user);
        }
        return ['errcode' => 0, 'msg' => '绑定成功', 'data' => $this->user];
    }

    /**
     * 解绑微信
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function unBind(array $params)
    {
        $open_id = $params['openid'];
        $user = DB::table('user_other_login')->where(['open_id' => $open_id, 'type' => 'wx'])->first();
        if(!$user){
            throw new \Exception('微信未被绑定', 500);
        }
        $bind = Helper::getUserBindInfo($this->user);
        if($bind->bind_count <= 1){
            throw new \Exception('绑定数量不能少于1', 500);
        }
        //删除user表中wx字段，同时删除user_other_login的记录
        DB::table('user_other_login')->where(['open_id' => $open_id, 'type' => 'wx'])->delete();
        $this->user->bind = Helper::getUserBindInfo($this->user);

        return ['errcode' => 0, 'msg' => '解绑成功', 'data' => $this->user];
    }

}