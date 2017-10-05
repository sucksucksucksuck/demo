<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/13
 * Time: 16:53
 */

namespace App\Http\Controllers\Event\MagpieFestival;

use App\Http\Controllers\Event\AbsEvent;
use App\Common\Prize;
use Illuminate\Support\Facades\DB;

/**
 * 七夕节
 * Class Index
 * @package App\Http\Controllers\Event\MagpieFestival
 */
class Index extends AbsEvent
{
    private $event_id = 200;

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
        $user = DB::table('user')->where('id', $user_id)->first();
        $this->getUserEvent($user->id, $this->event_id, $this->event->extend['user_extend']);
        if (in_array($this->user_event->extend['index'], $this->event->extend['recharge'])) {
            $this->setAmount($amount);
        }
    }

    /**
     * 当用户消费后会调用这个接口
     * @param int $user_id 用户ID
     * @param int $amount
     * @return array
     */
    public function consumer($user_id, $amount)
    {
        $this->event_at();
        $user = DB::table('user')->where('id', $user_id)->first();
        $this->getUserEvent($user->id, $this->event_id, $this->event->extend['user_extend']);
        if (in_array($this->user_event->extend['index'], $this->event->extend['consumer'])) {
            $this->setAmount($amount);
        }
    }

    private function setAmount($amount){
        if($this->user_event->extend['last_date'] != date('Y-m-d')){
            if($this->user_event->extend['date'] != date('Y-m-d')){
                $this->user_event->extend['date'] = date('Y-m-d');
                $this->user_event->extend['amount'] = 0;
            }
            $this->user_event->extend['amount']+=$amount;
            if($this->user_event->extend['amount'] >= $this->event->extend['count_amount'][$this->user_event->extend['index']]){
                $this->user_event->extend['index']++;
                $this->user_event->extend['amount'] = 0;
                $this->user_event->extend['last_date'] = date('Y-m-d');
            }
            DB::table('user_event')->where('id', $this->user_event->id)->update(['extend'=>json_encode($this->user_event->extend)]);
        }
    }

    /**
     * 初始化
     * @param $user
     * @return array
     */
    public function init($user)
    {
        $data = ['user_info' => [], 'is_login' => false, 'datetime' => date('Y/m/d H:i:s'), 'is_date' => date('Y-m-d') >= $this->event->extend['luck_draw_date'] ? true : false];

        if ($user) {
            $data['is_login'] = true;
            $this->getUserEvent($user->id, $this->event_id, $this->event->extend['user_extend']);

            if($this->user_event->extend['last_date'] != date('Y-m-d')) {
                $user_info['index'] = $this->user_event->extend['index'];
                $user_info['amount'] = $this->user_event->extend['amount'];
                if($this->user_event->extend['date'] != date('Y-m-d'))$user_info['amount'] = 0;
            }else{
                $user_info['index'] = $this->user_event->extend['index']-1;
                $user_info['amount'] = $this->event->extend['count_amount'][$user_info['index']];
            }

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
    public function luckDraw($user, $type = 'default')
    {
        $this->end_at = date('Y-m-d H:i:s', strtotime("{$this->end_at} +1 day"));
        $this->event_at();
        if (date('Y-m-d') < $this->event->extend['luck_draw_date']) throw new \Exception('抽奖时间未到！！！', 1004);
        if (!$user) throw new \Exception('未登录', 1001);

        $prize = [];
        $data = [];

        $this->getUserEvent($user->id, $this->event_id, $this->event->extend['user_extend']);

        if ($this->user_event->extend['index'] < 6) throw new \Exception('您未完成任务！！！', 1002);
        if ($this->user_event->extend['index'] > 6) throw new \Exception('您已经领取奖品！！！', 1003);

        //按概率抽奖
        $prize_info = DB::table('event_prize as ep')
            ->leftJoin('red as r', 'r.id', '=', 'ep.prize')
            ->select('ep.id', 'ep.title', 'ep.icon', 'ep.chance', 'ep.type', 'ep.prize', 'ep.extend', 'ep.event_id', 'ep.order')
            ->where([['ep.event_id', $this->event_id], ['ep.count', '<=', 1], ['ep.status', 1]])
            ->orderBy('order', 'asc')
            ->get();
        $probability = [];
        foreach ($prize_info as $v) {
            $probability[] = json_decode($v->chance, true)[0];
        }
        $num = Prize::probability($probability, 10000);
        foreach ($num as $v) {
            $prize[] = $prize_info[$v];
        }

        //用户信息
        $this->user_event->extend['index']++;
        $event_data['extend'] = json_encode($this->user_event->extend);
        $event_data['sort'] = $this->user_event->sort++;
        $event_data['update_at'] = date('Y-m-d H:i:s');

        //更新
        DB::beginTransaction();
        $re = DB::table('user_event')->where('id', $this->user_event->id)->update($event_data);

        try {
            foreach ($prize as $v) {
                Prize::grant($v, $user);
                $data['list'][] = ['id' => $v->id, 'title' => $v->title, 'type' => $v->type,'order'=>$v->order];
            }
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception($e->getMessage(), 5001);
        }

        if ($re) {
            DB::commit();
            return ['errcode' => 0, 'msg' => "ok", 'data' => $data];
        } else {
            DB::rollBack();
            return ['errcode' => 4002, 'msg' => "抽奖失败"];
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