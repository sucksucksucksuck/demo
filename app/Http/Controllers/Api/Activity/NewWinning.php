<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/7/10
 * Time: 16:21
 * Description: 最新中奖
 */

namespace App\Http\Controllers\Api\Activity;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

class NewWinning extends AbsResponse
{
    public function execute(array $params)
    {
        $data = [];
        $periods_id = $params['periods_id'] ?? false;

        $periods = DB::table('periods')->where(['id' => $periods_id])->select()->first();

        //判断是否已经开奖
        $lottery_status = Helper::getLotteryStatus($periods->status, $periods->lottery_show_at);
        if($lottery_status == 3){
            $goods = DB::table('goods')->where(['id' => $periods->goods_id])->select('title')->first();
            $data['periods_id'] = $periods->id;
            $data['goods_id'] = $periods->goods_id;
            $data['periods'] = $periods->periods;
            $data['user_id'] = $periods->user_id;
            $data['title'] = $goods->title;
        }else{
            $data = [];
        }
        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }

}