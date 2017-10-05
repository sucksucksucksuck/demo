<?php

namespace App\Http\Controllers\Api\Share;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;
use App\Common\Helper;
use Illuminate\Support\Facades\Log;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/20
 * Time: 15:55
 */
//晒单
class Share extends AbsResponse
{
    public function execute(array $params)
    {
        if(isset($params['system']) && $params['system'] == 'old'){
            $periods = DB::table('periods')->where(['id' => $params['periods_id']])->select('goods_id')->first();
            $image = [];
            if(isset($params['images']) && count($params['images']) > 0){
                foreach ($params['images'] as $k => $i){
                    $image[$k] = $i;
                }
            }
            $insert_info = [
                'content' => $params['content'],
                'create_at' => date('Y-m-d H:i:s'),
                'goods_id' => $periods->goods_id,
                'periods_id' => $params['periods_id'],
                'image' => json_encode($image)
            ];
            $id  = DB::table('share')->insertGetId($insert_info);
            $share = DB::table('periods')->where([ 'id' => $params['periods_id']])->select('share_id')->first();
            if(!$share->share_id){
                DB::table('periods')->where([ 'id' => $params['periods_id']])->update(['share_id' => $id]);
                return ['errcode' => 0, 'msg' => '', 'data' => $image];
            }else{
                throw new \Exception('已晒单,请勿重复晒单', 500);
            }
        }else{
            $images = $this->file ?? [];
            $image = [];
            if($images){
                foreach ($images as $k => $v){
                    $img = md5($v);
                    $save_dir = 'image/share'. date('/Y_m/d/');
                    $image[$k] = Helper::Base64ToImg("$v", $save_dir , $img);
                }
            }
            if(!$params['content'] && !$image){
                throw new \Exception('晒单不能为空', 500);
            }
            $insert_info = [
                'content' => $params['content'],
                'create_at' => date('Y-m-d H:i:s'),
                'goods_id' => $params['goods_id'],
                'periods_id' => $params['periods_id'],
                'image' => json_encode($image)
            ];

            $id  = DB::table('share')->insertGetId($insert_info);
            $share = DB::table('periods')->where([ 'id' => $params['periods_id']])->select('share_id')->first();
            if(!$share->share_id){
                DB::table('periods')->where([ 'id' => $params['periods_id']])->update(['share_id' => $id]);
            }else{
                throw new \Exception('已晒单,请勿重复晒单', 500);
            }
            return ['errcode' => 0, 'msg' => '', 'data' => []];
        }

    }
}