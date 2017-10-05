<?php

namespace App\Http\Controllers\Api\Auth;

use App\Common\Helper;
use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/2
 * Time: 13:06
 */
class BindPhone extends AbsResponse
{

    /**
     * 绑定手机号
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function execute(array $params)
    {
        $phone = $params['phone'] ?? '';

        if($phone){
            //更新anyou数据库vip表手机号
            DB::connection('anyou')->table('vip')->where(['uid' => $this->user->id])->update(['photo' => $phone]);
            //更新
            DB::table('user')->where(['id' => $this->user->id])->update(['phone' => $phone]);
            $this->user->phone = $phone;
        }
        return ['errcode' => 0, 'msg' => '更新成功', 'data' => $this->user];
    }
}