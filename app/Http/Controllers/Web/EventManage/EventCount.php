<?php

namespace App\Http\Controllers\Web\EventManage;

use Illuminate\Http\Request;
use DB;

class EventCount extends AbsEventManage
{
    public $permission = [
        'execute' => 1
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['709']??0;
    }

    /**
     *  添加金额
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        set_time_limit(180);
        $user_list2 = [];
        $user_not_id = [];
        $user_notype_id = [];
        $pid_event = [];

        $id = $request->input('id');
        $amount = $request->input('amount');
        $type = $request->input('type', 1);

        if (!preg_match('/^([\d]{1,12})([，；,;#][\d]{1,12}){0,50}$/', $id, $arr)) {
            throw new \Exception('请输入用户id！！！', 1001);
        }

        if (!preg_match('/^[\d]{1,11}[，；,;#][\d]{1,4}$/', $amount)) {
            throw new \Exception('请输入金额和次数！！！', 1006);
        }

        $amount = explode(',', str_replace(array('，', '；', ',', ';', '#'), ',', $amount));
        $id = explode(',', str_replace(array('，', '；', ',', ';', '#'), ',', $id));


        $amount[1] = ($amount[1] >= 1) ? $amount[1] <= 500 ? intval($amount[1]) : 500 : 1;
        if (count($id) > 50) {
            throw new \Exception('用户id不能超过50个！！！', 1003);
        }

        $event = DB::table('event')->where([['begin_at', '<=', date('Y-m-d H:i:s')], ['end_at', '>=', date('Y-m-d H:i:s')]])->get();
        if (!$event) {
            throw new \Exception('暂时没有活动上线！！！', 1002);
        }

        if (count($id) * $amount[1] * count($event) > 500) {
            throw new \Exception('总充值次数不能超过500次,（用户*次数*活动数（' . count($event) . '））！！！', 1004);
        }

        foreach ($event as $v) {
            $pid_event[$v->id] = $v;
        }

        $user_list = DB::table('user')->whereIn('id', $id)->get();
        foreach ($user_list as $v) {
            $user_list2[$v->id] = $v;
        }
        foreach ($id as $v) {
            if (empty($user_list2[$v])) {
                $user_not_id[] = $v;
            } else if ($user_list2[$v]->type != 4) {
                $user_notype_id[] = $v;
            }
        }

        if ($user_not_id || $user_notype_id) throw new \Exception(($user_not_id ? implode(',', $user_not_id) . '用户不存在，' : '') . ($user_notype_id ? implode(',', $user_notype_id) . '用户类型不对' : '') . '！！！', 1005);

        $event_obj = null;
        foreach ($event as $v) {
            $v->extend = json_decode($v->extend, true);
            if ($v->pid) {
                $extend = json_decode($pid_event[$v->pid]->extend??'[]', true);
                $module_name = empty($pid_event[$v->pid]->class)?($extend['module_name']??''):$pid_event[$v->pid]->class;
            } else {
                $module_name = empty($v->class)?($v->extend['module_name']??''):$v->class;
            }
            if ($module_name) {
                $class = "\\App\\Http\\Controllers\\Event\\{$module_name}\\Index";
                try {
                    $event_obj = new $class();
                    foreach ($user_list as $v2) {
                        if ($type == 1) {
                            for ($i = 0; $i < $amount[1]; $i++) {
                                $event_obj->recharge($v2->id, $amount[0]);
                            }
                        } else {
                            for ($i = 0; $i < $amount[1]; $i++) {
                                $event_obj->consumer($v2->id, $amount[0]);
                            }
                        }
                        $event_obj->__construct();
                    }
                } catch (\Exception $e) {
                    $module_name = null;
                }
            }
            if (!$module_name) {
                foreach ($user_list as $v2) {
                    $user_data = [];
                    $user_event = DB::table('user_event')->where([['user_id', $v2->id], ['event_id', $v->id]])->first();
                    if ($user_event) {
                        $user_event->extend = json_decode($user_event->extend, true);
                        $user_data['extend'] = [];
                        if ($type == 1) {
                            if (!isset($user_event->extend['recharge_amount'])) $user_event->extend['recharge_amount'] = 0;
                            $user_event->extend['recharge_amount'] = $user_event->extend['recharge_amount'] + $amount[0] * $amount[1];
                            if (!isset($user_event->extend['residual_amount'])) $user_event->extend['residual_amount'] = 0;
                            $user_event->extend['residual_amount'] = $user_event->extend['residual_amount'] + $amount[0] * $amount[1];
                        } else {
                            if (!isset($user_event->extend['consumption_amount'])) $user_event->extend['consumption_amount'] = 0;
                            $user_event->extend['consumption_amount'] = $user_event->extend['consumption_amount'] + $amount[0] * $amount[1];
                            if (!isset($user_event->extend['residual_consumption'])) $user_event->extend['residual_consumption'] = 0;
                            $user_event->extend['residual_consumption'] = $user_event->extend['residual_consumption'] + $amount[0] * $amount[1];
                        }
                        $user_data['extend'] = json_encode($user_event->extend);
                        DB::table('user_event')->where('id', $user_event->id)->update($user_data);
                    } else {
                        $user_data['user_id'] = $v2->id;
                        $user_data['event_id'] = $v->id;
                        $user_data['update_at'] = date('Y-m-d H:i:s');
                        $user_data['extend'] = [];
                        if ($type == 1) {
                            $user_data['extend']['recharge_amount'] = $amount[0] * $amount[1];
                            $user_data['extend']['residual_amount'] = $amount[0] * $amount[1];
                        } else {
                            $user_data['extend']['consumption_amount'] = $amount[0] * $amount[1];
                            $user_data['extend']['residual_consumption'] = $amount[0] * $amount[1];
                        }
                        $user_data['extend'] = json_encode($user_data['extend']);
                        DB::table('user_event')->insert($user_data);
                    }
                }

            }
        }

        $id = json_encode($id);
        $amount = json_encode($amount);
        DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，amount:{$amount}，添加活动金额", 'type' => 3, 'ip' => $request->getClientIp()]);
        return ['errcode' => 0, 'msg' => '添加完成'];
    }

}
