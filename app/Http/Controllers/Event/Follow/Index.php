<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/13
 * Time: 16:53
 */

namespace App\Http\Controllers\Event\Follow;

use App\Common\Helper;
use App\Http\Controllers\Event\AbsEvent;
use App\Common\Prize;
use Illuminate\Support\Facades\DB;

/**
 * 关注活动
 * Class Index
 * @package App\Http\Controllers\Event\Follow
 */
class Index extends AbsEvent
{
    private $event_id = 3;

    function __construct()
    {
    }

    /**
     * 用户关注
     * @param $user_id
     */
    public function follow($user_id)
    {
        $user = DB::table('user')->select()->where(['id' => $user_id])->first();
        if (!$user) {
            $vip = DB::connection('anyou')->table('vip')->where(['uid' => $user_id])->first();
            if ($vip)
                Helper::insertUserByVip($vip);
            $user = DB::table('user')->select()->where(['id' => $user_id])->first();
        }
        if (!$user) {
            return ['errcode' => 1001, 'msg' => "用户不存在"];
        }

        $prize_info = DB::table('event_prize as ep')
            ->leftJoin('red as r', 'r.id', '=', 'ep.prize')
            ->select('ep.id', 'ep.title', 'ep.chance', 'ep.type', 'ep.prize', 'ep.count')
            ->where('ep.event_id', $this->event_id)
            ->orderBy('order', 'asc')
            ->get();

        $probability = [];
        $u_red_ids = [];
        foreach ($prize_info as $v) {
            $probability[] = json_decode($v->chance, true)[0];
            $u_red_ids[] = $v->prize;
        }
        $user_red = DB::table('user_red')->whereIn('red_id', $u_red_ids)->first(['title', 'amount', 'end_at']);
        if ($user_red) {
            return ['errcode' => 0, 'msg' => 'ok', 'data' => $user_red];
        }
        $index = Prize::probability($probability, 10000)[0];
        $ids = Prize::red($user->id, $prize_info[$index]->prize,1,1);
        $user_red = DB::table('user_red')->whereIn('id', $ids)->first(['title', 'amount', 'end_at']);
        return ['errcode' => 0, 'msg' => 'ok', 'data' => $user_red];
    }


    public function init($user)
    {
    }

    public function luckDraw($user, $type = 'default')
    {
    }

    public function record($user, $page = 1)
    {
    }


}