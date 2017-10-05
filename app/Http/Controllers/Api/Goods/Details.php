<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/3/13
 * Time: 10:06
 */

namespace App\Http\Controllers\Api\Goods;


use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use App\Http\Controllers\Api\Share\ShareList;
use Illuminate\Support\Facades\DB;

class Details extends AbsResponse
{
    /**
     * 查询商品详情
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $goods_id = $params['goods_id'];
        $periods = $params['periods'] ?? false;// isset($params['periods']) ? $params['periods'] : false;
        $goods = DB::table('goods')->where(['id' => $goods_id])->first(['id', 'title', 'periods', 'image', 'tag']);
        if(!$goods){
            throw new \Exception('该商品不存在', 500);
        }
        $active = $params['active']??-1;
        if (!$periods) {
            $periods = $goods->periods;
        }
        $periods = DB::table('periods')->where(['goods_id' => $goods_id, 'periods' => $periods])->first();
        $goods->unit_price = $periods->unit_price;
        $goods->now_periods = $goods->periods;
        $goods->periods = $periods->periods;
        $goods->total = $periods->total;
        $goods->buy = $periods->buy;
        $goods->status = $periods->status;
        $goods->tag = json_decode($goods->tag, true);
        $winning = [];
//        if ($periods->status == 3 && strtotime($periods->lottery_show_at) < time()) {
        $lottery_status = Helper::getLotteryStatus($periods->status, $periods->lottery_show_at);
        if($lottery_status == 3){
            $goods->status = 3;
            $user = DB::table('user')->find($periods->user_id);
            $order = DB::table('order')->find($periods->order_id);
            $winning['nickname'] = $user->nickname;
            $winning['status'] = 3;
            $winning['lucky_code'] = $periods->lucky_code;
            $winning['icon'] = Helper::getAvatar($user->icon);
            $winning['lottery_show_at'] = $periods->lottery_show_at;
            $winning['count'] = DB::table('order')->where(['user_id' => $user->id, 'periods' => $periods->periods, 'goods_id' => $goods_id])->sum('num');
            $winning['ip'] = $order->ip . ' ' . Helper::ipToAddress($order->ip);
            $winning['user_id'] = $user->id;
//        } else if ($periods->status == 2 || $periods->status == 3) {
        } else if ($lottery_status == 2) {
            $goods->status = 2;
            $winning['status'] = 2;
            $winning['lottery_show_at'] = $periods->lottery_show_at;
        }
        $goods->image = json_decode($goods->image, true);
        $buy_info = [];
        if ($this->user) {
            $order = DB::table('order')->where(['user_id' => $this->user->id, 'goods_id' => $goods_id, 'periods' => $periods->periods])->get();
            if ($order->count() > 0) {
                $buy_info['user_id'] = $this->user->id;
                $buy_info['goods_id'] = $goods_id;
                $buy_info['periods'] = $periods->periods;
                $buy_info['periods_id'] = $periods->id;
                $lucky_code = DB::table('lucky_code')->where(['user_id' => $this->user->id, 'periods_id' => $periods->id])->first();
                if ($lucky_code) {
                    $buy_info['lucky_code'] = $lucky_code->lucky_code;
                }
                $count = 0;
                foreach ($order as $o) {
                    $count += $o->num;
                }
                $buy_info['count'] = $count;
            }
        }
        $data = ['goods' => $goods, 'buy_info' => $buy_info, 'winning' => $winning];
        if(!isset($params['system']) || $params['system'] != 'old'){
            switch (intval($active)) {
                case  0:
                    $data['data_join'] = (new Record())->execute([
                        'goods_id' => $periods->goods_id,
                        'periods' => $periods->periods,
                        'page' => 1,
                    ])['data'];
                    break;
                case  1:
                    $data['data_share'] = (new ShareList())->execute([
                        'goods_id' => $periods->goods_id,
                        'page' => 1,
                    ])['data'];
                    break;
                case  2:
                    $data['data_record'] = (new \App\Http\Controllers\Api\Periods\Search())->execute([
                        'goods_id' => $periods->goods_id,
                        'page' => 1,
                    ])['data'];
                    break;
            }
        }
        return ['errcode' => 0, 'msg' => '查询成功', 'data' => $data];
    }
}