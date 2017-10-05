<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/13
 * Time: 16:53
 */

namespace App\Http\Controllers\Event\Register;

use App\Common\Helper;
use App\Http\Controllers\Event\AbsEvent;
use App\Common\Prize;
use Illuminate\Support\Facades\DB;

/**
 * 首次充值
 * Class Index
 * @package App\Http\Controllers\Event\Register
 */
class Index extends AbsEvent
{
    private $event_id = 1;

    function __construct()
    {
        // $this->begin_at = '2017-04-15 00:00:00';
        //  $this->end_at = '2017-04-25 23:59:59';
    }

    /**
     * 用户注册
     * @param $user_id
     */
    public function register($user_id)
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
        }
        $red_list = DB::table('red')->select(['id'])->where(['event_id' => $this->event_id])->get();
        foreach ($red_list as $v) {
            Prize::red($user_id, $v->id,1,1);
        }
    }

    public function init($user)
    {
    }

    /**
     *  抽奖
     * @param array $user 用户信息
     * @param string $type xxx
     * @return array
     */
    public function luckDraw($user, $type = 'default')
    {
    }

    public function record($user, $page = 1)
    {
    }


}