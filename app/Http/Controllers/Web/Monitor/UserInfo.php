<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/11
 * Time: 10:39
 */

namespace App\Http\Controllers\Web\Monitor;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserInfo extends AbsMonitor
{
    public $permission = [
        'execute' => 1,
        'userOrder' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1303']??0;
    }

    /**
     * 用户信息
     * @param Request $request
     */
    public function execute(Request $request)
    {
        $user_id = $request->get('user_id');
        if (!$user_id) return ['errcode' => 1001, 'msg' => '请输入用户id！！！'];

        $data['user_info'] = DB::table('user')->select('id', 'nickname', 'residual_amount', 'winning_amount', 'recharge_amount','exchange_amount')->where('id', $user_id)->first();
        $data['user_info']->consumer_amount = $data['user_info']->recharge_amount + $data['user_info']->exchange_amount - $data['user_info']->residual_amount;
        if($data['user_info']->consumer_amount) {
            $data['user_info']->probability = (float)number_format(abs($data['user_info']->winning_amount / $data['user_info']->consumer_amount)*100,2,'.','');
        }else if($data['user_info']->winning_amount){
            $data['user_info']->probability = 100;
        }else{
            $data['user_info']->probability = 0;
        }

        for ($i = 0; $i < 7; $i++) {
            $begin = date('Y-m-d', time() - 3600 * 24 * $i);
            if ($i == 0) {
                $end = date('Y-m-d', time() - 3600 * 24 * ($i - 1));
                $data['user_data']['winning_amount'][] = DB::table('periods')
                    ->where('lottery_show_at', '>=', $begin)
                    ->where('lottery_show_at', '<', $end)
                    ->where([['status', '>=', 3], ['user_id', $user_id]])
                    ->whereIn('user_type',[0,4])
                    ->sum('amount')??0;

                $data['user_data']['consumer_amount'][] = -DB::table('user_amount_log')
                    ->leftJoin('user', 'user.id', '=', 'user_amount_log.user_id')
                    ->where('user_amount_log.create_at', '>=', $begin)
                    ->where('user_amount_log.create_at', '<', $end)
                    ->where(['user_amount_log.type' => 1])
                    ->where([['user_id', $user_id]])
                    ->whereIn('user.type',[0,4])
                    ->sum('amount')??0;
            }else{
                $data['user_data']['winning_amount'][] = DB::table('report_user_amount_log')
                    ->where('date', $begin)
                    ->where('user_id', $user_id)
                    ->value('winning_amount')??0;

                $data['user_data']['consumer_amount'][] = DB::table('report_user_amount_log')
                    ->where('date', $begin)
                    ->where('user_id', $user_id)
                    ->value('consumer_amount')??0;
            }
            if($data['user_data']['consumer_amount'][$i]) {
                $data['user_data']['probability'][] = (float)number_format(abs($data['user_data']['winning_amount'][$i] / $data['user_data']['consumer_amount'][$i])*100,2,'.','');
            }else if($data['user_data']['winning_amount'][$i]){
                $data['user_data']['probability'][] = 100;
            }else{
                $data['user_data']['probability'][] = 0;
            }
        }
        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     * 用户订单列表
     * @param Request $request
     */
    public function userOrder(Request $request)
    {
        $user_id = $request->get('user_id');
        if (!$user_id) return ['errcode' => 1001, 'msg' => '请输入用户id！！！'];
        $query = DB::table('order as o');
        $total = $query->leftJoin('periods as p', 'p.id', '=', 'o.periods_id')
            ->leftJoin('goods as g', 'g.id', '=', 'o.goods_id')
            ->select('o.id', 'o.goods_id', 'o.num', 'o.create_at','o.winning',
                'p.periods', 'p.total', 'p.status', 'p.lottery_show_at', 'p.order_status','p.contact_name','p.contact_id','p.contact_phone',
                'g.title')
            ->where('o.user_id', $user_id)
            ->count();

        $list = $query->orderBy('o.id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }
}
