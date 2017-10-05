<?php

namespace App\Http\Controllers\Api\Index;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/5
 * Time: 10:05
 */
//消息列表(盘古云购)
class PgMessage extends AbsResponse
{
    public function execute(array $params)
    {
        $uid = 0;
        $user_type = 0;
        if (!$this->user) {
            $this->user = $params['user'] ?? '';
            if ($this->user) {
                $uid = $this->user->id;
                $user_type = $this->user->type;
            }
        } else {
            $uid = $this->user->id;
            $user_type = $this->user->type;
        }
        $page = $params['page'] ?? 1;
        $page_size = 20;
        //type  1=>推送消息,[2,3]=>站内消息[2:普通,3:系统公告],4=>盘古消息
        $data = DB::table('app_message')
            ->whereNull('delete_at')
            ->whereIn('type', [2, 3, 4])
            ->select('id',
                'title',
                'content',
                'icon',
                'type',
                'visible',
                'create_at',
                'event_id',
                'user_id'
            )
            ->orderBy('create_at', 'desc')
            ->forPage($page, $page_size)
            ->get();
        foreach ($data as $key => $value) {
            if ($value->type == 4 && $value->event_id) {
                $value->url = url('event/' . $value->event_id);
            }else{
                $value->url = '';
            }
            $value->content = str_replace("\n", '<br>', $value->content);
            $value->describe = $value->content;
            $value->data = Helper::pg_message($value);
            if($value->type == 4){
                //客服或者测试
                if ($value->visible == 2 && ($user_type != 2 && $user_type != 4)) {
                    unset($data[$key]);
                    continue;
                }
                //测试
                if ($value->visible == 3 && $user_type != 2) {
                    unset($data[$key]);
                    continue;
                }
            }else{
                $user_ids = json_decode($value->user_id, true);
                if (is_array($user_ids) && count($user_ids) > 0) {
                    if (!in_array($uid, $user_ids)) {
                        unset($data[$key]);
                    }
                }
            }
        };

        return ['errcode' => 0, 'msg' => '', 'data' => array_values(json_decode(json_encode($data), true))];
    }
}