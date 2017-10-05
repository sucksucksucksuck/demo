<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/3/8
 * Time: 14:57
 */

namespace App\Http\Controllers\Api\Goods;


use App\Http\Controllers\Api\AbsResponse;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Facades\DB;
use App\Common\Helper;

class Search extends AbsResponse
{
    var $default_params = ['page' => 1, 'page_size' => 16, 'order' => 1];

    /**
     * 查询商品列表
     * @param array $params
     * @return array
     */
    public function execute(array $params)
    {

        $params = array_merge($this->default_params, $params);
        $category_id = $params['category_id'] ?? false;
        $keyword = $params['keyword'] ?? false;

        $prefix = DB::getTablePrefix();
        $query = DB::table('goods as g')
            ->leftJoin('periods as p', function (JoinClause $join) {
                $join->on('g.id', '=', 'p.goods_id')->on('p.status', '=', DB::raw(1));
            })
            ->whereIn('g.status', [1, 2])
            ->select(['g.id',
                'p.periods',
                'g.title',
                'g.icon',
                'p.buy',
                'g.tag',
                'p.total',
                'p.unit_price'])
            ->forPage($params['page'], $params['page_size']);
        if (isset($params['system']) && $params['system'] == 'old') {
            switch (intval($params['order'])) {
                case 1:
                    $order = "{$prefix}g.create_at desc";
                    break;
                case 2:
                    $order = "{$prefix}p.buy / {$prefix}p.total desc";
                    break;
                case 3:
                    $order = "{$prefix}p.total desc";
                    break;
                case 4:
                    $order = "{$prefix}p.total asc";
                    break;
                default:
                    $order = "{$prefix}g.sort desc";
                    break;
            }
        } else {
            $order = "{$prefix}g.sort desc";
            switch (intval($params['order'])) {
                case 2://新品
                    $query->where('g.tag', 'like', '%tab_new%');
                    break;
                case 3://热门虚拟
                    $query->where(['g.type' => 1]);
                    $query->where('g.tag', 'like', '%tab_hot%');
                    break;
                case 4://热门实物
                    $query->where(['g.type' => 0]);
                    $query->where('g.tag', 'like', '%tab_hot%');
                    break;
            }
        }
        $query->orderByRaw($order);
        if ($category_id) {
            $query->where(['category_id' => $category_id]);
        }
        if ($keyword) {
            $query->where('title', 'like', "%{$keyword}%");
        }
        $list = $query->get();
        foreach ($list as &$l) {
            if (!$l->periods) {
                Helper::incrementGoodsPeriods($l->id, $g, [], true);
            }
            $l->tag = json_decode($l->tag, true);
        }
        if ($list->count()) {
            return ['errcode' => 0, 'msg' => '', 'data' => $list];
        } else {
            return ['errcode' => 0, 'msg' => '没有更多数据了', 'data' => []];
        }
    }
}