<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/7/12
 * Time: 9:54
 * Description: 兑换红包
 */

namespace App\Http\Controllers\Api\Red;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use App\Common\Prize;

//兑换红包
class Exchange extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    public function execute(array $params)
    {
        if ($params['code'] == config('app.global.RedExchangeCode')) {
            if ($this->user->type == 4) {
                return ['errcode' => 100, 'msg' => '验证错误'];
            }
        }
        return ['errcode' => 501, 'msg' => '兑换失败', 'data' => []];
    }

}