<?php

namespace App\Http\Controllers\Web\ShareOrder;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;

/**
 *  晒单
 */
class Share extends AbsOrder
{
    public $permission = [
        'execute' => 1,
        'shareInfo' => 1,
        'edit' => 2,
        'status' => 3,
        'del' => 4
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['402']??0;
    }

    /**
     *  晒单
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $order_id_arr = [];
        $order_list2 = [];

        $user_type = $request->input('user_type');
        $periods_id = $this->forArr($request->input('periods_id'));
        $order_id = $this->forArr($request->input('order_id'));
        $goods_id = $this->forArr($request->input('goods_id'));
        $category_id = intval($request->input('category_id'));
        $title = trim($request->input('title'));
        $sort_field = $request->input('sort_field', 's.create_at');
        $sort = $request->input('sort', 'desc');
        $periods = $request->input('periods');
        $status = $request->input('status');
        $content = $request->input('content');

        $query = DB::table('share as s')
            ->leftJoin('periods as p', 'p.id', '=', 's.periods_id')
            ->leftJoin('goods as g', 'g.id', '=', 'p.goods_id')
            ->leftJoin('user as u', 'u.id', '=', 'p.user_id');

        if (is_numeric($user_type))
            $query->where('u.type', $user_type);
        if ($periods_id)
            $query->whereIn('s.periods_id', $periods_id);
        if ($order_id)
            $query->whereIn('p.order_id', $order_id);
        if ($goods_id)
            $query->whereIn('p.goods_id', $goods_id);
        if ($category_id)
            $query->where('g.category_id', $category_id);
        if ($title)
            $query->where('g.title', 'like', "%" . $title . "%");
        if ($periods)
            $query->where('p.periods', intval($periods));
        if ($status)
            $query->where('s.status', $status);
        if ($content)
            $query->where('s.content', 'like', "%" . $content . "%");

        $query->where([['p.status', 3]])->whereNull('s.delete_at');

        $total = $query->count();
        // id=商品期数订单id，buy=购买数量，periods=期数，unit_price=商品单价，status = ( 1=>未开奖,2=>等待开奖,3=>已开奖，4=>已关闭 )，order_status=(1=>待确认,2=>已确认填写收货地址,3=>已发货,4=>已签收(完成))，amount=商品实际金额
        $list = $query
            ->select('s.id', 's.content', 's.periods_id', 's.status','s.delete_at','s.create_at',
                'p.order_id', 'p.goods_id', 'p.user_id', 'p.lottery_show_at', 'p.unit_price', 'p.buy', 'p.periods', 'p.amount', 'p.share_id', 'p.deliver_at', 'p.real_amount',
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
     * 获取晒单分享信息
     * @param Request $request
     */
    public function shareInfo(Request $request)
    {
        $id = $request->input('id');

        if (!$id) return ['errcode' => 1001, 'msg' => '请输入期数id！！！'];

        $data = DB::table('share as s')
            ->leftJoin('periods as p', 'p.id', '=', 's.periods_id')
            ->leftJoin('goods as g', 'g.id', '=', 'p.goods_id')
            ->select('s.id', 's.content', 's.periods_id', 's.image', 's.create_at as s_create_at',
                'p.goods_id', 'p.order_id', 'p.user_id', 'p.lottery_show_at', 'p.unit_price', 'p.lucky_code', 'p.buy', 'p.status', 'p.periods', 'p.order_status', 'p.amount', 'p.share_id', 'p.deliver_at', 'p.real_amount',
                'g.title', 'g.icon'
            )
            ->where('s.id', $id)
            ->first();

        $order = DB::table('order')->select('id', 'ip', 'create_at as o_create_at', 'num')->where('id', $data->order_id)->first();
        if ($order) {
            $data->ip = $order->ip??'';
            $data->o_create_at = $order->o_create_at??'';
            $data->num = $order->num??0;
        }
        $data->image = json_decode($data->image??'[]', true);

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     *  编辑晒单
     * @param Request $request
     * @return array
     */
    public function edit(Request $request)
    {
        $periods_id = intval($request->input('periods_id'));
        $content = $request->input('content','');
        $img_del = $this->forArr($request->input('img_del'));

        if (!$periods_id) {
            throw new \Exception('请输入对应期数id！！！', 1001);
        }

        $periods_info = DB::table('periods')->select('share_id', 'goods_id')->where([['id', $periods_id], ['status','>=', 3]])->first();
        if (!$periods_info) {
            throw new \Exception('期数订单不存在！！！', 1002);
        }

        $data['content'] = $content;

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

        $query = DB::table('share');
        $re2 = true;
        $info = $query->select('content', 'image')->where('id', $periods_info->share_id)->first();
        if ($periods_info->share_id && $info) {
            $image_arr = json_decode($info->image, true);
            if (empty($image_arr)) $image_arr = array();
            $image_arr = array_merge(array_values($image_arr), $path);
            foreach ($img_del as $k => $v) {
                if (isset($image_arr[$v])) {
                    $tempu = parse_url($image_arr[$v]);
                    @unlink($_SERVER['DOCUMENT_ROOT'] . $tempu['path']);
                    unset($image_arr[$v]);
                }
            }
            $image_arr = array_values($image_arr);
            $data['image'] = json_encode($image_arr);
            $re = $query->where('id', $periods_info->share_id)->update($data);
        } else {
            $data['periods_id'] = $periods_id;
            $data['goods_id'] = $periods_info->goods_id;
            $data['image'] = json_encode($path);
            $re = $query->insertGetId($data);
            $re2 = DB::table('periods')->where('id', $periods_id)->update(['share_id' => $re]);
        }
        if ($re && $re2) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "periods_id：{$periods_id}，机器人晒单编辑", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '晒单成功！', 'data' => $re];
        } else {
            return ['errcode' => 1010, 'msg' => '晒单失败！'];
        }
    }

    /**
     * 晒单状态
     * @param Request $request
     * @return array
     */
    public function status(Request $request)
    {
        $id = $request->input('id');
        $status = $request->input('status');

        if (!$id) return ['errcode' => 1001, 'msg' => '请输入id！！！'];

        $re = DB::table('share')->where('id', $id)->update(['status' => $status]);
        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，修改晒单状态", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功'];
        } else {
            return ['errcode' => 1002, 'msg' => '修改失败'];
        }
    }

    /**
     * 删除晒单
     * @param Request $request
     * @return array
     */
    public function del(Request $request)
    {
        $id = $this->forArr($request->input('id'));

        if (!$id) return ['errcode' => 1001, 'msg' => '请输入id！！！'];

        $re = DB::table('share')->whereIn('id', $id)->update(['delete_at' => date('Y-m-d H:i:s')]);

        if ($re) {
            $id = json_encode($id);
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，删除晒单", 'type' => 4, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功'];
        } else {
            return ['errcode' => 1002, 'msg' => '修改失败'];
        }
    }
}
