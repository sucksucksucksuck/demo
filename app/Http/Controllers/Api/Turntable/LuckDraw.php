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
class LuckDraw extends AbsResponse
{

    private $event_id = 5;

    // private $event = [101, 102, 103, 104, 105, 106, 107, 108];

    function init()
    {
        // $this->user = DB::table('user')->find(6);
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
        $user_event = DB::table('user_event')->where(['user_id' => $this->user->id, 'event_id' => $this->event_id])->first();
        $user_event->extend = json_decode($user_event->extend, true);
        if ($user_event->extend ['count_date'] != date('Y-m-d')) {
            $user_event->extend ['count'] = 1;
        }
        if ($user_event->extend ['count'] > 0) {
            $event = DB::table('event')->find($this->event_id);
            $extend = json_decode($event->extend, true);
            $level = 0;
            foreach ($extend as $k => $l) {
                if ($l > $this->user->recharge_amount) {
                    break;
                }
                $level = $k + 1;
            }
            $level_event = DB::table('event')->find(101 + $level);
            if ($this->user->type == 4 && isset($user_event->extend ['three_days_recharge_date']) && $user_event->extend ['three_days_recharge_date'] == date('Y-m-d')) {
                $amount = $user_event->extend ['three_days_recharge_amount'];
            } else {
                $amount = DB::table('pay_log')->where(['user_id' => $this->user->id])->where('create_at', '>', date('Y-m-d', strtotime('-3 day')))->sum('amount');
            }
            $level_event->condition = json_decode($level_event->condition, true);
            $prize_level = 0;
            foreach ($level_event->condition['multiple'] as $k => $l) {
                $prize_level = $k;
                if ($l * $level_event->condition['base'] > $amount) {
                    break;
                }
            }
            $probability = [];
            $event_prize = DB::table('event_prize')->where(['event_id' => 101 + $level])->orderBy('order', 'asc')->get();
            foreach ($event_prize as $prize) {
                $probability[] = json_decode($prize->chance, true)[$prize_level];
            }
            $prize_index = Prize::probability($probability)[0];
            Prize::grant($event_prize->get($prize_index), $this->user, 3);
            $user_event->extend['count'] -= 1;
            if (isset($user_event->extend['lv_' . $level])) {
                $user_event->extend['lv_' . $level] += 1;
            } else {
                $user_event->extend['lv_' . $level] = 1;
            }
            DB::table('user_event')->where(['id' => $user_event->id])->update([
                'extend' => json_encode($user_event->extend, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
            ]);
            //DB::table('user_prize')->insert(['user_id' => $this->user->id, 'prize_id' => $event_prize->get($prize_index)->id, 'event_id' => $this->event_id, 'status' => 1]);
            preg_match('/减(\d+)/',$event_prize->get($prize_index)->title,$arr);
            return [
                'errcode' => 0,
                'msg' => 'ok',
                'data' => [
                    'level' => str_pad('0', 2, $level + 1),
                    'prize' => $event_prize->get($prize_index)->order,
                    'prize_title' => !empty($arr[1])?$arr[1].'元红包':$event_prize->get($prize_index)->title
                ]
            ];
        } else {
            return ['errcode' => 10, 'msg' => '您没有抽奖次数了'];
        }
    }
}