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
use App\Common\Report;
use App\Jobs\Order;
use App\Common\Helper;

class Goods extends AbsMonitor
{
    public $permission = [
        'execute' => 1,
        'appoint' => 2,
        'cancel' => 3,
        'lotteryType' => 4,
        'operateData' => 5,
        'quickPurchase' => 6
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1301']??0;
    }

    /**
     *  查询所有商品
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $data = DB::table('goods')->whereIn('status', [1, 2])->get(['id', 'title', 'amount']);
        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     *  指定中奖
     * @param Request $request
     * @return array
     */
    public function appoint(Request $request)
    {
        $periods_id = $request['periods_id'];
        $user_id = $request['user_id'];
        $ret = DB::table('periods')->where(['id' => $periods_id])->whereNull('lottery_at')->update(['appoint' => $user_id, 'lottery_type' => 3]);
        if ($ret) {
            DB::table('admin_log')->insert([
                'admin_id' => $this->user->id,
                'log' => "指定中奖periods_id=[$periods_id]user_id=[$user_id]",
                'type' => 20,
                'ip' => substr(implode(',', $request->ips()), 0, 200)
            ]);
            return ['errcode' => 0, 'msg' => 'ok'];
        } else {
            return ['errcode' => 1, 'msg' => '商品已经开奖无法指定'];
        }
    }

    /**
     *  取消指定中奖
     * @param Request $request
     * @return array
     */
    public function cancel(Request $request)
    {
        $periods_id = $request['periods_id'];
        $periods = DB::table('periods')->find($periods_id);
        $goods = DB::table('goods')->find($periods->goods_id);
        $ret = DB::table('periods')->where(['id' => $periods_id])->whereNull('lottery_at')->update(['appoint' => DB::raw('null'), 'lottery_type' => $goods->lottery_type]);
        if ($ret) {
            DB::table('admin_log')->insert([
                'admin_id' => $this->user->id,
                'log' => "取消指定中奖periods_id=[$periods_id]",
                'type' => 20,
                'ip' => substr(implode(',', $request->ips()), 0, 200)
            ]);
            return ['errcode' => 0, 'msg' => 'ok'];
        } else {
            return ['errcode' => 1, 'msg' => '商品已经开奖无法指定'];
        }
    }

    /**
     * 切换中奖模式
     * @param Request $request
     * @return array
     */
    public function lotteryType(Request $request)
    {
        $periods_id = $request->get('id');
        $lottery_type = $request->get('lottery_type');
        $ret = DB::table('periods')->where(['id' => $periods_id])->whereNull('lottery_at')->update(['appoint' => DB::raw('null'), 'lottery_type' => $lottery_type]);
        if ($ret) {
            DB::table('admin_log')->insert([
                'admin_id' => $this->user->id,
                'log' => "切换中奖模式periods_id=[$periods_id]lottery_type=[$lottery_type]",
                'type' => 21,
                'ip' => substr(implode(',', $request->ips()), 0, 200)
            ]);
            return ['errcode' => 0, 'msg' => 'ok'];
        } else {
            return ['errcode' => 1, 'msg' => '商品已经开奖无法指定'];
        }
    }

    /**
     * 运营数据
     * @param Request $request
     * @return array
     */
    public function operateData(Request $request)
    {
        $data[] = Report::ReportSystem(date('Y-m-d'));
        $data[] = DB::table('report_system')->where('date', date('Y-m-d', time() - 3600 * 24))->first()??[];
        if (empty($data[1])) {
            $data[1] = Report::ReportSystem(date('Y-m-d', time() - 3600 * 24));
        }
        $data[] = DB::table('report_system')->where('date', date('Y-m-d', time() - 3600 * 24 * 2))->first()??[];
        if (empty($data[2])) {
            $data[1] = Report::ReportSystem(date('Y-m-d', time() - 3600 * 24 * 2));
        }
        $data = json_decode(json_encode($data), TRUE);
        foreach ($data as $k => $v) {
            $data[$k]['register'] = $v['register_ios'] + $v['register_android'];
        }
        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     * 快速购买
     * @param Request $request
     * @return array
     */
    public function quickPurchase(Request $request)
    {
        $goods_id = $request->input('goods_id', []);
        if (empty($goods_id)) {
            throw new \Exception('请输入商品id！！！', 1001);
        }

        $user_list = DB::table('user')->select('id', 'last_login_ip', 'create_ip','type')->where([['type', 3], ['status', 1]])->limit(20000)->get();
        $user_count = count($user_list);
        if (!$user_count) {
            throw new \Exception('特殊用户不存在！！！', 1001);
        }

        $goods_list = DB::table('goods as g')
            ->join('periods as p', function ($join) {
                $join->on('p.goods_id', '=', 'g.id')
                    ->on('p.periods', '=', 'g.periods');
            })
            ->select('g.id', 'p.total', 'p.buy', 'p.unit_price')
            ->whereIn('g.id', $goods_id)
            ->whereIn('g.status', [1, 2])
            ->limit(50000)
            ->get();

        foreach ($goods_list as $v) {
            $rand = mt_rand(1, $user_count);

            $num_rand = mt_rand(25000, 30000);
            $count = intval($v->total * ($num_rand / 100000));
            if ($count > 5000) $count = 5000;
            if ($count > ($v->total - $v->buy)) $count = $v->total - $v->buy;
            if($count < 1)continue;

            $job = new Order([
                'user_id' => $user_list[$rand - 1]->id,
                'goods_id' => $v->id,
                'unit_price' => $v->unit_price,
                'buy_count' => $count,
                'user_type' => $user_list[$rand - 1]->type,
                //'red_id'=>1,
                'order_no' => '',
                'ip' => Helper::isEmpty($user_list[$rand - 1]->last_login_ip, $user_list[$rand - 1]->create_ip)
            ]);
            $queue = 'order_high_' . str_pad($v->id % Helper::getNumProcs('order'), 2, '0', STR_PAD_LEFT);
            $job->onQueue($queue);
            dispatch($job);
        }

        $log = ['goods_id' => $goods_id, 'msg' => '商品实时监控，快速购买'];
        DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => json_encode($log,JSON_UNESCAPED_UNICODE), 'type' => 13, 'ip' => $request->getClientIp()]);
        return ['errcode' => 0, 'msg' => '加入购买'];

    }
}
