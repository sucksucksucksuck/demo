<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/13
 * Time: 16:53
 */

namespace App\Http\Controllers\Event\GodsList;

use App\Http\Controllers\Event\AbsEvent;
use App\Common\Prize;
use Illuminate\Support\Facades\DB;

/**
 * 神豪榜
 * Class Index
 * @package App\Http\Controllers\Event\Richlist
 */
class Index extends AbsEvent
{
    private $event_id = 31;

    function __construct()
    {
        /*$this->event = DB::table('event')->select('begin_at', 'end_at', 'extend')->find($this->event_id);
        if ($this->event) {
            $this->event->extend = json_decode($this->event->extend??'', true);
            $this->begin_at = $this->event->begin_at;
            $this->end_at = $this->event->end_at;
        }*/
    }

    /**
     * 当用户充值后会调用这个接口
     * @param $user_id
     * @param $amount
     */
    public function recharge($user_id, $amount)
    {
    }

    /**
     * 当用户消费后会调用这个接口
     * @param int $user_id 用户ID
     * @param int $amount
     * @return array
     */
    public function consumer($user_id, $amount)
    {
    }

    /**
     * 初始化
     * @param $user
     * @return array
     */
    public function init($user)
    {
        return ['errcode' => 0, 'msg' => 'ok', 'data' => $this->rank($user)];
    }

    /**
     *  抽奖
     * @param array $user 用户信息
     * @param string $type xxx
     * @return array
     */
    public function luckDraw($user, $type = 0)
    {
        return ['errcode' => 0, 'msg' => 'ok', 'data' => $this->rank($user, 1)];
    }

    public function record($user, $page = 1)
    {
    }

    protected function rank($user, $periods = 0)
    {
        $data = ['user_info' => [], 'rank_list' => [], 'is_login' => false];

        $i = $periods * 7;
        $data['start_time'] = $start_time = date('Y-m-d', strtotime("-" . ($i + 6) . " day Sunday"));
        $data['end_time'] = $end_time = date('Y-m-d', strtotime("-{$i} day Sunday"));
        $end_time .= ' 23:59:59';

        $event_user_mod = new \App\Models\Event\User();

        if ($user) {
            $data['is_login'] = true;
            $data['user_info'] = $event_user_mod->getGodsInfo($user, $start_time, $end_time);
            $data['user_info']['nickname'] = $user->nickname;
            $data['user_info']['user_type'] = $user->type;
        }

        $rank_list = $event_user_mod->getGodsList($start_time, $end_time,10);
        for ($i = 0; $i < 10; $i++) {
            $v= $rank_list[$i]??false;
            if($v){
                $data['rank_list'][] = ['recharge' => intval($v->amount), 'nickname' => $v->nickname];
            }else {
                $data['rank_list'][] = ['recharge' => 0, 'nickname' => ''];
            }
        }

        return $data;
    }
}