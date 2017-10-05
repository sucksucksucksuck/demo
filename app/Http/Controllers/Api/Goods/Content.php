<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/3/13
 * Time: 16:19
 */

namespace App\Http\Controllers\Api\Goods;


use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

class Content extends AbsResponse
{

    /**
     * 查询商品内容
     * @param array $params
     * @return array
     */
    public function execute(array $params)
    {
        $goods_id = $params['goods_id'];
        $goods = DB::table('goods')->where(['id' => $goods_id])->first(['id', 'icon', 'image', 'content']);
        $goods->image = json_decode($goods->image, true);
        if(!isset($params['system']) || $params['system'] != 'old'){
            $goods->content = str_replace("\n", '<br>', $goods->content);
        }

        return ['errcode' => 0, 'msg' => '查询成功', 'data' => $goods];
    }
}