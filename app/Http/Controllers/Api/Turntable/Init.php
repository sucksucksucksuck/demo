<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/13
 * Time: 16:53
 */

namespace App\Http\Controllers\Api\Turntable;

use App\Http\Controllers\Api\AbsResponse;
use App\Common\Prize;
use Illuminate\Support\Facades\DB;

/**
 * 新转盘活动
 * Class Index
 * @package App\Http\Controllers\Event\Turntable
 */
class Init extends AbsResponse
{
    private $event_id = 5;
    private $event = [101, 102, 103, 104, 105, 106, 107, 108];

    function init()
    {
      //  $this->user = DB::table('user')->find(6);
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    /**
     * 初始化
     * @param array $params
     * @return array
     */
    public function execute(array $params)
    {
        $event = DB::table('event')->find($this->event_id);
        $extend = json_decode($event->extend, true);
        $level = 0;
        foreach ($extend as $k => $l) {
            if ($l > $this->user->recharge_amount) {
                break;
            }
            $level = $k+1;
        }
        //查询转盘等级对应的活动
        $level_event = DB::table('event')->find(101 + $level);
        //查询当前用户转盘数据
        $user_event = DB::table('user_event')->where(['user_id' => $this->user->id, 'event_id' => $this->event_id])->first();
        if (!$user_event) {
            //默认初始化次数
            $extend = ['count' => 1,'count_date'=>date('Y-m-d')];
            DB::table('user_event')->insert([
                'user_id' => $this->user->id,
                'event_id' => $this->event_id,
                'extend' => json_encode($extend, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
            ]);
            $user_event = new \stdClass();
            $user_event->extend = $extend;
        } else {
            $user_event->extend = json_decode($user_event->extend, true);
            //如果没有抽奖则重置次数为1
            if ($user_event->extend['count_date'] != date('Y-m-d')) {
                $user_event->extend['count'] = 1;
                $user_event->extend['count_date'] = date('Y-m-d');
                DB::table('user_event')
                    ->where('id',$user_event->id)
                    ->update([
                        'extend' => json_encode($user_event->extend, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                    ]);
            }
        }

        $prize = DB::table('user_prize')
            ->select(['user.nickname', 'event_prize.title'])
            ->whereIn('user_prize.event_id', $this->event)
            ->leftJoin('user', 'user.id', '=', 'user_prize.user_id')
            ->leftJoin('event_prize', 'event_prize.id', '=', 'user_prize.prize_id')
            ->limit(10)
            ->get();

        foreach ($prize as $k=>$v){
            preg_match('/减(\d+)/',$v->title,$arr);
            $prize[$k]->title = !empty($arr[1])?$arr[1].'元红包':$v->title;
        }

        return [
            'errcode' => 0,
            'msg' => 'ok'.$level,
            'data' => array_merge([
                'url' => url(''),
                'level' => str_pad('0', 2, $level+1),
                'prize' => $prize,
                'count' => $user_event->extend['count']
            ], json_decode($level_event->extend, true))
        ];
    }
}