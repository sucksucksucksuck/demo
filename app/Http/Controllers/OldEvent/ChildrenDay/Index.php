<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/5/26
 * Time: 18:39
 */

namespace App\Http\Controllers\Event\ChildrenDay;

use App\Http\Controllers\Event\AbsEvent;
use DB;
use App\Common\Prize;

/**
 * 儿童节
 * Class Index
 * @package App\Http\Controllers\Event\ChildrenDay
 */
class Index extends AbsEvent
{
    private $event_id = 9;

    function __construct()
    {
        $this->event = DB::table('event')->select('begin_at', 'end_at')->where(['id' => $this->event_id])->first();
        if($this->event) {
            $this->begin_at = $this->event->begin_at;
            $this->end_at = $this->event->end_at;
        }
    }

    /**
     *
     * @param array $user 用户信息
     * @return array
     */
    public function consumer($user_id, $amount)
    {

    }

    public function init($user)
    {
        if ($user) {
            $red_info = DB::table('red')->where(['event_id' => $this->event_id])->get();
            $user_red = DB::table('user_red')->where(['user_id' => $user->id, 'red_id' => $red_info[0]->id])->first();
            if ($user_red) {
                return ['errcode' => 0, 'msg' => '已经领取', 'data' => '1'];
            } else {
                return ['errcode' => 0, 'msg' => '未领取', 'data' => '0'];
            }
        }else{
            return ['errcode' => 403, 'msg' => '未登录'];
        }
    }

    /**
     * 领取红包
     * @param array $user 用户信息
     * @param string $type
     * @return array
     */
    public function luckDraw($user, $type = 'default')
    {
        $this->event_at();
        if ($user) {
            $red_info = DB::table('red')->where(['event_id' => $this->event_id])->first();
            $user_red = DB::table('user_red')->where(['user_id' => $user->id, 'red_id' => $red_info->id])->first();
            if (!$user_red) {
                Prize::red($user->id, $red_info->id);
                return ['errcode' => 0, 'msg' => "5元红包", 'data' => '0'];
            } else {
                return ['errcode' => 0, 'msg' => "您已经领取过红包了，不能重复领取", 'data' => '1'];
            }
        } else {
            return ['errcode' => 1002, 'msg' => "您未登录不能领取红包哦，请登录您的账号再来领取"];
        }
    }

    public function record($user, $page = 1)
    {

    }


}