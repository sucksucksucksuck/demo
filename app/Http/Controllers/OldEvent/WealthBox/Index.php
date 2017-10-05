<?php

namespace App\Http\Controllers\Event\WealthBox;

use App\Http\Controllers\Event\AbsEvent;
use DB;
use App\Common\Prize;

/**
 * 财神宝箱
 * Class Index
 * @package App\Http\Controllers\Event\WealthBox
 */
class Index extends AbsEvent
{
    private $event_id = 30;
    private $user_extend = ['recharge_amount' => 0, 'residual_amount' => 0, 'count' => [0, 0]];

    function __construct()
    {
        $this->event = DB::table('event')->select('begin_at', 'end_at', 'extend')->find($this->event_id);
        if ($this->event) {
            $this->event->extend = json_decode($this->event->extend??'', true);
            $this->begin_at = $this->event->begin_at;
            $this->end_at = $this->event->end_at;
        }
    }

    /**
     * 当用户充值后会调用这个接口
     * @param $user_id
     * @param $amount
     * @return array
     */
    public function recharge($user_id, $amount)
    {
        $this->event_at();
        $this->user_event = DB::table('user_event')->where([['user_id', $user_id], ['event_id', $this->event_id]])->first();
        if (!$this->user_event) {
            $user_event_id = $this->addUserEvent($user_id, $this->event_id, $this->user_extend);
            $this->user_event = DB::table('user_event')->where('id', $user_event_id)->first();
        }

        $this->user_event->extend = json_decode($this->user_event->extend, true);
        $this->user_event->extend['recharge_amount'] += $amount;
        $this->user_event->extend['residual_amount'] += $amount;
        $data['extend'] = json_encode($this->user_event->extend);
        DB::table('user_event')->where('id', $this->user_event->id)->update($data);

        return ['errcode' => 0, 'msg' => 'ok'];
    }

    /**
     * 消费
     * @param int $user_id 用户ID
     * @param int $amount
     */
    public function consumer($user_id, $amount)
    {
    }

    public function init($user)
    {
        $data = ['is_login' => false, 'begin_at' => $this->begin_at, 'end_at' => $this->end_at];
        if ($user) {
            $data['is_login'] = true;

            $this->user_event = DB::table('user_event')->select('extend')->where([['user_id', $user->id], ['event_id', $this->event_id]])->first();
            if (!$this->user_event) {
                $this->addUserEvent($user->id, $this->event_id, $this->user_extend);
                $this->user_event = DB::table('user_event')->select('extend')->where([['user_id', $user->id], ['event_id', $this->event_id]])->first();
            }
            $this->user_event->extend = json_decode($this->user_event->extend, true);

            $data['user_info']['luck_count'] = $this->user_event->extend['residual_amount'] ? intval($this->user_event->extend['residual_amount'] / $this->event->extend['amount'][0]) : 0;
            $data['user_info']['god_count'] = $this->user_event->extend['residual_amount'] ? intval($this->user_event->extend['residual_amount'] / $this->event->extend['amount'][1]) : 0;
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     *  抽奖
     * @param array $user 用户信息
     * @param string $type xxx
     * @return array
     */
    public function luckDraw($user, $type = '0_0')
    {
        //金额_次数
        $type = explode('_', $type??'0_0');
        $amount = $this->event->extend['amount'][$type[0]];
        $count = $this->event->extend['count'][$type[1]];
        $group = $type[0] + 1;
        $prize = [];
        $prize_data = [];
        $data = [];

        $this->end_at = date('Y-m-d H:i:s', strtotime($this->end_at) + 3600 * 24);
        $this->event_at();
        if (!$user) throw new \Exception('未登录！', 1001);

        $this->user_event = DB::table('user_event')->where([['user_id', $user->id], ['event_id', $this->event_id]])->first();
        $this->user_event->extend = json_decode($this->user_event->extend, true);
        $luck_draw_count = $this->event->extend['count'][$type[1]];

        if ($this->user_event->extend['residual_amount'] < $amount * $count) throw new \Exception('你的中奖次数不足！', 1002);

        //抽奖，查询按次数奖品
        $prize_info = DB::table('event_prize as ep')
            ->leftJoin('red as r', 'r.id', '=', 'ep.prize')
            ->select('ep.id', 'ep.title', 'ep.type', 'ep.prize')
            ->where([['ep.event_id', $this->event_id], ['ep.count', '>', 1], ['ep.count', '>', $this->user_event->extend['count'][$type[0]]], ['ep.count', '<=', $this->user_event->extend['count'][$type[0]] + $luck_draw_count], ['ep.extend', 'like', '%"group": ' . $group . '%'],['ep.status',1]])
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
                ->where([['ep.event_id', $this->event_id], ['ep.count', '<=', 1], ['ep.extend', 'like', '%"group": ' . $group . '%'],['ep.status',1]])
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
        $this->user_event->extend['count'][$type[0]] += $count;
        $this->user_event->extend['residual_amount'] -= $amount * $count;
        $event_data['extend'] = json_encode($this->user_event->extend);
        $event_data['sort'] = $this->user_event->extend['recharge_amount'] - $this->user_event->extend['residual_amount'];
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
                    $red_info = Prize::red($user->id, $v->prize);
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
        } else {
            DB::rollBack();
            return ['errcode' => 4001, 'msg' => "抽奖失败"];
        }

    }

    public function record($user, $page = 1)
    {
        if (!$user) throw new \Exception('请先登录！', 1001);

        $query = DB::table('user_prize as up');
        $query->leftJoin('event_prize as ep', 'ep.id', '=', 'up.prize_id')
            ->select('ep.title', 'up.create_at')
            ->where([['up.user_id', $user->id], ['up.event_id', $this->event_id]]);

        $total = $query->count();
        $list = $query->orderBy('up.create_at', 'desc')
            ->offset(($page - 1) * $this->page_size)->limit($this->page_size)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total]];
    }

}