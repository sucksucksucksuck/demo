<?php

namespace App\Http\Controllers\Event\DragonBoat;

use App\Http\Controllers\Event\AbsEvent;
use DB;
use App\Common\Prize;

/**
 * 端午节
 * Class Index
 * @package App\Http\Controllers\Event\DragonBoat
 */
class Index extends AbsEvent
{
    private $event_id = 8;

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
     */
    public function recharge($user_id, $amount)
    {
        $this->event_at();
        $user_event_info = DB::table('user_event')->where([['user_id', $user_id], ['event_id', $this->event_id]])->first();
        if (!$user_event_info) {
            $user_event_info = [];
            $user_event_info['user_id'] = $user_id;
            $user_event_info['event_id'] = $this->event_id;
            $user_event_info['update_at'] = date('Y-m-d H:i:s');
            //count = 剩余金额，min_luck_draw = 小粽子次数,max_luck_draw = 大粽子次数，min_eat = 吃小粽子次数,max_eat = 吃大粽子次数
            $extend = ['count' => $amount, 'min_luck_draw' => 0, 'max_luck_draw' => 0, 'min_luck_draw_count' => 0, 'max_luck_draw_count' => 0, 'min_luck_draw_sum' => 0, 'max_luck_draw_sum' => 0, 'min_eat' => 0, 'max_eat' => 0];
            $user_event_info['extend'] = json_encode($extend);
            DB::table('user_event')->insert($user_event_info);
        } else {
            $user_event_info->extend = json_decode($user_event_info->extend, true);
            $user_event_info->extend['count'] += $amount;
            $data['extend'] = json_encode($user_event_info->extend);
            DB::table('user_event')->where('id', $user_event_info->id)->update($data);
        }
        return ['errcode' => 0, 'msg' => 'ok'];
    }

    /**
     * 消费得到获取部件机会
     * @param int $user_id 用户ID
     * @param int $amount
     * @return array
     */
    public function consumer($user_id, $amount)
    {
    }

