<?php

namespace App\Http\Controllers\Web\Setting;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Common\Helper;

/**
 *  客服中心
 */
class CustomerServiceSetting extends AbsSetting
{
    public function execute(Request $request)
    {
        $data = DB::table('dictionary')
            ->where('pid', '=', 7)
            ->select('id', 'describe', 'status', 'extend')
            ->get();
        foreach ($data as $d){
            $d->content = json_decode($d->extend)->content;
            unset($d->extend);
        }
        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }

    /**
     * 更新status
     * @param Request $request
     * @return array
     */
    public function updateStatus(Request $request)
    {
        $status = $request->input('status');
        $id = $request->input('id');
        DB::table('dictionary')
            ->where('id', '=', $id)
            ->update(['status' => $status]);
        return ['errcode' => 0, 'msg' => 'ok' , 'data' => []];
    }

    /**
     * 更新content
     * @param Request $request type 1=>ios 2=>android
     * @return array
     */
    public function updateVersion(Request $request)
    {
        $id = $request->input('id');
        $content = $request->input('content');
        $content = json_encode(['content' => $content]);
        DB::table('dictionary')
            ->where('id', '=', $id)
            ->update(['extend' => $content]);

        return ['errcode' => 0, 'msg' => 'ok', 'data' => []];
    }

}
