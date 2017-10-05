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

class Status extends AbsMonitor
{
    public $permission = [
        'execute' => 1,
        'status' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1302']??0;
    }

    /**
     *  商品状态列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $keyword = $request->get('keyword');
        $category_id = $request->get('category_id');

        $query = DB::table('goods as g')
            ->leftJoin('dictionary as d', function ($join) {
            $join->on('g.category_id', '=', 'd.index')
                ->on('d.pid', '=', DB::raw(1));
        })->where('g.status','!=',3);

        if ($keyword)
            $query->where(function ($query) use ($keyword) {
                $query->where('g.id',$keyword);
                $query->orWhere(function ($query) use ($keyword) {
                    $query->where('g.title', 'like', "%{$keyword}%");
                });
            });
        if ($category_id)
            $query->where('g.category_id', $category_id);

        $total = $query->count();
        $list = $query
            ->select('g.*','d.title as category_title')
            ->forPage($this->page, $this->page_size)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total]];
    }

    /**
     *  商品修改状态
     * @param Request $request
     * @return array
     */
    public function status(Request $request)
    {
        $goods_id = $request->get('goods_id[]', $request->get('goods_id'));
        $status = $request->get('status');

        $re = DB::table('goods')->whereIn('id', $goods_id)->update(['lottery_type' => $status]);

        if($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:".implode(',',$goods_id).",status:{$status},商品修改状态", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => 'ok'];
        }else{
            return ['errcode' => 2001, 'msg' => '修改失败'];
        }
    }
}