    public function init($user)
    {
        $data = [];
        if ($user) {
            $user_event_info = DB::table('user_event')->select('extend')->where([['user_id', $user->id], ['event_id', $this->event_id]])->first();
            if (!$user_event_info) {
                $user_event_info = [];
                $user_event_info['user_id'] = $user->id;
                $user_event_info['event_id'] = $this->event_id;
                $user_event_info['update_at'] = date('Y-m-d H:i:s');
                //count = 剩余金额，min_luck_draw = 小粽子总次数,max_luck_draw = 大粽子总次数，min_eat = 吃小粽子总次数,max_eat = 吃大粽子总次数
                $extend = ['count' => 0, 'min_luck_draw' => 0, 'max_luck_draw' => 0, 'min_luck_draw_count' => 0, 'max_luck_draw_count' => 0, 'min_luck_draw_sum' => 0, 'max_luck_draw_sum' => 0, 'min_eat' => 0, 'max_eat' => 0];
                $user_event_info['extend'] = json_encode($extend);
                DB::table('user_event')->insert($user_event_info);
                $user_info = $extend;
            } else {
                $user_info = json_decode($user_event_info->extend, true);
            }
            $data['min_count'] = intval($user_info['count']/$this->event->extend['amount']/ $this->event->extend['min_luck_draw']);
            $data['max_count'] = intval($user_info['count'] /$this->event->extend['amount']/ $this->event->extend['max_luck_draw']);
            $data['min_luck_draw_count'] = $user_info['min_luck_draw_count'];
            $data['max_luck_draw_count'] = $user_info['max_luck_draw_count'];
            $data['min_eat_count'] = intval($user_info['min_luck_draw_count'] / $this->event->extend['min_eat']);
            $data['max_eat_count'] = intval($user_info['max_luck_draw_count'] / $this->event->extend['max_eat']);
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     *  抽奖
     * @param array $user 用户信息
     * @param string $type xxx
     * @return array
     */
    public function luckDraw($user, $type = 'default')
    {
        $this->end_at = date('Y-m-d H:i:s', strtotime($this->end_at) + 3600 * 24);
        $this->event_at();
        if (!$user) throw new \Exception('未登录', 1001);

        switch (true) {
            case in_array($type, ['min_luck_draw', 'max_luck_draw']):
                $prize = [];
                $prize_data = [];

                $user_event_info = DB::table('user_event')->where([['user_id', $user->id], ['event_id', $this->event_id]])->first();
                $user_event_info->extend = json_decode($user_event_info->extend, true);

                if ($user_event_info->extend['count'] < $this->event->extend['amount'] * $this->event->extend[$type]) return ['errcode' => 1001, 'msg' => '您的领取机会不足！'];

                //抽奖，查询按次数奖品
                $prize_info = DB::table('event_prize as ep')
                    ->leftJoin('red as r', 'r.id', '=', 'ep.prize')
                    ->select('ep.id', 'ep.title', 'ep.type')
                    ->where([['ep.event_id', $this->event_id], ['ep.count', '>', 1], ['ep.extend', 'like', "%group_" . ($type == 'min_luck_draw' ? '1' : '2') . "%"], ['ep.count', '=', $user_event_info->extend[$type] + 1]])
                    ->orderBy('order', 'asc')
                    ->first();

                if ($prize_info) {
                    $prize[] = $prize_info;
                    $prize_data[] = ['user_id' => $user->id, 'prize_id' => $prize_info->id, 'event_id' => $this->event_id];
                } else {
                    //按概率抽奖
                    $prize_info = DB::table('event_prize as ep')
                        ->leftJoin('red as r', 'r.id', '=', 'ep.prize')
                        ->select('ep.id', 'ep.title', 'ep.chance', 'ep.type', 'ep.prize')
                        ->where([['ep.event_id', $this->event_id], ['ep.extend', 'like', "%group_" . ($type == 'min_luck_draw' ? '1' : '2') . "%"]])
                        ->orderBy('order', 'asc')
                        ->get();
                    $probability = [];
                    foreach ($prize_info as $v) {
                        $probability[] = json_decode($v->chance, true)[0];
                    }
                    $num = Prize::probability($probability, 10000);
                    foreach ($num as $v) {
                        $prize[] = $prize_info[$v];
                        $prize_data[] = ['user_id' => $user->id, 'prize_id' => $prize_info[$v]->id, 'event_id' => $this->event_id];
                    }
                }

                //用户信息
                $user_event_info->extend[$type] += 1;
                $user_event_info->extend[$type . '_count'] += 1;
                $user_event_info->extend[$type . '_sum'] += 1;
                $user_event_info->extend['count'] -= $this->event->extend['amount']*$this->event->extend[$type];
                $event_data['extend'] = json_encode($user_event_info->extend);
                $event_data['sort'] = $user_event_info->sort + $this->event->extend[$type];
                $event_data['update_at'] = date('Y-m-d H:i:s');

                //更新
                DB::beginTransaction();
                $re = DB::table('user_event')->where('id', $user_event_info->id)->update($event_data);
                $re2 = DB::table('user_prize')->insert($prize_data);

                $i = 0;
                $red = [];
                $data = [];
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

                if ($re && $re2 && $i == count($red)) {
                    DB::commit();
                    return ['errcode' => 0, 'msg' => "你获得了{$prize[0]->title}", 'data' => $data];
                } else {
                    DB::rollBack();
                    return ['errcode' => 4001, 'msg' => "抽奖失败"];
                }
                break;
            case in_array($type, ['min_eat', 'max_eat']):
                $prize = [];
                $prize_data = [];

                $user_event_info = DB::table('user_event')->where([['user_id', $user->id], ['event_id', $this->event_id]])->first();
                $user_event_info->extend = json_decode($user_event_info->extend, true);

                if ($user_event_info->extend[$type == 'min_eat' ? 'min_luck_draw_count' : 'max_luck_draw_count'] < $this->event->extend[$type]) return ['errcode' => 1001, 'msg' => '您的领取机会不足！'];

                //抽奖，查询按次数奖品
                $prize_info = DB::table('event_prize as ep')
                    ->leftJoin('red as r', 'r.id', '=', 'ep.prize')
                    ->select('ep.id', 'ep.title', 'ep.type')
                    ->where([['ep.event_id', $this->event_id], ['ep.count', '>', 1], ['ep.extend', 'like', "%group_" . ($type == 'min_eat' ? '3' : '4') . "%"], ['ep.count', '=', $user_event_info->extend[$type] + 1]])
                    ->orderBy('order', 'asc')
                    ->first();

                if ($prize_info) {
                    $prize[] = $prize_info;
                    $prize_data[] = ['user_id' => $user->id, 'prize_id' => $prize_info->id, 'event_id' => $this->event_id];
                } else {
                    //按概率抽奖
                    $prize_info = DB::table('event_prize as ep')
                        ->leftJoin('red as r', 'r.id', '=', 'ep.prize')
                        ->select('ep.id', 'ep.title', 'ep.chance', 'ep.type', 'ep.prize')
                        ->where([['ep.event_id', $this->event_id], ['ep.extend', 'like', "%group_" . ($type == 'min_eat' ? '3' : '4') . "%"]])
                        ->orderBy('order', 'asc')
                        ->get();
                    $probability = [];
                    foreach ($prize_info as $v) {
                        $probability[] = json_decode($v->chance, true)[0];
                    }
                    $num = Prize::probability($probability, 10000);
                    foreach ($num as $v) {
                        $prize[] = $prize_info[$v];
                        $prize_data[] = ['user_id' => $user->id, 'prize_id' => $prize_info[$v]->id, 'event_id' => $this->event_id];
                    }
                }

                //用户信息
                $user_event_info->extend[$type] += 1;
                $user_event_info->extend[$type == 'min_eat' ? 'min_luck_draw_count' : 'max_luck_draw_count'] -= $this->event->extend[$type];
                $event_data['extend'] = json_encode($user_event_info->extend);
                $event_data['update_at'] = date('Y-m-d H:i:s');

                //更新
                DB::beginTransaction();
                $re = DB::table('user_event')->where('id', $user_event_info->id)->update($event_data);
                $re2 = DB::table('user_prize')->insert($prize_data);

                $i = 0;
                $red = [];
                $data = [];
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

                if ($re && $re2 && $i == count($red)) {
                    DB::commit();
                    return ['errcode' => 0, 'msg' => "你获得了{$prize[0]->title}", 'data' => $data];
                } else {
                    DB::rollBack();
                    return ['errcode' => 4001, 'msg' => "抽奖失败"];
                }
                break;
            case in_array($type, ['min_empty', 'max_empty']):
                $prize = [];
                $prize_data = [];
                $type_arr = ['min_empty' => 'min_luck_draw', 'max_empty' => 'max_luck_draw'];

                $user_event_info = DB::table('user_event')->where([['user_id', $user->id], ['event_id', $this->event_id]])->first();
                $user_event_info->extend = json_decode($user_event_info->extend, true);

                if ($user_event_info->extend['count'] < $this->event->extend['amount'] * $this->event->extend[$type_arr[$type]]) return ['errcode' => 1001, 'msg' => '您的领取机会不足！'];

                //抽奖，查询按次数奖品
                $prize_info = DB::table('event_prize as ep')
                    ->leftJoin('red as r', 'r.id', '=', 'ep.prize')
                    ->select('ep.id', 'ep.title', 'ep.type')
                    ->where([['ep.event_id', $this->event_id], ['ep.count', '>', 1], ['ep.extend', 'like', "%group_" . ($type_arr[$type] == 'min_luck_draw' ? '1' : '2') . "%"], ['ep.count', '=', $user_event_info->extend[$type_arr[$type]] + 1]])
                    ->orderBy('order', 'asc')
                    ->first();

                if ($prize_info) {
                    $prize[] = $prize_info;
                    $prize_data[] = ['user_id' => $user->id, 'prize_id' => $prize_info->id, 'event_id' => $this->event_id];
                }

                //用户信息
                $user_event_info->extend[$type_arr[$type]] += 1;
                $user_event_info->extend[$type_arr[$type] . '_count'] += 1;
                $user_event_info->extend[$type_arr[$type] . '_sum'] += 1;
                $user_event_info->extend['count'] -= $this->event->extend['amount']*$this->event->extend[$type_arr[$type]];
                $event_data['extend'] = json_encode($user_event_info->extend);
                $event_data['sort'] = $user_event_info->sort + $this->event->extend[$type_arr[$type]];
                $event_data['update_at'] = date('Y-m-d H:i:s');

                //更新
                DB::beginTransaction();
                $re = DB::table('user_event')->where('id', $user_event_info->id)->update($event_data);
                $re2 = DB::table('user_prize')->insert($prize_data);

                $i = 0;
                $red = [];
                $data = [];
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

                if ($re && $re2 && $i == count($red)) {
                    DB::commit();
                    if(empty($prize)){
                        return ['errcode' => 4002, 'msg' => "没有获得奖品！！！"];
                    }else {
                        return ['errcode' => 0, 'msg' => "你获得了{$prize[0]->title}", 'data' => $data];
                    }
                } else {
                    DB::rollBack();
                    return ['errcode' => 4001, 'msg' => "抽奖失败！！！"];
                }
                break;
            default:
                return ['errcode' => 4001, 'msg' => "notype"];
        }
    }

    public function record($user, $page = 1)
    {
        $page_size = 10;
        if (!$user) return ['errcode' => 1001, 'msg' => "未登录"];
        $query = DB::table('user_prize as up');
        $query->leftJoin('event_prize as ep', 'ep.id', '=', 'up.prize_id')
            ->select('ep.title', 'up.create_at')
            ->where([['up.user_id', $user->id], ['ep.event_id', $this->event_id]]);
        $total = $query->count();
        $list = $query->orderBy('up.create_at', 'desc')
            ->offset(($page - 1) * $page_size)->limit($page_size)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total]];
    }

}