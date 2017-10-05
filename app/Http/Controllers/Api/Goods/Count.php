<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/7/26
 * Time: 16:21
 */

namespace App\Http\Controllers\Api\Goods;


use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

class Count extends AbsResponse
{
    /**
     * 快捷购买数量按钮
     * @param array $params
     * @return array
     */
    public function execute(array $params)
    {
        $data = DB::table('goods')
            ->where(['id' => $params['goods_id']])
            ->select('purchase_volume')
            ->first();

        if($data && $data->purchase_volume){
            $count = json_decode($data->purchase_volume, true);
        }else{
            $count = ["50", "100", "200"];
        }
        return ['errcode' => 0, 'msg' => '', 'data' => $count];
    }
}