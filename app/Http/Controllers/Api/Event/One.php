<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/4/24
 * Time: 15:37
 * Description: 弹窗(取一条最新消息)
 */

namespace App\Http\Controllers\Api\Event;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class One extends AbsResponse
{
    public function execute(array $params)
    {
        $data = [];
        $query = DB::table('app_event');

        //传进来一个type值
        switch ($params['type']){ //1=>banner,2=>最新活动,3=>banner+最新活动,4=>系统公告,5=>系统消息，6=>公告加消息,7=>菜单
            case 1:
                $query->where(['type' => 1])->orWhere(['type' => 3]);
                break;
            case 2:
                $query->where(['type' => 2])->orWhere(['type' => 3]);
                break;
            case 3:
                $query->where(['type' => 3]);
                break;
            case 4:
                $query->where(['type' => 4])->orWhere(['type' => 6]);
                break;
            case 5:
                $query->where(['type' => 5])->orWhere(['type' => 6]);
                break;
            case 6:
                $query->where(['type' => 6]);
                break;
            case 7:
                $query->where(['type' => 7]);
                break;
        }
        $query->orderBy('create_at', 'DESC');
        $data = $query->first();

        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }

}