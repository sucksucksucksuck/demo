<?php

namespace App\Http\Controllers\Api\Share;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/9
 * Time: 17:31
 */
//晒单列表
class ShareList extends AbsResponse
{
    var $default_params = ['page' => 1, 'page_size' => 10];
    public function execute(array $params)
    {
        $params = array_merge($this->default_params, $params);
        $query = DB::table('periods as p')
            ->whereNotNull('p.share_id')
            ->leftJoin('share as s', 'p.share_id', '=', 's.id')
            ->leftJoin('user as u', 'p.user_id', '=', 'u.id')
            ->leftJoin('goods as g', 'p.goods_id', '=', 'g.id')
            ->where(['s.status' => 2])
            ->whereNull('s.delete_at')
            ->select('s.content',
                's.create_at',
                's.image',
                'p.periods',
                'p.goods_id',
                'p.user_id',
                'p.id',
                'g.title',
                'g.icon as goods_icon',
                'u.icon',
                'u.nickname'
            )->orderBy('s.create_at', 'desc')
            ->forPage($params['page'], $params['page_size']);
        if(isset($params['user_id']) && $params['user_id'] > 0){
            $query->where('p.user_id', '=', $params['user_id']);
        }
        if(isset($params['goods_id']) && $params['goods_id'] > 0){
            $query->where('p.goods_id', '=', $params['goods_id']);
        }
        $data = $query->forPage($params['page'], $params['page_size'])
            ->get();

        foreach ($data as $d){
            $d->icon = Helper::getAvatar($d->icon);
            $d->image = json_decode($d->image);
        }
        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}