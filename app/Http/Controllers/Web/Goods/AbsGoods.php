<?php

namespace App\Http\Controllers\Web\Goods;

use App\Http\Controllers\Web\AbsResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

abstract class AbsGoods extends AbsResponse
{
    /**
     *  获取商品分类
     */
    public function category(Request $request)
    {
        $id = $request->input('id',1);
        $categoryList = DB::table('dictionary')->select('index as id', 'title')->where('pid', $id)->get();
        return ['errcode' => 0, 'msg' => 'ok', 'data' => $categoryList];
    }

}
