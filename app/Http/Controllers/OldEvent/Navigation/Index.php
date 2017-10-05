<?php
namespace App\Http\Controllers\Event\Navigation;

use App\Http\Controllers\Event\AbsEvent;
use DB;
use App\Common\Prize;

/**
 * 航海活动
 * Class Index
 * @package App\Http\Controllers\Event\Navigation
 */
class Index extends AbsEvent
{
    private $event_id = 4;

    function __construct()
    {
        $this->event = DB::table('event')->select('begin_at', 'end_at')->find($this->event_id);
        if($this->event) {
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
    }

    /**
     * 消费得到获取部件机会
     * @param int $user_id 用户ID
     * @param int $amount
     * @return array
     */
    public function consumer($user_id, $amount)
    {
        $this->event_at();
        $user_event_info = DB::table('user_event')->where([['user_id', $user_id], ['event_id', $this->event_id]])->first();
        if (!$user_event_info) {
            $user_event_info = [];
            $user_event_info['user_id'] = $user_id;
            $user_event_info['event_id'] = $this->event_id;
            $user_event_info['update_at'] = date('Y-m-d H:i:s');
            //getTool = 剩余消费金额，distance = 航海里程,navigation_count = 航海次数，parts = 1-8号部件数（甲板，船锚，指南针，桅杆，船舵，船桨，风帆，望远镜）
            $extend = ['get_tool' => $amount, 'distance' => 0, 'navigation_count' => 0, 'parts' => [0, 0, 0, 0, 0, 0, 0, 0]];
            $user_event_info['extend'] = json_encode($extend);
            DB::table('user_event')->insert($user_event_info);
        } else {
            $user_event_info->extend = json_decode($user_event_info->extend, true);
            $user_event_info->extend['get_tool'] += $amount;
            $data['extend'] = json_encode($user_event_info->extend);
            DB::table('user_event')->where('id', $user_event_info->id)->update($data);
        }
        return ['errcode' => 0, 'msg' => 'ok'];
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
                //get_tool = 剩余消费金额，distance = 航海里程,navigation_count = 航海次数，parts = 1-8号部件数（甲板，船锚，指南针，桅杆，船舵，船桨，风帆，望远镜）
                $extend = ['get_tool' => 0, 'distance' => 0, 'navigation_count' => 0, 'parts' => [0, 0, 0, 0, 0, 0, 0, 0]];
                $user_event_info['extend'] = json_encode($extend);
                DB::table('user_event')->insert($user_event_info);
                $user_info = $extend;
            } else {
                $user_info = json_decode($user_event_info->extend, true);
            }
            if ($user_info['distance'] == 0) {
                $user_info['rank'] = 0;
            } else {
                $user_info['rank'] = DB::table('user_event')->where([['sort', '>', $user_info['distance']], ['event_id', $this->event_id]])->orderBy('sort', 'desc')->count('id') + 1;
            }
        }

