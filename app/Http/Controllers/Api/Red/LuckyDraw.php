<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/4/12
 * Time: 10:02
 * Description: 红包
 */

namespace App\Http\Controllers\Api\Red;

use App\Http\Controllers\Api\AbsResponse;
use App\Http\Controllers\Event\Common;
use App\Common\Prize;
use Illuminate\Support\Facades\DB;

//幸运抽奖（红包）
class LuckyDraw extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    public function execute(array $params)
    {
        $result = Prize::red($this->user->id, $params['red_id']);
        return ['errcode' => 0, 'msg' =>$result['msg'], 'data' =>$result['data']];
    }

}