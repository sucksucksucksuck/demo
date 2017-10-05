<?php

namespace App\Http\Controllers\Api\Index;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use App\Http\Controllers\Api\Goods\Search;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/5/23
 * Time: 10:50
 */
//app index
class Index extends AbsResponse
{
    public function execute(array $params)
    {
        //banner
        $data = [];
        $ver = $version = $this->request->header('version', 0);
        if ($ver == 0) {
            $ver = 1;
        }
        $query = DB::table('app_event');
        if (isset($params['time'])) {
            DB::table('app_event')->where('end_at', '<=', $params['time'])->update(['status' => 2]);
            $query->where('update_at', '>', $params['time']);
        } else {
            $query->where(function ($query) {
                $query->where('begin_at', '<=', date('Y-m-d H:i:s'))->orWhereNull('begin_at');
            })->where(function ($query) {
                $query->where('end_at', '>', date('Y-m-d H:i:s'))->orWhereNull('end_at');
            });
        }
        $query->where('status', '=', 1)
            ->whereIn('type', [1, 3])
            ->select(['id', 'title', 'url', 'icon', 'is_login', 'begin_at', 'end_at', 'extend', 'action', 'status', 'sort', 'describe', 'visible']);
        $data['banner'] = $query->get();
        Helper::event($data['banner']);
        foreach ($data['banner'] as $key => $value){
            if($this->user){
                //客服或者测试
                if ($value->visible == 2 && ($this->user->type != 2 && $this->user->type != 4)) {
                    unset($data['banner'][$key]);
                    continue;
                }
                //测试
                if ($value->visible == 3 && $this->user->type != 2) {
                    unset($data['banner'][$key]);
                    continue;
                }
            }
        }
        $data['banner'] = array_values(json_decode(json_encode($data['banner']), true));
        //商品分类
        if (isset($params['time'])) {
            $data['type'] = DB::table('dictionary')
//                ->where('pid', '=', 1)
                ->where('id', '>', 1000)
                ->where('id', '<', 2000)
                ->where('update_at', '>', $params['time'])
                ->orderBy('sort')
                ->get(['id', 'index', 'title', 'delete_at', 'sort']);
            $data['sort'] = DB::table('dictionary')
//                ->where('pid', '=', 2)
                ->where('id', '>', 2000)
                ->where('id', '<', 3000)
                ->where('update_at', '>', $params['time'])
                ->orderBy('sort')
                ->get(['id', 'index', 'title', 'delete_at', 'sort']);
            $data['tag'] = DB::table('dictionary')
//                ->where('pid', '=', 3)
                ->where('id', '>', 3000)
                ->where('id', '<', 4000)
                ->where('update_at', '>', $params['time'])
                ->orderBy('sort')
                ->get(['id', 'index', 'title', 'delete_at', 'extend', 'sort']);
            $data['navigation'] = DB::table('dictionary')
//                ->where('pid', '=', 4)
                ->where('id', '>', 4000)
                ->where('id', '<', 5000)
                ->where('update_at', '>', $params['time'])
                ->orderBy('sort')
                ->get(['id', 'index', 'title', 'delete_at', 'extend', 'sort']);
            if ($this->user) {
                $data['user_msg'] = DB::table('user_message')
                    ->where(['user_id' => $this->user->id])
                    ->where('create_at', '>', $params['time'])
                    ->get(['title']);
            }
            $data['pg_msg'] = DB::table('app_event')
                ->where('status', '=', 1)
                ->whereIn('type', [4, 6])
                ->where('update_at', '>', $params['time'])
                ->get(['title']);
        } else {
            $data['type'] = DB::table('dictionary')->where('id', '>', 1000)->where('id', '<', 2000)->whereNull('delete_at')->orderBy('sort')->get(['id', 'index', 'title', 'sort']);
            $data['sort'] = DB::table('dictionary')->where('id', '>', 2000)->where('id', '<', 3000)->whereNull('delete_at')->orderBy('sort')->get(['id', 'index', 'title', 'sort']);
            $data['tag'] = DB::table('dictionary')->where('id', '>', 3000)->where('id', '<', 4000)->whereNull('delete_at')->orderBy('sort')->get(['id', 'index', 'title', 'extend', 'sort']);
            $data['navigation'] = DB::table('dictionary')->where('id', '>', 4000)->where('id', '<', 5000)->whereNull('delete_at')->orderBy('sort')->get(['id', 'index', 'title', 'extend', 'sort']);
        }
        if (isset($params['time'])) {
            $data['pay'] = [];
            $amount = DB::table('dictionary')
                //     ->where('index', '>', $ver)
                ->where('update_at', '>', $params['time'])
                ->find('6');
            if ($amount) {
                $data['pay']['amount'] = json_decode($amount->extend, true);
            }
            $channel_query = DB::table('dictionary')
                ->where('update_at', '>', $params['time'])
//                ->where('pid', '=', 6)
                ->where('id', '>', 6000)
                ->where('id', '<', 7000)
                ->orderBy('sort', 'asc');
            if ($this->request->header('type') == 'ios') {
                $channel_query->where('pid', '<=', $ver);
            } else {
                $channel_query->where('index', '<=', $ver);
            }
            $channel = $channel_query->get(['id', 'pid', 'title', 'status', 'extend', 'sort']);
            if ($channel && $channel->count()) {
                foreach ($channel as &$c) {
                    $c->extend = json_decode($c->extend, true);
                }
                $data['pay']['channel'] = $channel;
            }
        } else {
            $data['pay'] = [];
            $amount = DB::table('dictionary')
                // ->where('index', '>', $ver)
                // ->where('update_at', '>', $params['time'])
                ->find(6);
            if ($amount) {
                $data['pay']['amount'] = json_decode($amount->extend, true);
            }
            $channel_query = DB::table('dictionary')
//                ->where('pid', '=', 6)
                ->where('id', '>', 6000)
                ->where('id', '<', 7000)
                ->orderBy('sort', 'asc');
            if ($this->request->header('type') == 'ios') {
                $channel_query->where('pid', '<=', $ver);
            } else {
                $channel_query->where('index', '<=', $ver);
            }
            $channel = $channel_query->get(['id', 'pid', 'title', 'status', 'extend', 'sort']);
            if ($channel && $channel->count()) {
                foreach ($channel as &$c) {
                    $c->extend = json_decode($c->extend, true);
                }
                $data['pay']['channel'] = $channel;
            }
        }
        if ($data['navigation']) {
            foreach ($data['navigation'] as &$navigation) {
                $navigation->extend = json_decode($navigation->extend, true);
            }
        } else {
            $data['navigation'] = [];
        }
        if ($data['tag']) {
            foreach ($data['tag'] as &$tag) {
                $tag->extend = json_decode($tag->extend, true);
            }
        } else {
            $data['tag'] = [];
        }

        //count
        $now = date('Y-m-d H:i:s');
//        $new_event_count_query = DB::table('app_event')->whereIn('type', [2, 3]);
        $new_event_count_query = DB::table('app_event')
            ->whereIn('type', [2, 3])
            ->where('status', '=', 1)
            ->whereRaw(" ((begin_at <= '$now' and end_at >= '$now') or (begin_at is null and end_at is null)) ");
        if (isset($params['new_event_time'])) {
            $new_event_count_query->where('update_at', '>', $params['new_event_time']);
        }
        $data['count'] = [];
        $data['count']['new_event_count'] = $new_event_count_query->count();
        $system_message_count_query = DB::table('app_event')
            ->whereIn('type', [5, 6])
            ->where('status', '=', 1);
        $user_message_count_query = DB::table('user_message');
        if (isset($params['pg_message_time'])) {
            $system_message_count_query->where('update_at', '>', $params['pg_message_time']);
        }
        if (isset($params['user_message_time'])) {
            $user_message_count_query->where('create_at', '>', $params['user_message_time']);
        }
        if ($this->user) {
            $user_message_count = $user_message_count_query
                ->where('user_id', '=', $this->user->id)
                ->count();
        } else {
            $user_message_count = 0;
        }
        $system_message_count = $system_message_count_query->count();
        $data['count']['message_count'] = $user_message_count + $system_message_count;
        if ($this->user) {
            $red_count_query = DB::table('user_red')
                ->where(['user_id' => $this->user->id, 'status' => 1])
                ->where('begin_at', '<', $now)
                ->where('end_at', '>=', $now);
            if (isset($params['red_time'])) {
                $red_count_query->where('create_at', '>', $params['red_time']);
            }
            $data['count']['red_count'] = $red_count_query->count();
            $winning_count_query = DB::table('periods')
                ->leftJoin('order', 'periods.order_id', '=', 'order.id')
                ->where(['periods.user_id' => $this->user->id])
                ->where(['order.winning' => 1]);
            if (isset($params['winning_time'])) {
                $winning_count_query->where('periods.lottery_at', '>', $params['winning_time']);
            }
            $data['count']['winning_count'] = $winning_count_query->count();
            if (!isset($params['order'])) {
                DB::table('user')->where(['id' => $this->user->id])->increment('login_times', 1, ['last_login_at' => date('Y-m-d H:i:s'), 'last_login_ip' => $this->request->ip()]);
            }
        } else {
            $data['count']['red_count'] = 0;
            $data['count']['winning_count'] = 0;
        }

        if (isset($params['order'])) {
            //产品列表 page 1
            $data['goods'] = (new Search())->execute(['order' => $params['order']])['data'];
            $data['winning'] = DB::table('periods')
                ->leftJoin('goods', 'goods.id', '=', 'periods.goods_id')
                ->leftJoin('user', 'user.id', '=', 'periods.user_id')
                ->where('periods.lottery_show_at', '<', date('Y-m-d H:i:s'))
                ->where(['periods.status' => 3])
                ->orderBy('periods.lottery_show_at')
                ->limit(5)
                ->get(['periods.id', 'periods.goods_id', 'periods.periods', 'goods.title', 'user.nickname']);

            /*$week = date('w');
            $monday = date('Y-m-d', strtotime('+' . 1 - $week . ' days'));
            $customer_amount = DB::table('customer_amount_log')
                ->where('create_at', '>', $monday)
                ->where(['type' => 1])
                ->select(['user_id', DB::raw('sum(amount) as amount')])
                ->groupBy('user_id')
                ->orderBy(DB::raw('sum(amount)'))
                ->limit(10);
            $user_amount = DB::table('pay_log')
                ->where('create_at', '>', $monday)
                ->select(['user_id', DB::raw('sum(amount) as amount')])
                ->groupBy('user_id')
                ->orderBy(DB::raw('sum(amount)'))
                ->limit(10)->union($customer_amount);
            $amount_log = DB::table(DB::raw('(' . $user_amount->toSql() . ') as log'))
                ->groupBy('user_id')
                ->select(['user_id', DB::raw('sum(amount) as amount')])
                ->orderBy(DB::raw('sum(amount)'))
                ->limit(10);
            $data['ranking'] = DB::table(DB::raw('(' . $amount_log->toSql() . ') as ' . DB::getTablePrefix() . 'a'))
                ->leftJoin('user', 'a.user_id', '=', 'user.id')
                ->whereNotNull('user.id')
                ->orderBy(DB::raw('amount'))
                ->limit(10)
                ->select(['user.id', 'amount', 'user.nickname'])
                ->mergeBindings($customer_amount)
                ->mergeBindings($user_amount)
                ->get();*/

            $start_time = date('Y-m-d', strtotime("-6 day Sunday"));
            $end_time = date('Y-m-d 23:59:59', strtotime("Sunday"));
            $ranking = (new \App\Models\Event\User())->getGodsList($start_time, $end_time, 10);
            $data['ranking'] = [];
            foreach ($ranking as $v) {
                $data['ranking'][] = ['id' => $v->user_id, 'amount' => $v->amount, 'nickname' => $v->nickname];
            }

            $ranking_extend = DB::table('app_event')
                ->where(['id' => 4])
                ->select(['title', 'icon', 'extend', 'action', 'describe'])
                ->get();
            Helper::event($ranking_extend);
            $data['ranking_extend'] = $ranking_extend[0]->extend['data'];
        } else {
            //这里判断开启app 登陆
            if ($this->user) {
                Helper::userLoginLog([
                    'user_id' => $this->user->id,
                    'idaf' => $this->request->header('device') ?? '',
                    'device' => $this->request->header('type') == 'ios' ? 2 : 1,
                    'ip' => $this->request->ip(),
                    'version' => $version,
                ]);
            }
        }
        //购物车
        if ($this->user) {
            $data['count']['car'] = count(cache('car_' . $this->user->id));
        } else {
            $data['count']['car'] = 0;
        }
        //商城
        if ($this->request->header('type') == 'ios' && intval($version) == intval(config('app.global.IosVersion'))) {
            $data['shop'] = true;
        } else {
            $data['shop'] = false;
            //新手红包
            $idaf = $this->request->header('device') ?? '';
            if ($idaf) {
                $idaf_data = DB::table('user_use')->where(['idaf' => $idaf])->first();
                if ($idaf_data->status == 1) {
                    $data['event'] = [
                        'type' => 'frame',
                        'param' => [
                            'name' => 'rookie_red',
                            'url' => 'widget://html/new_win.html',
                            'vScrollBarEnabled' => false,
                            'bounces' => false,
                            'bgColor' => 'rgba(0,0,0,0.65)',
                            'animation' => ['type' => 'none'],
                            'pageParam' => ['script' => './lib/rookie_guide/rookie_red.js']
                        ]
                    ];
                    DB::table('user_use')->where('id', '=', $idaf_data->id)->update(['status' => 2]);
                }
            }
        }
        //紧急公告
        if (isset($params['time'])) {
            $notice_query = DB::table('app_message')
                ->where('create_at', '>', $params['time'])
                ->where('type', '=', 3)
                ->whereNull('delete_at')
                ->orderBy('id', 'desc')
                ->select('title', 'content');
            if ($this->user) {
                $notice_query->where(function ($query) {
                    $query->where('user_id', 'like', "%\"{$this->user->id}\"%");
                    $query->orWhere(function ($query) {
                        $query->whereNull('user_id');
                    });
                });
            }else{
                $notice_query->whereNull('user_id');
            }
            $notice = $notice_query->first();
            if ($notice) {
                $data['notice'] = Helper::notice($notice);
            } else {
                $data['notice'] = null;
            }
        } else {
            $notice_query = DB::table('app_message')
                ->where('type', '=', 3)
                ->whereNull('delete_at')
                ->orderBy('id', 'desc')
                ->select('title', 'content');
            if ($this->user) {
                $notice_query->where(function ($query) {
                    $query->where('user_id', 'like', "%\"{$this->user->id}\"%");
                    $query->orWhere(function ($query) {
                        $query->whereNull('user_id');
                    });
                });
            }else{
                $notice_query->whereNull('user_id');
            }
            $notice = $notice_query->first();
            if ($notice) {
                $data['notice'] = Helper::notice($notice);
            } else {
                $data['notice'] = null;
            }
        }

        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}