        $rank_list = DB::table('user_event as ue')
            ->leftJoin('user as u', 'u.id', '=', 'ue.user_id')
            ->select('ue.id', 'u.nickname', 'ue.sort')
            ->where([['event_id', $this->event_id]])
            ->orderBy('ue.sort', 'desc')
            ->orderBy('ue.update_at', 'asc')
            ->limit(10)
            ->get();
        $data = ['rank_list' => $rank_list, 'begin_at' => $this->begin_at, 'end_at' => $this->end_at];
        if ($user_info) {
            $data['user_info'] = $user_info;
            $data['user_info']['get_tool'] = intval($data['user_info']['get_tool'] / 500);
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
        $this->end_at = date('Y-m-d H:i:s',strtotime($this->end_at)+3600*24);
        $this->event_at();
        if (!$user) return ['errcode' => 1001, 'msg' => "未登录"];
        switch ($type) {
            case
            'parts':
                $num_probability = [40, 40, 20];   //获取部件数量的概率
                $parts_probability = [12, 13, 12, 14, 11, 15, 12, 11];  //部件获取概率

                $user_event_info = DB::table('user_event')->where([['user_id', $user->id], ['event_id', $this->event_id]])->first();
                $user_event_info->extend = json_decode($user_event_info->extend, true);
                if ($user_event_info->extend['get_tool'] < 500) return ['errcode' => 2001, 'msg' => '你没有获取部件的机会，请及时充值！'];

                $num = Prize::probability($num_probability, 1000000)[0] + 1;
                $parts = Prize::probability($parts_probability, 1000000, $num);
                foreach ($parts as $v) {
                    $user_event_info->extend['parts'][$v] += 1;
                }
                $user_event_info->extend['get_tool'] -= 500;
                $data['extend'] = json_encode($user_event_info->extend);
                $re = DB::table('user_event')->where('id', $user_event_info->id)->update($data);

                if ($re)
                    return ['errcode' => 0, 'msg' => "你获得了{$num}个部件", 'data' => ['num' => $num, 'parts' => $parts]];
                else
                    return ['errcode' => 4001, 'msg' => "获取失败"];
                break;
            case 'luck_draw':
                $distance_arr = [[50, 59], [60, 69], [70, 79], [80, 89], [90, 100]];
                $distance_probability = [30, 25, 15, 15, 15];
                $user_event_info = DB::table('user_event')->where([['user_id', $user->id], ['event_id', $this->event_id]])->first();
                $user_event_info->extend = json_decode($user_event_info->extend, true);
                $parts8 = true;
                foreach ($user_event_info->extend['parts'] as $v) {
                    if ($v <= 0) {
                        $parts8 = false;
                        break;
                    }
                }
                if (!$parts8) return ['errcode' => 1001, 'msg' => '你的部件不足，不能出航！'];
                $prize_info = DB::table('event_prize as ep')
                    ->leftJoin('red as r', 'r.id', '=', 'ep.prize')
                    ->select('ep.id', 'ep.title', 'ep.chance', 'ep.type', 'ep.prize', 'ep.count')
                    ->where('ep.event_id', $this->event_id)
                    ->orderBy('order', 'asc')
                    ->get();
                $prize_list = [];
                foreach ($prize_info as $k => $v) {
                    if ($v->count == 1)
                        $prize_list[0][] = $v;
                    else
                        $prize_list[1][] = $v;
                }

                $prize = [];
                foreach ($prize_list[1] as $v) {
                    if ($v->count == $user_event_info->extend['navigation_count']) {
                        $prize = $v;
                        break;
                    }
                }

                $probability = [];
                if (!$prize) {
                    foreach ($prize_list[0] as $v) {
                        $probability[] = json_decode($v->chance, true)[0];
                    }
                    $num = Prize::probability($probability, 10000)[0];
                    $prize = $prize_list[0][$num];
                }

                foreach ($user_event_info->extend['parts'] as $k => $v) {
                    $user_event_info->extend['parts'][$k] -= 1;
                }
                $distance_num = Prize::probability($distance_probability, 10000)[0];
                $distance = mt_rand($distance_arr[$distance_num][0], $distance_arr[$distance_num][1]);
                if(date('Y-m-d') >= '2017-04-29') {
                    $distance = 0;
                }
                $user_event_info->extend['distance'] += $distance;
                $user_event_info->update_at = date('Y-m-d H:i:s');
                $user_event_info->extend['navigation_count'] = $user_event_info->extend['navigation_count'] == 110 ? 0 : ++$user_event_info->extend['navigation_count'];
                $event_data['extend'] = json_encode($user_event_info->extend);
                $event_data['sort'] = $user_event_info->extend['distance'];

                $prize_data['user_id'] = $user->id;
                $prize_data['prize_id'] = $prize->id;

                if ($prize->type == 3)
                    Prize::red($user->id, $prize->prize);
                $re = true;
                if (in_array($prize->type, [1, 3]))
                    $re = DB::table('user_prize')->insert($prize_data);
                $re2 = DB::table('user_event')->where('id', $user_event_info->id)->update($event_data);

                $data = ['id' => $prize->id, 'title' => $prize->title, 'type' => $prize->type, 'distance' => $distance];

                if ($re && $re2) {
                    return ['errcode' => 0, 'msg' => "你获得了{$prize->title}", 'data' => $data];
                } else {
                    return ['errcode' => 4001, 'msg' => "抽奖失败"];
                }
                break;
            default:
                return ['errcode' => 4001, 'msg' => "notype"];
        }
    }

    public function record($user, $page = 1)
    {
        if (!$user) return ['errcode' => 1001, 'msg' => "未登录"];
        $data = DB::table('user_prize as up')
            ->leftJoin('event_prize as ep', 'ep.id', '=', 'up.prize_id')
            ->select('ep.title', 'up.create_at')
            ->where([['up.user_id' , $user->id],['ep.event_id',$this->event_id]])
            ->orderBy('up.create_at', 'desc')
            //->offset(($page - 1) * 20)->limit(20)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

}