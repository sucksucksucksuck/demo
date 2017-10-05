<?php

namespace App\Http\Controllers\Web\Goods;

use App\Common\Helper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class Search extends AbsGoods
{
    public $permission = [
        'execute' => 1,
        'excel' => 2,
        'del' => 3,
        'downShelves' => 4,
        'forceDownShelves' => 5,
        'upShelves' => 6
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['100']??0;
    }

    /**
     *  商品列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $title = $request->input('title');
        $id = $this->forArr($request->input('id'));
        $status = $request->input('status', 1);
        $category_id = $request->input('category_id');
        $sort_field = $request->input('sort_field', 'g.id');
        $sort = $request->input('sort', 'desc');

        $query = DB::table('goods as g')
            ->leftJoin('dictionary as d', function ($join) {
                $join->on('g.category_id', '=', 'd.index')
                    ->on('d.pid', '=', DB::raw(1));
            });

        if ($title)
            $query->where('g.title', 'like', "%" . $title . "%");
        if ($id)
            $query->whereIn('g.id', $id);
        if ($category_id)
            $query->where('g.category_id', $category_id);
        if ($status == 1) {
            $query->whereIn('g.status', [1, 2]);
        } else if ($status == 3) {
            $query->where('g.status', 3);
        }
        $query->whereNull('g.delete_at');

        $total = $query->count();
        //amount=总价，unit_price=单价，total=人数，up_shelf_at=上架时间，down_shelf_at=下架时间，create_at=创建时间，category=商品分类，periods=商品期数
        $list = $query
            ->select('g.id', 'g.title', 'g.amount', 'g.unit_price', 'g.total', 'g.icon', 'g.up_shelf_at', 'g.down_shelf_at', 'g.create_at', 'g.periods',
                'd.title as category'
            )
            ->orderBy($sort_field, $sort)
            ->orderBy('g.id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size, 'status' => $status]]];
    }

    /**
     *  商品 excel 表格
     * @param Request $request
     * @return excel
     */
    public function excel(Request $request)
    {
        Helper::excelUnlock($this);
        try {
            $id = $this->forArr($request->input('id'));
            $status = intval($request->input('status', 1));
            $category_id = intval($request->input('category_id'));
            $sort_field = $request->input('sort_field', 'g.id');
            $sort = $request->input('sort', 'desc');
            $start_time = $request->input('start_time');
            $end_time = $request->input('end_time');

            $query = DB::table('goods as g')
                ->leftJoin('dictionary as d', function ($join) {
                    $join->on('g.category_id', '=', 'd.index')
                        ->on('d.pid', '=', DB::raw(1));
                });

            if ($id) {
                $query->whereIn('g.id', $id);
            }
            if ($category_id)
                $query->where('g.category_id', $category_id);
            if ($status == 1) {
                $query->whereIn('g.status', [1, 2]);
            } else if ($status == 3) {
                $query->where('g.status', 3);
            }
            if ($start_time)
                $query->where('g.create_at', '>', $start_time);
            if ($end_time)
                $query->where('g.create_at', '<', $end_time);

            $query->whereNull('g.delete_at');

            //amount=总价，unit_price=单价，total=人数，up_shelf_at=上架时间，down_shelf_at=下架时间，create_at=创建时间，category=商品分类，periods=商品期数
            $list = $query
                ->select('g.id', 'g.title', 'g.amount', 'g.unit_price', 'g.total', 'g.icon', 'g.up_shelf_at', 'g.down_shelf_at', 'g.create_at', 'g.periods',
                    'd.title as category'
                )
                ->orderBy($sort_field, $sort)
                ->limit(10000)
                ->get();
            $data = array(array('商品id', '商品名称', '商品本身价值', '商品单价', '商品总数', '商品当前期数', '商品分类'));
            foreach ($list as $k => $v) {
                $arr['id'] = $v->id;
                $arr['title'] = $v->title;
                $arr['amount'] = $v->amount;
                $arr['unit_price'] = $v->unit_price;
                $arr['total'] = $v->total;
                $arr['periods'] = $v->periods;
                $arr['category'] = $v->category;
                $data[] = $arr;
            }
            unset($list);
            unset($query);
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "商品导出", 'type' => 5, 'ip' => $request->getClientIp()]);
            Helper::excelOutput($data, 'goods_' . date('Y-m-d', time()) . '.xlsx');
        } catch (\Exception $e) {
            \Cache::forget('excel');
            throw $e;
        }
    }

    /**
     *  删除商品
     * @param Request $request
     * @return array
     */
    public function del(Request $request)
    {
        $id = $this->forArr($request->input('id'));
        $date = $request->input('date', date('Y-m-d H:i:s'));

        if (!$id) return ['errcode' => 1001, 'msg' => '请输入id！'];

        $upNum = DB::table('goods')->where('status', '3')->whereIn('id', $id)->update(['delete_at' => $date]);
        if ($upNum) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:" . json_encode($id) . "，商品删除", 'type' => 4, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '商品已删除', 'data' => $upNum];
        } else {
            return ['errcode' => 1002, 'msg' => '没有商品被删除'];
        }
    }

    /**
     *  下架
     * @param Request $request
     * @return array
     */
    public function downShelves(Request $request)
    {
        $id = $this->forArr($request->input('id'));
        if (!$id) return ['errcode' => 1001, 'msg' => '请输入id！'];

        $upNum = DB::table('goods')->whereIn('id', $id)->update(['status' => 2, 'down_shelf_at' => date("Y-m-d H:i:s"), 'up_shelf_at' => null]);
        if ($upNum) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:" . json_encode($id) . "，商品下架", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '商品已下架', 'data' => $upNum];
        } else {
            return ['errcode' => 1002, 'msg' => '没有商品下架'];
        }
    }

    /**
     *  强制下架
     * @param Request $request
     * @return array
     */
    public function forceDownShelves(Request $request)
    {
        $id = $this->forArr($request->input('id'));
        if (!$id) return ['errcode' => 1001, 'msg' => '请输入id！'];

        $upNum = DB::table('goods')->whereIn('id', $id)->update(['status' => 3, 'down_shelf_at' => date("Y-m-d H:i:s"), 'up_shelf_at' => null]);
        if ($upNum) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:" . json_encode($id) . "，商品强制下架", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '商品已强制下架', 'data' => $upNum];
        } else {
            return ['errcode' => 1002, 'msg' => '没有商品强制下架'];
        }
    }

    /**
     *  上架
     * @param Request $request
     * @return array
     */
    public function upShelves(Request $request)
    {
        $id = $this->forArr($request->input('id'));
        if (!$id) return ['errcode' => 1001, 'msg' => '请输入id！'];

        $goods_list = DB::table('goods')->select('robot_buy_setting')->whereNotNull('robot_buy_setting')->where(['robot_buy' => 1])->whereIn('id', $id)->get();
        $count = 0;
        foreach ($goods_list as $k => $v) {
            $robot_buy_setting = json_decode($v->robot_buy_setting, true);
            if (!empty($robot_buy_setting['time']) && !empty($robot_buy_setting['model'])) $count++;
        }
        if (count($id) != $count) return ['errcode' => 1002, 'msg' => '请开启机器人！'];

        $upNum = DB::table('goods')->whereIn('id', $id)->update(['status' => 1, 'up_shelf_at' => date("Y-m-d H:i:s"), 'down_shelf_at' => null]);
        if ($upNum) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:" . json_encode($id) . "，商品上架", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '商品已上架', 'data' => $upNum];
        } else {
            return ['errcode' => 1002, 'msg' => '没有商品上架'];
        }
    }

    /**
     * 获取商品列表
     * @param Request $request
     */
    public function goodsList(Request $request)
    {
        $category_id = $request->input('category_id');
        $status = $this->forArr($request->input('status'));

        $query = DB::table('goods');
        if (is_numeric($category_id))
            $query->where('category_id', $category_id);
        if ($status)
            $query->whereIn('status', $status);

        $list = $query->select('id', 'title','periods')
            ->orderBy('id', 'desc')
            ->limit(3000)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $list];
    }
}
