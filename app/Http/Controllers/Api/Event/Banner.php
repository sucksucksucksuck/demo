<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/4/21
 * Time: 18:21
 * Description: 红包
 */

namespace App\Http\Controllers\Api\Event;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class Banner extends AbsResponse
{
    public function execute(array $params)
    {
        $data = [];
        $info = DB::table('app_event')
            ->select(
                'id',
                'title',
                'url',
                'icon',
                'is_login',
                'describe',
                'create_at',
                'begin_at',
                'end_at',
                'type',
                'status',
                'extend',
                'sort',
                'content')
            ->get();
            foreach ($info as &$i){
                $data[] = [
                    'image' => $i->icon,
                    'type' => $i->type,
                    'name' => '最新活动',
                    'url' => 'widget://html/headWin.html',
                    'isLogin' => $i->is_login,
                    'pageParam' => [
                        'winType' => 'open_url',
                        'url' => $i->url,
                        'title' => $i->title
                    ],
                    'opaque' => true,
                    'vScrollBarEnabled' => false
                ];
                DB::table('app_event')->where(['id' => $i->id])->update(['extend' => json_encode($data)]);
            }
        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }

}