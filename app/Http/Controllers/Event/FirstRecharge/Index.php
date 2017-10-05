<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/13
 * Time: 16:53
 */

namespace App\Http\Controllers\Event\FirstRecharge;

use App\Common\Helper;
use App\Http\Controllers\Event\AbsEvent;
use DB;
use App\Common\Prize;

/**
 * 首冲
 * Class Index
 * @package App\Http\Controllers\Event\FirstRecharge
 */
class Index extends AbsEvent
{
    private $event_id = 2;

    function __construct()
    {
        $this->event = DB::table('event')->select('begin_at', 'end_at', 'extend')->where(['id' => $this->event_id])->first();
        $this->begin_at = $this->event->begin_at;
        $this->end_at = $this->event->end_at;
        $this->event->extend = json_decode($this->event->extend, true);
    }

    /**
     * 当用户充值后会调用这个接口
     * @param $user_id
     * @param $amount
     */
    public function recharge($user_id, $amount)
    {
        $user = DB::table('user')->find($user_id);
        if (!$user) {
            $vip = DB::connection('anyou')->table('vip')->where(['uid' => $user_id])->first();
            Helper::insertUserByVip($vip);
//            DB::table('user')->insert([
//                'id' => $vip->uid,
//                'type' => $vip->abot,
//                'residual_amount' => $vip->jine,
//                'last_login_ip' => $vip->ip2,
//                'device' => $vip->pt == 'i' ? 1 : 2,
//                'create_ip' => $vip->ip,
//                'nickname' => $vip->name,
//                'icon' => $vip->pic,
//                'recharge_amount' => $vip->zcjine,
//                'recharge_times' => $vip->chongcount,
//            ]);
            $user = DB::table('user')->find($user_id);
        }
        if ($user && $user->recharge_times == 1) {
            $grade = 0;
            foreach ($this->event->extend as $a) {
                if ($a <= $amount) {
                    $grade = $a;
                }
            }
            $red_list = DB::table('red')->select(['id'])->where(['event_id' => $this->event_id])->whereRaw('json_extract(rule,\'$.amount\') = ?', [$grade])->get();
            foreach ($red_list as $v) {
                Prize::red($user_id, $v->id, 1, 1);
            }
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

    }

    /**
     *
     * @param array $user 用户信息
     * @param string $type
     * @return array
     */
    public function luckDraw($user, $type = 'default')
    {

    }

    public function record($user, $page = 1)
    {

    }


}