<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/7/12
 * Time: 18:17
 * Description: 客服中心
 */

namespace App\Http\Controllers\Api\Center;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Facades\DB;

class CustomerService extends AbsResponse
{
    public function execute(array $params)
    {
        $data = DB::table('dictionary')
            ->where('pid', '=', 7)
            ->select('title', 'describe', 'status', 'extend')
            ->get();
        foreach ($data as $d){
            $d->content = json_decode($d->extend, true)['content'];
            $d->content = str_replace('"', "'", $d->content);
            $d->content = str_replace("\r\n", '<br>', $d->content);
            unset($d->extend);
        }

        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}