<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/19
 * Time: 10:09
 */

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

//默认收货地址
class Address extends AbsResponse
{
    function init()
    {
        if (!$this->user) {
            throw new \Exception('用户未登陆', 403);
        }
    }

    var $default_params = ['page' => 1, 'page_size' => 1000];
    public function execute(array $params)
    {
        $data = [];
        $data['address'] = DB::table('user_deliver')
            ->where(['user_id' => $this->user->id, 'type' => 'matter', 'status' => 2])
            ->orderBy('status', 'desc')
            ->first();
        $params = array_merge($this->default_params, $params);
        $query = DB::table('user_red')
            ->where(['user_red.user_id' => $this->user->id]);
        $now = date('Y-m-d H:i:s');
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
        $data['red'] = $query->leftJoin('red', 'red.id', '=', 'user_red.red_id')
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
        if ($data['red'] instanceof Collection) {
            foreach ($data['red'] as &$r) {
                $r->valid = strtotime($r->begin_at) > time() ? 1 : 0;
            }
        }

        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }
}