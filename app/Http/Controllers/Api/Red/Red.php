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
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

//用户红包列表
class Red extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    var $default_params = ['page' => 1, 'page_size' => 20];

    public function execute(array $params)
    {
        $now = date('Y-m-d H:i:s');
        $time = date('Y-m-d H:i:s', strtotime('-30 day'));
        $params = array_merge($this->default_params, $params);
        $query = DB::table('user_red')
            ->where(['user_red.user_id' => $this->user->id]);
        if (isset($params['system']) && $params['system'] == 'old') {
            switch ($params['status']) {
                case 1:
                    $query->where(['user_red.status' => 1]);
                    $query->where('user_red.begin_at', '<=', $now);
                    $query->where('user_red.end_at', '>', $now);
                    break;
                case 2:
                    $query->where(function ($q) use ($now) {
                        $q->where('user_red.status', '=', 2)->orWhere('user_red.end_at', '<=', $now)->orWhere('user_red.begin_at', '>', $now);
                    });
                    break;
            }
        } else {
            switch ($params['status']) {
                case 1: //可使用
                    $query->where(['user_red.status' => 1]);
                    $query->where('user_red.begin_at', '<=', $now);
                    $query->where('user_red.end_at', '>', $now);
                    break;
                case 2: //未生效
                    $query->where(['user_red.status' => 1]);
                    $query->where('user_red.begin_at', '>', $now);
                    break;
                case 3: //已使用
                    $query->where('user_red.status', '=', 2);
                    $query->where('user_red.create_at', '>', $time);
                    break;
                case 4: //已过期
                    $query->where(['user_red.status' => 1]);
                    $query->where('user_red.end_at', '<=', $now);
                    $query->where('user_red.create_at', '>', $time);
                    break;
            }
        }
        $info = $query->leftJoin('red', 'red.id', '=', 'user_red.red_id')
            // ->where('begin_at', '<', date('Y-m-d H:i:s'))
            ->select(
                'user_red.amount',
                'user_red.title',
                'user_red.id',
                'user_red.begin_at',
                'user_red.status',
                'user_red.end_at',
                'user_red.use_at',
                'red.use_amount')
            ->forPage($params['page'], $params['page_size'])
            ->get();
        if ($info instanceof Collection) {
            foreach ($info as &$r) {
                $r->valid = strtotime($r->begin_at) > time() ? 1 : 0;
            }
        }
        return ['errcode' => 0, 'msg' => '', 'data' => $info];
    }

}