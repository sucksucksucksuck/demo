<?php

namespace App\Http\Controllers\Api\Share;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/9
 * Time: 17:49
 */
//晒单详情
class ShareDetail extends AbsResponse
{
    public function execute(array $params)
    {
        $query = DB::table('periods as p')
            ->leftJoin('share as s', 'p.share_id', '=', 's.id')
            ->leftJoin('user as u', 'p.user_id', '=', 'u.id')
            ->leftJoin('goods as g', 'p.goods_id', '=', 'g.id')
            ->leftJoin('order as o', 'p.order_id', '=', 'o.id')
            ->select('p.id',
                's.content',
                's.create_at',
                's.image',
                'o.num',
                'p.periods',
                'p.lottery_show_at',
                'p.lucky_code',
                'g.title',
                'u.id as user_id',
                'u.icon',
                'u.nickname')
            ->where(['p.id' => $params['periods_id'], 's.status' => 2]);

            $data = $query->first();
            $data->image = json_decode($data->image);
            $data->icon = Helper::getAvatar($data->icon);
        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}