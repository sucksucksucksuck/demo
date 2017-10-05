<?php

namespace App\Http\Controllers\Web\VipManage;

use Illuminate\Http\Request;
use DB;

class VipManage extends AbsVipManage
{
    public $permission = [
        'execute' => 1,
        'getInfo' => 1,
        'create' => 2,
        'edit' => 3,
        'del' => 4,
        'remake' => 5,
        'editPromoters' => 6
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['1501']??0;
    }

    /**
     * 用户管理
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $user_id_arr = [];
        $group_id_arr = [];
        $day_list2 = [];
        $month_list2 = [];
        $last_month_list2 = [];
        $pay_at_list2 = [];
        $director_list2 = [];

        $user_id = $request->input('user_id');
        $nickname = $request->input('nickname');
        $phone = $request->input('phone');
        $promoters_id = $request->input('promoters');
        $director_id = $request->input('director');
        $admin_status = $request->input('admin_status', 1);
        $day_pay = $request->input('day_pay');

        $prefix = DB::getTablePrefix();
        $query = DB::table('admin_join_user as aju')
            ->leftJoin('admin as a', 'a.id', '=', 'aju.admin_id')
            ->leftJoin('admin_group as ag', 'ag.id', '=', 'a.group_id')
            ->leftJoin('user as u', 'u.id', '=', 'aju.user_id');

        if ($user_id)
            $query->where('aju.user_id', $user_id);
        if ($nickname)
            $query->where('u.nickname', 'like', "%" . $nickname . "%");
        if ($phone)
            $query->where('aju.phone', 'like', "%" . $phone . "%");
        if ($promoters_id)
            $query->where('a.id', $promoters_id);
        if ($director_id) {
            $director = [$director_id, DB::table('admin')->where('id', $director_id)->value('group_id')];
            $query->where(function ($query) use ($director) {
                $query->where('ag.pid', $director[1]);
                $query->orWhere(function ($query) use ($director) {
                    $query->where('a.id', $director[0]);
                });
            });
        }
        if ($admin_status) {
            $query->where('a.status', $admin_status);
        }
        if ($day_pay == 1) {
            $query->whereExists(function ($query) use ($prefix) {
                $query->select(DB::raw(1))
                    ->from(DB::raw("{$prefix}pay_log as {$prefix}pl"))
                    ->whereRaw("{$prefix}pl.user_id = {$prefix}aju.user_id and {$prefix}pl.create_at >= '" . date('Y-m-d') . "'");
            });
        } else if ($day_pay == 2) {
            $query->whereNotExists(function ($query) use ($prefix) {
                $query->select(DB::raw(1))
                    ->from(DB::raw("{$prefix}pay_log as {$prefix}pl"))
                    ->whereRaw("{$prefix}pl.user_id = {$prefix}aju.user_id and {$prefix}pl.create_at >= '" . date('Y-m-d') . "'");
            });
        }

        $permissions_admin_id = \App\Models\Web\Admin::getPermissionsAdminId($this->user);
        $query->where([['aju.status', 1], ['ag.type', 2]])->whereNull('a.delete_at')->whereIn('aju.admin_id', $permissions_admin_id);

        $total = $query->count();
        $list = $query->select('aju.id', 'aju.user_id', 'aju.phone', 'aju.create_at', 'aju.admin_id',
            'u.nickname', 'u.recharge_amount',
            'a.truename', 'a.account', 'a.group_id', 'a.type',
            'ag.title'
        )
            ->orderBy('aju.id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        if (!count($list) && ($user_id || $nickname || $phone)) {
            $query2 = DB::table('admin_join_user as aju')
                ->leftJoin('admin as a', 'a.id', '=', 'aju.admin_id')
                ->leftJoin('user as u', 'u.id', '=', 'aju.user_id');
            if ($user_id)
                $query2->where('aju.user_id', $user_id);
            if ($nickname)
                $query2->where('u.nickname', 'like', "%" . $nickname . "%");
            if ($phone)
                $query2->where('aju.phone', 'like', "%" . $phone . "%");
            $query2->where([['aju.status', 1],['a.status', $admin_status == 2 ? 1 : 2]])->whereNull('a.delete_at')->whereIn('aju.admin_id', $permissions_admin_id);
            $list2 = $query2->first();
            if($list2){
                throw new \Exception("你查询的账号是".($admin_status == 2 ? '正常账号' : '公共账号')."！！！", 4001);
            }
        }

        foreach ($list as $v) {
            $user_id_arr[] = $v->user_id;
            if ($v->group_id) $group_id_arr[] = $v->group_id;
        }
        $group_id_arr = array_unique($group_id_arr);

        //当日充值
        $day_list = DB::table('pay_log')->select('user_id', DB::RAW('sum(amount) as day_amount'))->where([['create_at', '>=', date('Y-m-d')], ['create_at', '<=', date('Y-m-d 23:59:59')]])->whereIn('user_id', $user_id_arr)->groupBy('user_id')->get();
        foreach ($day_list as $v) {
            $day_list2[(string)$v->user_id] = $v;
        }

        //当月充值
        $month_list = DB::table('report_user_amount_log')->select('user_id', DB::RAW('sum(recharge_amount) as month_recharge_amount'))->where([['date', '>=', date('Y-m-01')], ['date', '<=', date('Y-m-t 23:59:59')]])->whereIn('user_id', $user_id_arr)->groupBy('user_id')->get();
        foreach ($month_list as $v) {
            $month_list2[(string)$v->user_id] = $v;
        }

        //上月充值
        $last_month_list = DB::table('report_user_amount_log')->select('user_id', DB::RAW('sum(recharge_amount) as last_month_recharge_amount'))->where([['date', '>=', date('Y-m-01', strtotime('-1 month'))], ['date', '<', date('Y-m-01')]])->whereIn('user_id', $user_id_arr)->groupBy('user_id')->get();
        foreach ($last_month_list as $v) {
            $last_month_list2[(string)$v->user_id] = $v;
        }

        //最新充值时间
        $pay_at_list = DB::table('pay_log')->select('user_id', DB::RAW('max(create_at) as pay_create_at'))->whereIn('user_id', $user_id_arr)->groupBy('user_id')->get();
        foreach ($pay_at_list as $v) {
            $pay_at_list2[(string)$v->user_id] = $v;
        }

        //主管信息
        $director_list = DB::table('admin as a')
            ->leftJoin('admin_group as ag', 'ag.pid', '=', 'a.group_id')
            ->select('a.id', 'a.truename', 'a.account', 'ag.id as ag_id')
            ->where([['a.status', 1], ['a.type', 3], ['ag.type', 2]])
            ->whereNull('a.delete_at')
            ->whereIn('ag.id', $group_id_arr)
            ->orderBy('a.id', 'desc')
            ->get();
        foreach ($director_list as $v) {
            if (!isset($director_list2[(string)$v->ag_id])) $director_list2[(string)$v->ag_id] = $v;
        }

        foreach ($list as $k => $v) {
            $list[$k]->day_amount = $day_list2[$v->user_id]->day_amount??0;
            $list[$k]->month_recharge_amount = $list[$k]->day_amount + ($month_list2[$v->user_id]->month_recharge_amount??0);
            $list[$k]->last_month_recharge_amount = $last_month_list2[$v->user_id]->last_month_recharge_amount??0;
            $list[$k]->pay_create_at = $pay_at_list2[$v->user_id]->pay_create_at??'';
            if ($v->type == 1) {
                $list[$k]->director_name = $director_list2[$v->group_id]->truename??'';
                $list[$k]->director_account = $director_list2[$v->group_id]->account??'';
            } else {
                $list[$k]->director_name = $v->truename??'';
                $list[$k]->director_account = $v->account??'';
            }
            $list[$k]->active = empty($v->pay_create_at) || $v->pay_create_at < date('Y-m-d', strtotime('-3 day')) ? 0 : 1;
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    /**
     * 获取信息
     * @param Request $request
     * @return array
     */
    public function getInfo(Request $request)
    {

        $id = intval($request->input('id'));

        if (!$id) {
            throw new \Exception('请输入id！！！', 1001);
        }

        $data = DB::table('admin_join_user as aju')
            ->leftJoin('user as u', 'u.id', '=', 'aju.user_id')
            ->select('aju.id', 'aju.user_id', 'aju.phone', 'aju.operator_remake', 'aju.user_remake', 'aju.wechat', 'aju.admin_id',
                'u.nickname')
            ->where('aju.id', $id)
            ->first();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     * 添加vip客户
     * @param Request $request
     * @return array
     */
    public function create(Request $request)
    {
        $status = 1;
        $type = 1;

        $user_id = intval($request->input('user_id'));
        $phone = $request->input('phone', '');
        $admin_id = intval($request->input('admin_id'));
        $wechat = $request->input('wechat', '');
        $user_remake = $request->input('user_remake', '');

        if (!$user_id || !($admin_id)) {
            throw new \Exception('请输入用户id和推广员id！！！', 1001);
        }
        $user_info = DB::table('user')->where('id', $user_id)->first();
        if (!$user_info) {
            throw new \Exception('用户不存在！！！', 1002);
        } else if ($user_info->type != 0) {
            throw new \Exception('用户类型不正确！！！', 1004);
        }
        $user_info = DB::table('admin as a')->leftJoin('admin_group as ag', 'ag.id', '=', 'a.group_id')->select('a.*', 'ag.type as ag_type')->where('a.id', $admin_id)->first();
        if (!$user_info) {
            throw new \Exception('推广员不存在！！！', 1005);
        } else if ($user_info->ag_type != 2) {
            throw new \Exception('推广员角色类型不正确！！！', 1006);
        } else if ($user_info->status == 2 || $user_info->delete_at != null) {
            throw new \Exception('推广员已禁用！！！', 1007);
        }

        $user_info3 = DB::table('admin_join_user')->where([['user_id', $user_id], ['admin_id', $admin_id]])->whereIn('status', [1, 2])->first();
        if ($user_info3) {
            throw new \Exception('你添加的推广员的用户已存在！！！', 2001);
        }
        $user_info2 = DB::table('admin_join_user')->where([['user_id', $user_id]])->whereIn('status', [1, 2])->first();
        if ($user_info2) {
            $status = 2;
            $type = 2;
            DB::table('admin_join_user')->where([['user_id', $user_id], ['status', 1]])->update(['type' => 2, 'update_at' => date('Y-m-d H;i;s')]);
        }

        $data['user_id'] = $user_id;
        $data['phone'] = $phone;
        $data['admin_id'] = $admin_id;
        $data['wechat'] = $wechat;
        $data['user_remake'] = $user_remake;
        $data['operator_id'] = $this->user->id;
        $data['update_at'] = date('Y-m-d H:i:s');
        $data['status'] = $status;
        $data['type'] = $type;

        $re = DB::table('admin_join_user')->insertGetId($data);

        if ($re) {
            if ($status == 1) {
                $log = ['id' => $re, 'user_id' => "{$user_id}", 'msg' => '添加vip客户'];
                DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => json_encode($log, JSON_UNESCAPED_UNICODE), 'type' => 6, 'ip' => $request->getClientIp()]);
                return ['errcode' => 0, 'msg' => '添加成功'];
            } else {
                $log = ['id' => $user_info2->id, 'old_admin_id' => $user_info2->admin_id, 'new_admin_id' => $admin_id, 'user_id' => "{$user_id}", 'msg' => '添加vip客户（冲突）'];
                DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => json_encode($log, JSON_UNESCAPED_UNICODE), 'type' => 12, 'ip' => $request->getClientIp()]);
                $admin_info = DB::table('admin_join_user as aju')
                    ->leftJoin('admin as a', 'a.id', '=', 'aju.admin_id')
                    ->leftJoin('admin_group as ag', 'ag.id', '=', 'a.group_id')
                    ->select('a.truename', 'a.account', 'ag.title')
                    ->where([['aju.status', 1], ['aju.user_id', $user_id]])
                    ->first();
                throw new \Exception("用户冲突，该用户属于 {$admin_info->title} {$admin_info->truename} （{$admin_info->account}）  ！！！", 5001);
            }
        } else {
            return ['errcode' => 1002, 'msg' => '添加失败'];
        }
    }

    /**
     * 编辑vip客户信息
     * @param Request $request
     * @return array
     */
    public function edit(Request $request)
    {
        $id = intval($request->input('id'));
        $user_id = intval($request->input('user_id'));
        $phone = $request->input('phone', '');
        $admin_id = intval($request->input('admin_id'));
        $wechat = $request->input('wechat', '');
        $user_remake = $request->input('user_remake', '');

        if (!$id || !$user_id || !($admin_id)) {
            throw new \Exception('请输入id和业务员id！！！', 1001);
        }

        $data['user_id'] = $user_id;
        $data['phone'] = $phone;
        $data['admin_id'] = $admin_id;
        $data['wechat'] = $wechat;
        $data['user_remake'] = $user_remake;
        $data['operator_id'] = $this->user->id;
        $data['update_at'] = date('Y-m-d H:i:s');

        $re = DB::table('admin_join_user')->where(['id' => $id])->update($data);

        if ($re) {
            $log = ['id' => $id, 'user_id' => "{$user_id}", 'msg' => '修改vip客户信息'];
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => json_encode($log, JSON_UNESCAPED_UNICODE), 'type' => 7, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功'];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 删除vip客户
     * @param Request $request
     * @return array
     */
    public function del(Request $request)
    {
        $id = intval($request->input('id'));

        if (!$id) {
            throw new \Exception('请输入id！！！', 1001);
        }
        $user_id = DB::table('admin_join_user')->where('id', $id)->value('user_id');

        $re = DB::table('admin_join_user')->delete($id);

        if ($re) {
            $log = ['id' => $id, 'user_id' => "{$user_id}", 'msg' => '删除vip客户'];
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => json_encode($log, JSON_UNESCAPED_UNICODE), 'type' => 8, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '删除成功'];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 编辑操作备注
     * @param Request $request
     * @return array
     */
    public function remake(Request $request)
    {
        $id = intval($request->input('id'));
        $user_remake = $request->input('user_remake', '');

        if (!$id) {
            throw new \Exception('请输入id和业务员id！！！', 1001);
        }

        $data['user_remake'] = $user_remake;
        $data['operator_id'] = $this->user->id;
        $data['update_at'] = date('Y-m-d H:i:s');

        $re = DB::table('admin_join_user')->where(['id' => $id])->update($data);

        if ($re) {
            $user_id = DB::table('admin_join_user')->where('id', $id)->value('user_id');
            $log = ['id' => $id, 'user_id' => "{$user_id}", 'msg' => '修改vip客户备注'];
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => json_encode($log, JSON_UNESCAPED_UNICODE), 'type' => 9, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功'];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 修改vip客户推广员
     * @param Request $request
     * @return array
     */
    public function editPromoters(Request $request)
    {
        $id = $request->input('id');
        $admin_id = intval($request->input('admin_id'));

        if (!$id || !$admin_id) {
            throw new \Exception('请输入id和业务员id！！！', 1001);
        }

        $data['admin_id'] = $admin_id;
        $data['operator_id'] = $this->user->id;
        $data['update_at'] = date('Y-m-d H:i:s');

        $re = DB::table('admin_join_user')->whereIn('id', $id)->update($data);

        if ($re) {
            $log = ['id' => json_encode($id), 'msg' => '修改vip客户推广员'];
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => json_encode($log, JSON_UNESCAPED_UNICODE), 'type' => 10, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '修改成功'];
        } else {
            return ['errcode' => 1002, 'msg' => '没有数据被修改'];
        }
    }
}
