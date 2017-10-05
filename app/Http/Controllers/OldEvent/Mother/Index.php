<?php

namespace App\Http\Controllers\Event\Mother;

use App\Http\Controllers\Event\AbsEvent;
use DB;
use App\Common\Prize;

/**
 * 母亲节
 * Class Index
 * @package App\Http\Controllers\Event\Mother
 */
class Index extends AbsEvent
{
    private $event_id = 7;

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
        $user_event_info = DB::table('user_event')->where([['user_id', $user_id], ['event_id', $this->event_id]])->first();
        if (!$user_event_info) {
            $user_event_info = [];
            $user_event_info['user_id'] = $user_id;
            $user_event_info['event_id'] = $this->event_id;
            $user_event_info['update_at'] = date('Y-m-d H:i:s');
            $user_event_info['sort'] = 0;
            //amount = 剩余金额，carnation = 康乃馨数量，count = 抽奖次数
            $extend = ['amount' => $amount, 'carnation' => 0, 'count' => 0];
            $user_event_info['extend'] = json_encode($extend);
            DB::table('user_event')->insert($user_event_info);
        } else {
            $user_event_info->extend = json_decode($user_event_info->extend, true);
            $user_event_info->extend['amount'] += $amount;
            $data['extend'] = json_encode($user_event_info->extend);
            DB::table('user_event')->where('id', $user_event_info->id)->update($data);
        }
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
        $user_info = [];
        if ($user) {
            $user_event_info = DB::table('user_event')->select('extend')->where([['user_id', $user->id], ['event_id', $this->event_id]])->first();
            if (!$user_event_info) {
                $user_event_info = [];
                $user_event_info['user_id'] = $user->id;
                $user_event_info['event_id'] = $this->event_id;
                $user_event_info['update_at'] = date('Y-m-d H:i:s');
                //amount = 剩余金额，carnation = 康乃馨数量，count = 抽奖次数
                $extend = ['amount' => 0, 'carnation' => 0, 'count' => 0];
                $user_event_info['extend'] = json_encode($extend);
                $user_event_info['sort'] = 0;
                DB::table('user_event')->insert($user_event_info);
                $user_info = $extend;
            } else {
                $user_info = json_decode($user_event_info->extend, true);
            }
            if ($user_info['carnation'] == 0) {
                $user_info['rank'] = 0;
            } else {
                $user_info['rank'] = DB::table('user_event')->where([['sort', '>', $user_info['carnation']], ['event_id', $this->event_id]])->orderBy('sort', 'desc')->count('id') + 1;
            }
            $user_info['surplus_carnation'] = intval($user_info['amount'] / $this->event->extend['amount']);
            unset($user_info['amount']);
        }

