<?php

namespace App\Http\Controllers\Web\EventManage;

use Illuminate\Http\Request;
use DB;
use App\Common\Helper;

class Manage extends AbsEventManage
{
    public $permission = [
        'execute' => 1,
        'excelPrize' => 2,
        'excelRank' => 2,
        'rank' => 3,
        'editRank' => 4,
        'initialization' => 5
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['702']??0;
    }

    /**
     *  活动列表
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $title = $request->input('title');
        $id = $request->input('id');
        $start_time = $request->input('start_time');
        $end_time = $request->input('end_time');
        $sort_field = $request->input('sort_field', 'id');
        $sort = $request->input('sort', 'desc');

        $query = DB::table('event');
        if ($title)
            $query->where('title', 'like', "%{$title}%");
        if ($id)
            $query->where('id', $id);
        if ($start_time || $end_time) {
            if ($start_time && !$end_time) {
                $end_time = date('Y-m-d H:i:s');
            } else if (!$start_time && $end_time) {
                $start_time = '2000-01-01 00:00:00';
            }
            $query->where(function ($query) use ($start_time, $end_time) {
                $query->where([['begin_at', '>=', trim($start_time) . ' 00:00:00'], ['begin_at', '<=', trim($end_time) . ' 23:59:59']]);
                $query->orWhere(function ($query) use ($start_time, $end_time) {
                    $query->where([['end_at', '>=', trim($start_time) . ' 00:00:00'], ['end_at', '<=', trim($end_time) . ' 23:59:59']]);
                });
            });
        }

        $query->whereNull('pid');
        $query->where('id', '!=', 0);

        $total = $query->count();
        $list = $query
            ->select('id', 'title', 'begin_at', 'end_at', 'no', 'class')
            ->orderBy($sort_field, $sort)
            ->forPage($this->page, $this->page_size)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    /**
     *  导出活动数据表格
     * @param Request $request
     * @return void
     */
    public function excelPrize(Request $request)
    {
        $user_id_arr = [];
        $user_deliver2 = [];

        Helper::excelUnlock($this);
        try {
            $event_id = $request->input('event_id');
            $prize_type = $this->forArr($request->input('prize_type'));
            $start_time = $request->input('start_time');
            $end_time = $request->input('end_time');
            $user_type = $this->forArr($request->input('user_type'));

            if (!$event_id) throw new \Exception('请输入活动id！！！', 1001);

            $query = DB::table('user_prize as up')
                ->leftJoin('event_prize as ep', 'ep.id', '=', 'up.prize_id')
                ->leftJoin('user as u', 'u.id', '=', 'up.user_id');

            $id_arr = DB::table('event')->where('pid', $event_id)->pluck('id');
            $id_arr[] = $event_id;
            $query->whereIn('up.event_id', $id_arr);
            if ($prize_type)
                $query->whereIn('ep.type', $prize_type);
            if ($start_time)
                $query->where('up.create_at', '>=', trim($start_time) . ' 00:00:00');
            if ($end_time)
                $query->where('up.create_at', '<=', trim($end_time) . ' 23:59:59');
            if ($user_type)
                $query->whereIn('u.type', $user_type);
            $list = $query
                ->select('up.user_id', 'up.create_at',
                    'ep.title', 'ep.type as prize_type',
                    'u.nickname', 'u.type as user_type'
                )
                ->limit(10000)
                ->get();

            foreach ($list as $v) {
                $user_id_arr[] = $v->user_id;
            }

            $user_deliver = DB::table('user_deliver')->select('user_id', 'address', 'phone', 'name', 'type')->where('status', 2)->whereIn('user_id', $user_id_arr)->limit(10000)->get();
            foreach ($user_deliver as $v) {
                if ($v->type == 'ali') {
                    $user_deliver2['ali'][$v->user_id] = $v;
                } else if ($v->type == 'matter') {
                    $user_deliver2['matter'][$v->user_id] = $v;
                }
            }
            unset($user_deliver);

            $user_type_field = [0 => '普通用户', 2 => '测试', 4 => '客服'];
            $prize_type_field = ['实物商品', '虚拟商品', '红包', '盘古币', '积分'];
            $data = array(array('用户ID', '用户昵称', '奖品信息', '奖品类型', '中奖时间', '用户类型', '支付宝姓名', '支付宝账号', '收货人姓名', '收货地址', '收货人手机号'));
            foreach ($list as $k => $v) {
                $arr['user_id'] = $v->user_id;
                $arr['nickname'] = $v->nickname;
                $arr['title'] = $v->title;
                $arr['prize_type'] = $prize_type_field[$v->prize_type - 1]??'-';
                $arr['create_at'] = $v->create_at;
                $arr['user_type'] = $user_type_field[$v->user_type]??'-';
                $arr['alipay_name'] = $v->prize_type == 2 && !empty($user_deliver2['ali'][$v->user_id]->name) ? $user_deliver2['ali'][$v->user_id]->name : '-';
                $arr['alipay_id'] = $v->prize_type == 2 && !empty($user_deliver2['ali'][$v->user_id]->address) ? $user_deliver2['ali'][$v->user_id]->address : '-';
                $arr['contact_user_name'] = $v->prize_type == 1 && !empty($user_deliver2['matter'][$v->user_id]->name) ? $user_deliver2['matter'][$v->user_id]->name : '-';
                $arr['contact_address'] = $v->prize_type == 1 && !empty($user_deliver2['matter'][$v->user_id]->address) ? $user_deliver2['matter'][$v->user_id]->address : '-';
                $arr['contact_phone'] = $v->prize_type == 1 && !empty($user_deliver2['matter'][$v->user_id]->phone) ? $user_deliver2['matter'][$v->user_id]->phone : '-';
                $data[] = $arr;
            }
            unset($list);
            unset($query);
            unset($user_deliver2);
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "导出活动数据表格", 'type' => 5, 'ip' => $request->getClientIp()]);
            Helper::excelOutput($data, 'order_' . date('Y-m-d', time()) . '.xlsx');
        } catch (\Exception $e) {
            \Cache::forget('excel');
            throw $e;
        }
    }

    /**
     *  导出排行榜表格
     * @param Request $request
     * @return void
     */
    public function excelRank(Request $request)
    {
        Helper::excelUnlock($this);
        try {
            $event_id = $request->input('event_id');

            if (!$event_id) throw new \Exception('请输入活动id！！！', 1001);

            $query = DB::table('user_event as ue')
                ->leftJoin('user as u', 'u.id', '=', 'ue.user_id');

            if ($event_id)
                $query->where('ue.event_id', $event_id);

            $list = $query
                ->select('ue.user_id', 'ue.sort',
                    'u.nickname', 'u.type as user_type'
                )
                ->orderBy('ue.sort', 'desc')
                ->orderBy('ue.update_at', 'asc')
                ->limit(10000)
                ->get();

            $user_type_field = [0 => '普通用户', 1 => '机器人', 2 => '测试', 4 => '客服'];
            $data = array(array('排名', '排名数据', '用户ID', '用户昵称', '用户类型'));
            foreach ($list as $k => $v) {
                $arr['rank'] = $k + 1;
                $arr['sort'] = $v->sort;
                $arr['user_id'] = $v->user_id;
                $arr['nickname'] = $v->nickname;
                $arr['user_type'] = $user_type_field[$v->user_type]??'-';
                $data[] = $arr;
            }
            unset($list);
            unset($query);
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "导出排行榜表格", 'type' => 5, 'ip' => $request->getClientIp()]);
            Helper::excelOutput($data, 'order_' . date('Y-m-d', time()) . '.xlsx');
        } catch (\Exception $e) {
            \Cache::forget('excel');
            throw $e;
        }
    }

    /**
     * 排行榜
     * @param Request $request
     * @return array
     */
    public function rank(Request $request)
    {
        $id = $request->input('id');

        if (!$id) throw new \Exception('请输入活动id！！！', 1001);

        $list = DB::table('user_event as ue')
            ->leftJoin('user as u', 'u.id', '=', 'ue.user_id')
            ->select('ue.id', 'ue.user_id', 'ue.id', 'ue.id', 'ue.sort', 'ue.extend',
                'u.nickname', 'u.type'
            )
            ->where('ue.event_id', $id)
            ->orderBy('ue.sort', 'desc')
            ->orderBy('ue.update_at', 'asc')
            ->limit(30)
            ->get();

        $event_info = DB::table('event')->select('id', 'title', 'begin_at', 'end_at', 'no')->where('id', $id)->first();
        $event_info->son_pid = DB::table('event')->where('pid', $id)->value('pid')??0;

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['event_info' => $event_info, 'rows' => $list]];
    }

    /**
     * 修改排行榜
     * @param Request $request
     * @return array
     */
    public function editRank(Request $request)
    {
        $id = $request->input('id');
        $sort = intval($request->input('sort', 0));
        $data = [];

        if (!$id) throw new \Exception('请输入用户活动id！！！', 1001);
        if ($sort > 1000000000 || $sort < 0) throw new \Exception('排名数值不对！！！', 1001);

        $data['sort'] = $sort;
        $re = DB::table('user_event')->where('id', $id)->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，修改活动排行榜", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功'];
        } else {
            return ['errcode' => 1010, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 初始化活动数据
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function initialization(Request $request)
    {
        $re1 = false;
        $red_id = [];
        $prize_id = [];

        $id = $request->input('id', 0);

        $id = DB::table('event')->where('id', $id)->value('id')??0;
        if (!$id) throw new \Exception('请输入活动id！！！', 1001);

        $event_prize = DB::table('event_prize')->select('id', 'type', 'prize')->where([['event_id', $id]])->get();
        foreach ($event_prize as $k => $v) {
            if ($v->type == 3) {
                $red_id[] = $v->prize;
            }
            $prize_id[] = $v->id;
        }
        if ($red_id) {
            $re1 = DB::table('user_red')->whereIn('red_id', $red_id)->delete();
        }
        $re2 = DB::table('user_prize')->whereIn('prize_id', $prize_id)->delete();
        $re3 = DB::table('user_event')->where('event_id', $id)->delete();

        if ($re1 || $re2 || $re3) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，初始化活动数据", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '初始化完成'];
        } else {
            return ['errcode' => 1010, 'msg' => '没有数据被修改'];
        }
    }


    /**
     * 活动列表
     * @return array
     */
    public function eventList(Request $request)
    {
        $id = $request->input('id', 0);
        $son = $request->input('son', 1);
        $not_expired = $request->input('not_expired', 1);

        $query = DB::table('event');
        if ($son == 1) {
            $query->whereNull('pid');
        } else if ($son == 2) {
            if (!$id) throw new \Exception('请输入活动id！！！', 1001);
            $query->where('pid', $id);
        }
        $query->where('id', '!=', 0);
        if ($not_expired == 1)
            $query->where(function ($query) {
                $query->where('end_at', '>=', date('Y-m-d H:i:s'));
                $query->orWhere(function ($query) {
                    $query->whereNull('end_at');
                });
            });

        $data = $query->select('id', 'title')
            ->orderBy('id', 'desc')
            ->limit(1000)
            ->get();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

}
