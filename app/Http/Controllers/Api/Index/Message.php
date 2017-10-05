<?php

namespace App\Http\Controllers\Api\Index;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/6
 * Time: 16:05
 */
//消息列表
class Message extends AbsResponse
{
    public function execute(array $params)
    {
        $data = [];
        if(isset($params['pg_msg_time'])){
            $data['update_pg_msg'] = DB::table('app_message')
                ->whereNull('delete_at')
                ->where('create_at', '>', $params['pg_msg_time'])
                ->whereIn('type', [2, 3, 4])
                ->get();
            if($data['update_pg_msg'] && $data['update_pg_msg']->count()){
                $data['update_pg_msg'] = true;
            }else{
                $data['update_pg_msg'] = false;
            }
        }

        $pg_data = (new PgMessage())->execute(['user' => $this->user])['data'];
        if($pg_data){
            $data['pg_msg'] = array_values(json_decode(json_encode($pg_data)))[0];
        }
        unset($data['pg_msg']->describe);
        unset($data['pg_msg']->status);
        unset($data['pg_msg']->type);
        unset($data['pg_msg']->end_at);
        unset($data['pg_msg']->update_at);
        unset($data['pg_msg']->action);
        unset($data['pg_msg']->icon);
        unset($data['pg_msg']->extend);
        unset($data['pg_msg']->visible);
        unset($data['pg_msg']->url);
        unset($data['pg_msg']->is_login);
        unset($data['pg_msg']->id);

        if($this->user){
            $query = DB::table('user_message')
                ->select('title',
                'create_at')
                ->where(['user_id' => $this->user->id])
                ->orderBy('create_at', 'desc');
            $data['user_msg'] = $query->first();
            if(isset($params['pg_msg_time'])){
                $query2 = $query->where('create_at', '>', $params['user_msg_time']);
                $data2 = $query2->get();
                if($data2 && $data2->count()){
                    $data['update_user_msg'] = true;
                }else{
                    $data['update_user_msg'] = false;
                }
            }else{
                $data['update_user_msg'] = false;
            }
        }else{
            $data['update_user_msg'] = false;
            $data['user_msg'] = [];
        }

        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}