        $rank_list = DB::table('user_event as ue')
            ->leftJoin('user as u', 'u.id', '=', 'ue.user_id')
            ->select('ue.id', 'u.nickname', 'ue.sort')
            ->where([['ue.event_id', $this->event_id],['ue.sort','!=',0]])
            ->orderBy('ue.sort', 'desc')
            ->orderBy('ue.update_at', 'asc')
            ->limit(10)
            ->get();
        $data = ['rank_list' => $rank_list, 'begin_at' => $this->begin_at, 'end_at' => $this->end_at];
        if ($user_info) {
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
        $prize = null;
        $type = $type == 1 ? 0 : 1;
        $prize_data = [];

        $this->carnation_at = $this->end_at;
        $this->end_at = date('Y-m-d H:i:s', strtotime($this->end_at) + 3600 * 24);
        $this->event_at();
        if (!$user) return ['errcode'=>1001,'msg'=>'未登录'];

        $user_event_info = DB::table('user_event')->where([['user_id', $user->id], ['event_id', $this->event_id]])->first();
        $user_event_info->extend = json_decode($user_event_info->extend, true);
        $count = $this->event->extend['count'][$type];

        if (intval($user_event_info->extend['amount'] / $this->event->extend['amount']) < $this->event->extend['consume_carnation'][$type]) return ['errcode'=>1001,'msg'=>'您的康乃馨不足！'];

        //抽奖，查询按次数奖品
        $prize_info = DB::table('event_prize as ep')
            ->leftJoin('red as r', 'r.id', '=', 'ep.prize')
            ->select('ep.id', 'ep.title','ep.type')
            ->where([['ep.event_id', $this->event_id], ['ep.count', '>', 1], ['ep.count', '>', $user_event_info->extend['count']], ['ep.count', '<=', $user_event_info->extend['count'] + $this->event->extend['count'][$type]]])
            ->orderBy('order', 'asc')
            ->first();

        if ($prize_info) {
            $count -= 1;
            $prize[] = $prize_info;
            $prize_data[] =['user_id' => $user->id,'prize_id'=>$prize_info->id,'event_id'=>$this->event_id ];
        }
        //按概率抽奖
        if($count){
            $prize_info = DB::table('event_prize as ep')
                ->leftJoin('red as r', 'r.id', '=', 'ep.prize')
                ->select('ep.id', 'ep.title', 'ep.chance','ep.type', 'ep.prize')
                ->where([['ep.event_id', $this->event_id], ['ep.count', '<=', 1]])
                ->orderBy('order', 'asc')
                ->get();
            $probability = [];
            foreach ($prize_info as $v) {
                $probability[] = json_decode($v->chance, true)[0];
            }
            $num = Prize::probability($probability, 10000,$count);
            foreach ($num as $v){
                $prize[] = $prize_info[$v];
                $prize_data[] =['user_id' => $user->id,'prize_id'=>$prize_info[$v]->id,'event_id'=>$this->event_id ];
            }
        }

        //用户信息
        $user_event_info->extend['count'] += $this->event->extend['count'][$type];
        $user_event_info->extend['amount'] -= $this->event->extend['amount']*$this->event->extend['consume_carnation'][$type];
        if(date('Y-m-d H:i:s') > $this->carnation_at){
            $this->event->extend['consume_carnation'][$type] = 0;
        }
        $user_event_info->extend['carnation'] += $this->event->extend['consume_carnation'][$type];
        $event_data['extend'] = json_encode($user_event_info->extend);
        $event_data['sort'] = $user_event_info->extend['carnation'];
        $event_data['update_at'] = date('Y-m-d H:i:s');

        //更新
        DB::beginTransaction();
        $re = DB::table('user_event')->where('id', $user_event_info->id)->update($event_data);
        $re2 = DB::table('user_prize')->insert($prize_data);

        $i = 0;
        $red = [];
        foreach ($prize as $v){
            if($v->type == 3){
                $i++;
                $red_info = Prize::red($user->id, $v->prize);
                if($red_info['status']==0){
                    $red[] = $red_info['data'][0];
                }
            }
            $data['list'][] = ['id' => $v->id, 'title' => $v->title, 'type' => $v->type ];
        }

        if ($re && $re2 && $i == count($red)) {
            DB::commit();
            $data['carnation'] = $this->event->extend['consume_carnation'][$type];
            return ['errcode' => 0, 'msg' => "你获得了{$this->event->extend['count'][$type]}件奖品", 'data' => $data];
        } else {
            DB::rollBack();
            return ['errcode' => 4001, 'msg' => "抽奖失败"];
        }

    }

    public function record($user, $page = 1)
    {
        if (!$user) return ['errcode'=>1001,'msg'=>'未登录'];
        $data = DB::table('user_prize as up')
            ->leftJoin('event_prize as ep', 'ep.id', '=', 'up.prize_id')
            ->select('ep.title', 'up.create_at')
            ->where([['up.user_id', $user->id], ['up.event_id', $this->event_id]])
            ->orderBy('up.create_at', 'desc')
            //->offset(($page - 1) * 20)->limit(20)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

}