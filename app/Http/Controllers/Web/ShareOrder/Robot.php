<?php

namespace App\Http\Controllers\Web\ShareOrder;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 *  机器人订单
 */
class Robot extends AbsOrder
{
    public $permission = [
        'execute' => 1,
        'shareEdit' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['401']??0;
    }

    /**
     *  商品期数列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $order_id_arr = [];
        $order_list2 = [];

        $user_id = $this->forArr($request->input('user_id'));
        $id = $this->forArr($request->input('id'));
        $order_id = $this->forArr($request->input('order_id'));
        $goods_id = $this->forArr($request->input('goods_id'));
        $order_status = intval($request->input('order_status'));
        $category_id = intval($request->input('category_id'));
        $title = trim($request->input('title'));
        $min_price = trim($request->input('min_price'));
        $max_price = trim($request->input('max_price'));
        $sort_field = $request->input('sort_field', 'p.lottery_show_at');
        $sort = $request->input('sort', 'desc');
        $periods = $request->input('periods');
        $order_type = $request->input('order_type');
        $share = $request->input('share');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');

        $query = DB::table('periods as p')
            ->leftJoin('goods as g', 'g.id', '=', 'p.goods_id')
            ->leftJoin('user as u', 'u.id', '=', 'p.user_id');

        if ($user_id)
            $query->whereIn('p.user_id', $user_id);
        if ($id)
            $query->whereIn('p.id', $id);
        if ($order_id)
            $query->whereIn('p.order_id', $order_id);
        if ($goods_id)
            $query->whereIn('p.goods_id', $goods_id);
        if ($order_status)
            $query->where('p.order_status', $order_status);
        if ($category_id)
            $query->where('g.category_id', $category_id);
        if ($title)
            $query->where('g.title', 'like', "%" . $title . "%");
        if ($min_price)
            $query->where('p.amount', '>=', $min_price);
        if ($max_price)
            $query->where('p.amount', '<=', $max_price);
        if ($periods)
            $query->where('p.periods', intval($periods));
        if ($order_type)
            $query->where('p.order_type', $order_type);
        if ($share == 1) {
            $query->whereNotNull('p.share_id');
        } else if ($share == 2) {
            $query->whereNull('p.share_id');
        }
        if ($start_time)
            $query->where('p.lottery_show_at', '>=', trim($start_time) . ' 00:00:00');
        if ($end_time)
            $query->where('p.lottery_show_at', '<=', trim($end_time) . ' 23:59:59');

        $query->where([['p.status', 3], ['p.user_type', 1]]);

        $total = $query->count();
        // id=商品期数订单id，buy=购买数量，periods=期数，unit_price=商品单价，status = ( 1=>未开奖,2=>等待开奖,3=>已开奖，4=>已关闭 )，order_status=(1=>待确认,2=>已确认填写收货地址,3=>已发货,4=>已签收(完成))，amount=商品实际金额
        $list = $query
            ->select('p.id', 'p.order_id', 'p.goods_id', 'p.user_id', 'p.lottery_show_at', 'p.unit_price', 'p.lucky_code', 'p.buy', 'p.status', 'p.periods', 'p.order_status', 'p.amount', 'p.share_id', 'p.deliver_at', 'p.real_amount',
                'g.title', 'g.icon', 'g.total',
                'u.nickname'
            )
            ->orderBy($sort_field, $sort)
            ->forPage($this->page, $this->page_size)
            ->get();

        //获取关联数据
        foreach ($list as $k => $v) {
            $order_id_arr[] = $v->order_id;
        }
        $order_list = DB::table('order')->select('id', 'ip', 'create_at as o_create_at', 'num')->whereIn('id', $order_id_arr)->get();
        foreach ($order_list as $k => $v) {
            $order_list2[$v->id] = $v;
        }
        foreach ($list as $k => $v) {
            $list[$k]->ip = $order_list2[$v->order_id]->ip??'';
            $list[$k]->o_create_at = $order_list2[$v->order_id]->o_create_at??'';
            $list[$k]->num = $order_list2[$v->order_id]->num??0;
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    /**
     * 创建机器人晒单
     * @param Request $request
     */
    public function createShare(Request $request)
    {
        $periods_id = intval($request->input('periods_id'));
        $content = $request->input('content','');

        if (!$periods_id) {
            throw new \Exception('请输入对应期数id！！！', 1001);
        }

        $periods_info = DB::table('periods')->select('share_id', 'goods_id')->where([['id', $periods_id], ['user_type', 1], ['status','>=', 3]])->whereNull('share_id')->first();
        if (!$periods_info) {
            throw new \Exception('期数订单不存在！！！', 1002);
        }

        $data['content'] = $content;
        $data['periods_id'] = $periods_id;
        $data['goods_id'] = $periods_info->goods_id;

        //保存图片
        $path = array();
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            foreach ($file as $k => $v) {
                if ($v->getSize() > 2097152) {
                    throw new \Exception("第" . ($k + 1) . "张图片超过了2M", 2101);
                }
                if (!in_array($v->getMimeType(), array('image/jpeg', 'image/gif', 'image/jpg', 'image/png', 'image/bmp'))) {
                    throw new \Exception('图片类型不正确！！！', 2102);
                }
            }
            foreach ($file as $k => $v) {
                if ($v->isValid()) {
                    $client_name = $v->getClientOriginalName();
                    $entension = $v->getClientOriginalExtension();
                    $new_name = md5(date("Y-m-d H:i:s") . $client_name) . "." . $entension;

                    $img_path = 'upload/order_share/' . date('Y_m') . '/' . date('d') . '/';
                    $url_path = asset($img_path . $new_name);
                    $file_path = public_path($img_path);

                    $v->move($file_path, $new_name);
                    $path[] = $url_path;
                }
            }
        }

        $data['image'] = json_encode($path);
        DB::beginTransaction();
        $re = DB::table('share')->insertGetId($data);
        $re2 = DB::table('periods')->where('id', $periods_id)->update(['share_id' => $re]);

        if ($re && $re2) {
            DB::commit();
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$periods_id}，创建机器人晒单", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '晒单成功！', 'data' => $re];
        } else {
            DB::rollBack();
            return ['errcode' => 1010, 'msg' => '晒单失败！'];
        }
    }

}
