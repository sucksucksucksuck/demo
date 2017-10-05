<?php

namespace App\Http\Controllers\Event\RedRain;

use App\Http\Controllers\Event\AbsEvent;
use DB;
use App\Common\Prize;

class Index extends AbsEvent
{
    private $event_id = 10;
    private $pay_event = null;
    private $luck_draw_event = null;
    private $user_extend = ['recharge_amount' => 0, 'count' => 0];

    function __construct()
    {
        $this->event = DB::table('event')->select('begin_at', 'end_at', 'extend')->find($this->event_id);
        if ($this->event) {
            $this->event->extend = json_decode($this->event->extend??'', true);
            $this->begin_at = $this->event->begin_at;
            $this->end_at = $this->event->end_at;
        }

        //生成子活动
        $time = time();
        //$time = strtotime(date('2017-06-16 10:00:00'));
        $day_time = $this->event->extend['day_time'];
        $pay_time = '';
        $luck_draw_time = '';
        $len = count($day_time);
        $pay_begin_at = null;
        $pay_end_at = null;
        $luck_draw_begin_at = null;
        $luck_draw_end_at = null;
        for ($i = 0; $i <= $len; $i++) {
            if ($i == $len && !$pay_time && date('Y-m-d') != date('Y-m-d', strtotime($this->end_at))) {
                $pay_time = date('Y-m-d ', time() + 3600 * 24) . $day_time[0];
                $pay_begin_at = date('Y-m-d H:i:s',strtotime(date('Y-m-d ') . $day_time[$len-1])+60 * $this->event->extend['time_limit']);
                $pay_end_at = date('Y-m-d H:i:s',strtotime(date('Y-m-d ') . $day_time[0])+(3600*24)+60 * $this->event->extend['time_limit']);
            }

            if (!$pay_time && $i < $len && $time - 60 * $this->event->extend['time_limit'] < strtotime(date('Y-m-d ') . $day_time[$i])) {
                $pay_time = date('Y-m-d ') . $day_time[$i];
                if($i==0){
                    $pay_begin_at = date('Y-m-d H:i:s',strtotime(date('Y-m-d ') . $day_time[$len-1])-(3600*24)+60 * $this->event->extend['time_limit']);
                }else{
                    $pay_begin_at = date('Y-m-d H:i:s',strtotime(date('Y-m-d ') . $day_time[$i-1])+60 * $this->event->extend['time_limit']);
                }
                $pay_end_at = date('Y-m-d H:i:s',strtotime(date('Y-m-d ') . $day_time[$i])+60 * $this->event->extend['time_limit']);
            }
            if (!$luck_draw_time && $i < $len && $time >= strtotime(date('Y-m-d ') . $day_time[$i]) && $time - 60 * $this->event->extend['time_limit'] <= strtotime(date('Y-m-d ') . $day_time[$i])) {
                $luck_draw_time = date('Y-m-d ') . $day_time[$i];
                $luck_draw_begin_at = date('Y-m-d ') . $day_time[$i];
                $luck_draw_end_at = date('Y-m-d H:i:s',strtotime(date('Y-m-d ') . $day_time[$i])+60 * $this->event->extend['time_limit']);
            }
        }

        if ($pay_time) {
            $this->pay_event = DB::table('event')->where([['pid', $this->event_id], ['extend', 'like', "%{$pay_time}%"]])->first();
            if (!$this->pay_event) {
                $this->pay_event = $this->addEvent($pay_time,$pay_begin_at,$pay_end_at);
            }
        }
        if ($luck_draw_time) {
            $this->luck_draw_event = DB::table('event')->where([['pid', $this->event_id], ['extend', 'like', "%{$luck_draw_time}%"]])->first();
            if (!$this->luck_draw_event) {
                $this->luck_draw_event = $this->addEvent($luck_draw_time,$luck_draw_begin_at,$luck_draw_end_at);
            }
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
        if (!$this->pay_event) throw new \Exception('充值时间已过', 1001);

        $user_event_info = DB::table('user_event')->where([['user_id', $user_id], ['event_id', $this->event_id]])->first();
        $user_event_info_pay = DB::table('user_event')->where([['user_id', $user_id], ['event_id', $this->pay_event->id]])->first();
        if (!$user_event_info || !$user_event_info_pay) {
            $user = DB::table('user')->where('id', $user_id)->first();
            $this->init($user);
            $user_event_info = DB::table('user_event')->where([['user_id', $user_id], ['event_id', $this->event_id]])->first();
            $user_event_info_pay = DB::table('user_event')->where([['user_id', $user_id], ['event_id', $this->pay_event->id]])->first();
        }

        $user_event_info->extend = json_decode($user_event_info->extend, true);
        $user_event_info->extend['recharge_amount'] += $amount;
        $data['extend'] = json_encode($user_event_info->extend);
        DB::table('user_event')->where('id', $user_event_info->id)->update($data);

        $user_event_info_pay->extend = json_decode($user_event_info_pay->extend, true);
        $user_event_info_pay->extend['recharge_amount'] += $amount;
        $data_pay['extend'] = json_encode($user_event_info_pay->extend);
        DB::table('user_event')->where('id', $user_event_info_pay->id)->update($data_pay);

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
        $data = [];
        $current_info = null;
        $luck_draw_info = null;
        $current_user_info = null;
        $luck_draw_user_info = null;

        if ($user) {
            //主活动
            $user_event_info = DB::table('user_event')->select('extend')->where([['user_id', $user->id], ['event_id', $this->event_id]])->first();
            if (!$user_event_info) {
                $user_info = $this->addUserEvent($user->id, $this->event_id,$this->user_extend);
            } else {
                $user_info = json_decode($user_event_info->extend, true);
            }

            //充值子活动
            if ($this->pay_event)
                $current_info = DB::table('user_event')->select('extend')->where([['user_id', $user->id], ['event_id', $this->pay_event->id]])->first();
            if (!$current_info && $this->pay_event) {
                $current_user_info = $this->addUserEvent($user->id, $this->pay_event->id,$this->user_extend);
            } else if ($this->pay_event) {
                $current_user_info = json_decode($current_info->extend, true);
            }

            //抽奖子活动
            if ($this->luck_draw_event)
                $luck_draw_info = DB::table('user_event')->select('extend')->where([['user_id', $user->id], ['event_id', $this->luck_draw_event->id]])->first();
            if (!$luck_draw_info && $this->luck_draw_event) {
                $luck_draw_user_info = $this->addUserEvent($user->id, $this->luck_draw_event->id,$this->user_extend);
            } else if ($this->luck_draw_event) {
                $luck_draw_user_info = json_decode($luck_draw_info->extend, true);
            }

            $data['amount'] = $this->luck_draw_event ? $luck_draw_user_info['recharge_amount']??0 : $current_user_info['recharge_amount']??0;
            $data['count'] = $luck_draw_user_info['count']??0;
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['user_info' => $data, 'datetime' => date('Y-m-d H:i:s')]];
    }

    /**
     *  抽奖
     * @param array $user 用户信息
     * @param string $type xxx
     * @return array
     */
    public function luckDraw($user, $type = 'default')
    {
        $this->event_at();
        if (!$user) throw new \Exception('未登录', 1001);

        if (!$this->luck_draw_event) throw new \Exception('本期领取未开始！', 1002);

        $prize = [];
        $prize_data = [];

        $user_event_info = DB::table('user_event')->where([['user_id', $user->id], ['event_id', $this->event_id]])->first();
        $user_event_info->extend = json_decode($user_event_info->extend, true);
        $luck_draw_info = DB::table('user_event')->where([['user_id', $user->id], ['event_id', $this->luck_draw_event->id]])->first();
        if ($luck_draw_info) {
            $luck_draw_info->extend = json_decode($luck_draw_info->extend, true);
        } else {
            $this->addUserEvent($user->id, $this->luck_draw_event->id,$this->user_extend);
            $luck_draw_info = DB::table('user_event')->where([['user_id', $user->id], ['event_id', $this->luck_draw_event->id]])->first();
            $luck_draw_info->extend = json_decode($luck_draw_info->extend, true);
        }

        if ($luck_draw_info->extend['recharge_amount'] < $this->event->extend['recharge_amount']) throw new \Exception('您本轮充值金额不足！', 1003);
        if ($luck_draw_info->extend['count'] >= $this->event->extend['count']) throw new \Exception('您已经领取了三次红包！', 1004);

        $limit_prize_id = DB::table('user_prize')->whereIn('prize_id', [285, 286, 287])->where([['user_id', $user->id], ['event_id', $this->luck_draw_event->id]])->pluck('prize_id');

        //按概率抽奖
        $prize_info = DB::table('event_prize as ep')
            ->leftJoin('red as r', 'r.id', '=', 'ep.prize')
            ->select('ep.id', 'ep.title', 'ep.chance', 'ep.type', 'ep.prize', 'ep.extend')
            ->where([['ep.event_id', $this->event_id],['ep.status',1]])
            ->whereNotIn('ep.id', $limit_prize_id)
            ->orderBy('order', 'asc')
            ->get();
        $probability = [];
        foreach ($prize_info as $v) {
            $probability[] = json_decode($v->chance, true)[0];
        }
        $num = Prize::probability($probability, 10000);
        foreach ($num as $v) {
            $prize[] = $prize_info[$v];
            $prize_data[] = ['user_id' => $user->id, 'prize_id' => $prize_info[$v]->id, 'event_id' => $this->luck_draw_event->id];
        }

        //用户信息
        $user_event_info->extend['count'] += 1;
        $event_data['extend'] = json_encode($user_event_info->extend);
        $event_data['sort'] = $user_event_info->sort + 1;
        $event_data['update_at'] = date('Y-m-d H:i:s');

        $luck_draw_info->extend['count'] += 1;
        $event_data2['extend'] = json_encode($luck_draw_info->extend);
        $event_data2['sort'] = $luck_draw_info->sort + 1;
        $event_data2['update_at'] = date('Y-m-d H:i:s');

        //更新
        DB::beginTransaction();
        $re = DB::table('user_event')->where('id', $user_event_info->id)->update($event_data);
        $re2 = DB::table('user_event')->where('id', $luck_draw_info->id)->update($event_data2);
        $re3 = DB::table('user_prize')->insert($prize_data);

        $i = 0;
        $red = [];
        $data = [];
        foreach ($prize as $k => $v) {
            $amount = 0;
            if ($v->type == 3) {
                $i++;
                $red_info = Prize::red($user->id, $v->prize);
                if ($red_info['status'] == 0) {
                    $red[] = $red_info['data'][0];
                    $amount = $red_info['data'][0]['data']['amount'];
                }
            }
            $data['list'][] = ['id' => $v->id, 'title' => $v->title, 'type' => $v->type, 'amount' => $amount];
        }

        if ($re && $re2 && $re3 && $i == count($red)) {
            DB::commit();
            return ['errcode' => 0, 'msg' => "你获得了{$prize[0]->title}", 'data' => $data];
        } else {
            DB::rollBack();
            return ['errcode' => 4001, 'msg' => "抽奖失败"];
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

    private function addEvent($event_time, $begin_at, $end_at)
    {
        $event = null;
        $file_path = dirname(__FILE__) . "/lock.txt";
        $file = fopen($file_path, "a");
        if (flock($file, LOCK_EX | LOCK_NB)) {
            $data = ['title' => '618红包雨-' . $event_time, 'extend' => json_encode(['key' => $event_time]), 'pid' => $this->event_id, 'begin_at' => $begin_at, 'end_at' => $end_at];
            $event_id = DB::table('event')->insertGetId($data);
            $event = DB::table('event')->where('id', $event_id)->first();

            fwrite($file, "添加活动  key:" . $event_time . ">>>>>>>>>>>>" . date("Y-m-d H:i:s") . "\r\n");
            flock($file, LOCK_UN);
        } else {
            if (flock($file, LOCK_SH)) {
                $event = DB::table('event')->where([['pid', $this->event_id], ['extend', 'like', "%{$event_time}%"]])->first();
                flock($file, LOCK_UN);
            }
        }
        fclose($file);
        return $event;
    }
}