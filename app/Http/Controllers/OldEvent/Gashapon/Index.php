<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/13
 * Time: 16:53
 */

namespace App\Http\Controllers\Event\Gashapon;

use App\Http\Controllers\Event\AbsEvent;
use App\Common\Prize;
use Illuminate\Support\Facades\DB;

/**
 * 扭蛋机
 * Class Index
 * @package App\Http\Controllers\Event\Gashapon
 */
class Index extends AbsEvent
{
    private $event_id = 70;

    function __construct()
    {
        $this->event = DB::table('event')->select('begin_at', 'end_at', 'extend')->find($this->event_id);
        if ($this->event) {
            $this->event->extend = json_decode($this->event->extend??'[]', true);
            $this->begin_at = $this->event->begin_at;
            $this->end_at = $this->event->end_at;
        }

    }

    /**
     * 当用户充值后会调用这个接口
     * @param $user_id
     * @param $amount
     */
    public function recharge($user_id, $amount)
    {
        $this->event_at();
        $this->getUserEvent($user_id, $this->event_id, $this->event->extend['user_extend']);

        $this->user_event->extend['recharge_amount'] += $amount;
        $data['extend'] = json_encode($this->user_event->extend);
        DB::table('user_event')->where('id', $this->user_event->id)->update($data);

        return ['errcode' => 0, 'msg' => 'ok'];
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
        $data = ['user_info' => [], 'datetime' => date('Y/m/d H:i:s'), 'end_at' => date('Y/m/d H:i:s',strtotime($this->end_at))];

        if ($user) {
            $this->getUserEvent($user->id, $this->event_id, $this->event->extend['user_extend']);

            $user_info['count'][0] = intval($this->user_event->extend['recharge_amount'] / $this->event->extend['amount'][0]);
            $user_info['count'][1] = intval($this->user_event->extend['recharge_amount'] / $this->event->extend['amount'][1]);
            $data['user_info'] = $user_info;
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     *  抽奖
     * @param array $user 用户信息
     * @param string $type xxx
     * @return array
     */
    public function luckDraw($user, $type = 1)
    {
        $this->end_at = date('Y-m-d H:i:s', strtotime("{$this->end_at} +1 day"));
        $this->event_at();
        if (!$user) throw new \Exception('未登录', 1001);

        $prize = [];
        $prize_data = [];
        $group = $type;
        $type--;

        $this->getUserEvent($user->id, $this->event_id, $this->event->extend['user_extend']);

        if ($this->user_event->extend['recharge_amount'] < $this->event->extend['amount'][$type]) throw new \Exception('您的充值金额不足！', 1003);
        $luck_draw_count = $this->event->extend['count'][$type];

        //抽奖，查询按次数奖品
        $prize_info = DB::table('event_prize as ep')
            ->leftJoin('red as r', 'r.id', '=', 'ep.prize')
            ->select('ep.id', 'ep.title', 'ep.type', 'ep.prize')
            ->where([['ep.event_id', $this->event_id], ['ep.count', '>', 1], ['ep.count', '>', $this->user_event->extend['count'][$type]], ['ep.count', '<=', $this->user_event->extend['count'][$type] + $luck_draw_count], ['ep.extend', 'like', '%"group": "' . $group . '"%'], ['ep.status', 1]])
            ->orderBy('order', 'asc')
            ->get();

        if ($prize_info) {
            $luck_draw_count -= count($prize_info);
            foreach ($prize_info as $v) {
                $prize[] = $v;
            }
        }
        //按概率抽奖
        if ($luck_draw_count) {
            $prize_info = DB::table('event_prize as ep')
                ->leftJoin('red as r', 'r.id', '=', 'ep.prize')
                ->select('ep.id', 'ep.title', 'ep.chance', 'ep.type', 'ep.prize')
                ->where([['ep.event_id', $this->event_id], ['ep.count', '<=', 1], ['ep.extend', 'like', '%"group": "' . $group . '"%'], ['ep.status', 1]])
                ->orderBy('order', 'asc')
                ->get();
            $probability = [];
            foreach ($prize_info as $v) {
                $probability[] = json_decode($v->chance, true)[0];
            }
            $num = Prize::probability($probability, 10000, $luck_draw_count);
            foreach ($num as $v) {
                $prize[] = $prize_info[$v];
            }
        }
        shuffle($prize);
        foreach ($prize as $k => $v) {
            $prize_data[] = ['user_id' => $user->id, 'prize_id' => $v->id, 'event_id' => $this->event_id];
        }

        //用户信息
        $this->user_event->extend['count'][$type] += $this->event->extend['count'][$type];
        $this->user_event->extend['recharge_amount'] -= $this->event->extend['amount'][$type];
        $event_data['extend'] = json_encode($this->user_event->extend);
        $event_data['sort'] = $this->user_event->sort + $this->event->extend['amount'][$type];
        $event_data['update_at'] = date('Y-m-d H:i:s');

        //更新
        DB::beginTransaction();
        $re = DB::table('user_event')->where('id', $this->user_event->id)->update($event_data);
        $re2 = DB::table('user_prize')->insert($prize_data);

        if ($re && $re2) {
            $i = 0;
            $red = [];
            foreach ($prize as $v) {
                if ($v->type == 3) {
                    $i++;
                    $red_info = Prize::red($user->id, $v->prize,1,1);
                    if ($red_info['status'] == 0) {
                        $red[] = $red_info['data'][0];
                    }
                }
                $data['list'][] = ['id' => $v->id, 'title' => $v->title, 'type' => $v->type];
            }

            if ($i == count($red)) {
                DB::commit();
                return ['errcode' => 0, 'msg' => "ok", 'data' => $data];
            } else {
                DB::rollBack();
                return ['errcode' => 4002, 'msg' => "抽奖失败"];
            }
        }

    }

    public function record($user, $page = 1)
    {
        if (!$user) return ['errcode' => 1001, 'msg' => "请先登录！"];
        $event_id_arr = DB::table('event')->where('pid', $this->event_id)->pluck('id')??[];
        $event_id_arr[] = $this->event_id;

        $query = DB::table('user_prize as up');
        $query->leftJoin('event_prize as ep', 'ep.id', '=', 'up.prize_id')
            ->select('ep.title', 'up.create_at')
            ->where([['up.user_id', $user->id]])
            ->whereIn('up.event_id', $event_id_arr);
        $total = $query->count();
        $list = $query->orderBy('up.create_at', 'desc')
            ->offset(($page - 1) * $this->page_size)->limit($this->page_size)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total]];
    }


}