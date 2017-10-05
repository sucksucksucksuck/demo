<?php

namespace App\Http\Controllers\Web\EventManage;

use Illuminate\Http\Request;
use DB;
use App\Common\Prize as CommonPrize;

class Prize extends AbsEventManage
{
    public $permission = [
        'execute' => 1,
        'reissuePrize' => 2,
        'assetsInfo' => 1,
        'create' => 3,
        'edit' => 4,
        'del' => 5
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['704']??0;
    }

    /**
     *  奖品信息
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $id = $request->input('id');

        if (!$id) {
            throw new \Exception('请输入活动id！！！', 1001);
        }

        $query = DB::table('event_prize as ep')
            ->where([['ep.event_id', $id], ['ep.status', 1]]);

        $total = $query->count();
        $list = $query
            ->select('ep.id', 'ep.title', 'ep.count', 'ep.type', 'ep.chance', 'ep.describe', 'ep.prize', 'ep.extend', 'ep.grant_count as all_num')
            ->orderBy('ep.id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        foreach ($list as $k => $v) {
            $list[$k]->chance = implode(',', json_decode($list[$k]->chance??'[]', true));
            $list[$k]->extend = json_decode($list[$k]->extend??'[]', true);
            $list[$k]->group = $list[$k]->extend['group']??'';
            unset($list[$k]->extend);
        }

        $event_info = DB::table('event')->select('id', 'title', 'begin_at', 'end_at', 'no')->where('id', $id)->first();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['event_info' => $event_info, 'rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    /**
     * 补发活动奖品
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function reissuePrize(Request $request)
    {
        $data = [];
        $log = [];

        $id = intval($request->input('id'));
        $event_id = intval($request->input('event_id'));
        $user_id = intval($request->input('user_id'));
        $num = intval($request->input('num'));
        $remark = $request->input('remark');

        if (!$id || !$event_id || !$user_id) {
            throw new \Exception('请输入完整数据！！！', 1001);
        }

        if ($num <= 0 || $num > 500) {
            throw new \Exception('数量超出范围！！！', 1002);
        }

        $user_info = DB::table('user')->where('id', $user_id)->first();
        if (!$user_info) {
            throw new \Exception('用户不存在！！！', 1006);
        }

        $prize_info = DB::table('event_prize')->select('id', 'type', 'prize')->where('id', $id)->first();
        if (!$prize_info) {
            throw new \Exception('奖品不存在！！！', 1004);
        }

        for ($i = 0; $i < $num; $i++) {
            $prize = [];
            $prize['user_id'] = $user_id;
            $prize['prize_id'] = $id;
            $prize['event_id'] = $event_id;
            if ($remark) $prize['remark'] = $remark;
            $data[] = $prize;
        }

        DB::connection('anyou')->beginTransaction();
        DB::beginTransaction();
        $re = DB::table('user_prize')->insert($data);
        if ($re) {
            if ($prize_info->type == 3) {
                $red_count = DB::table('red')->select('grant_count', 'count', 'receive_quantity')->where('id', $prize_info->prize)->first();
                if ($red_count->count > 0 && ($red_count->count - $red_count->grant_count) < $num * $red_count->receive_quantity) {
                    DB::rollBack();
                    throw new \Exception('红包领取次数不够了！！！', 1005);
                }
                $common_prize_info = CommonPrize::red($user_id, $prize_info->prize, $num,1);
                if ($common_prize_info['status'] != 0) {
                    DB::rollBack();
                    throw new \Exception($common_prize_info['msg'], 1006);
                }
                DB::table('red')->where('id',$prize_info->prize)->increment('grant_count',$num);
            } else if ($prize_info->type == 4) {
                $re = DB::connection('anyou')->table('vip')->where('uid', $id)->increment('jine', $prize_info->prize * $num);
                if ($re) {
                    $common_prize_info = CommonPrize::amount($user_id, $prize_info->prize * $num, $this->user->id, 3, null, null, 3);
                    $re2 = DB::table('event_prize')->where('id',$prize_info->id)->increment('grant_count',$num);
                    if ($common_prize_info['status'] != 0 || !$re2) {
                        DB::connection('anyou')->rollBack();
                        DB::rollBack();
                        throw new \Exception($common_prize_info['msg'], 1007);
                    }
                } else {
                    DB::connection('anyou')->rollBack();
                }
            } else if ($prize_info->type == 5) {
                $common_prize_info = CommonPrize::integral($user_id, $prize_info->prize * $num, $this->user->id, 2);
                $re2 = DB::table('event_prize')->where('id',$prize_info->id)->increment('grant_count',$num);
                if ($common_prize_info['status'] != 0 || !$re2) {
                    DB::rollBack();
                    throw new \Exception($common_prize_info['msg'], 1008);
                }
            }
            DB::table('event_prize')->where('id',$prize_info->id)->increment('grant_count',$num);

            DB::connection('anyou')->commit();
            DB::commit();

            $log['id'] = $id;
            $log['msg'] = '补发活动奖品';
            $log['num'] = $num;
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => json_encode($log), 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '操作成功！', 'data' => $re];
        } else {
            DB::rollBack();
            return ['errcode' => 2101, 'msg' => '没有数据被修改！'];
        }
    }

    /**
     * 获取奖品信息
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function assetsInfo(Request $request)
    {
        $id = $request->input('id');

        if (!$id) throw new \Exception('请输入奖品id！！！', 1001);

        $data = DB::table('event_prize')
            ->select('id', 'title', 'count', 'type', 'chance', 'describe', 'prize', 'extend')
            ->where('id', $id)
            ->first();

        if ($data) {
            $data->chance = implode(',', json_decode($data->chance??'[]', true));
            $data->extend = json_decode($data->extend??'[]', true);
            $data->group = $data->extend['group']??'';
            unset($data->extend);
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     * 添加活动奖品
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function create(Request $request)
    {
        $event_id = $request->input('event_id');
        $title = trim($request->input('title'));
        $chance = $request->input('chance');
        $count = $request->input('count', 1);
        $type = $request->input('type');
        $group = $request->input('group', 1);
        $prize = $request->input('prize', 0);
        $count = is_numeric($count) ? intval($count) : 1;

        if (!$event_id || (!$chance && !is_numeric($count))) {
            throw new \Exception('资料填写不正确！！！', 1001);
        }

        if (!$title || strlen($title) > 33) {
            throw new \Exception('标题长度 1 - 33 ！！！', 1005);
        }

        if (!in_array($type, [1, 2, 4, 5])) {
            throw new \Exception('奖品类型不对！！！', 1002);
        }

        if (is_numeric($count) && ($count > 30000 || $count < 0)) {
            throw new \Exception('奖品次数超出范围！！！', 1003);
        }

        if (!is_numeric($prize) || ($count > 2000000000 || $count < 0)) {
            throw new \Exception('金额错误！！！', 1004);
        }

        if ($chance) {
            $chance = json_encode(explode(',', str_replace(array('，', '；', ',', ';', '#'), ',', $chance)));
        } else {
            $chance = '[]';
        }

        if ($chance == '[]' && $count <= 1) {
            throw new \Exception('权重和次数必须填写一个！！！', 1001);
        }

        $data['extend'] = json_encode(['group' => $group]);
        $data['event_id'] = $event_id;
        $data['title'] = $title;
        $data['chance'] = $chance;
        $data['count'] = $count;
        $data['type'] = $type;
        $data['prize'] = $prize;

        //保存图片
        $path = '';
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            if ($file->getSize() > 2097152) {
                throw new \Exception('图片超过了2M！！！', 1502);
            }
            if (!in_array($file->getMimeType(), array('image/jpeg', 'image/gif', 'image/jpg', 'image/png', 'image/bmp'))) {
                throw new \Exception('图片类型不正确！！！', 1503);
            }
            if ($file->isValid()) {
                $client_name = $file->getClientOriginalName();
                $entension = $file->getClientOriginalExtension();
                $new_name = md5(date("Y-m-d H:i:s") . $client_name) . "." . $entension;

                $img_path = 'upload/event_prize/' . date('Y_m') . '/' . date('d') . '/';
                $url_path = asset($img_path . $new_name);
                $file_path = public_path($img_path);

                $file->move($file_path, $new_name);
                $path = $url_path;

            }
        }

        if (!empty($path)) $data['icon'] = $path;
        $re = DB::table('event_prize')->insertGetId($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$re}，添加活动奖品（704）", 'type' => 2, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '添加成功'];
        } else {
            return ['errcode' => 1010, 'msg' => '添加失败'];
        }
    }

    /**
     * 编辑活动奖品（积分盘古币）
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function edit(Request $request)
    {
        $id = $request->input('id');
        $title = trim($request->input('title'));
        $chance = $request->input('chance');
        $count = $request->input('count');
        $type = $request->input('type', 1);
        $group = $request->input('group', 1);
        $prize = $request->input('prize', 0);
        $count = is_numeric($count) ? intval($count) : 1;

        if ((!$chance && !is_numeric($count))) {
            throw new \Exception('资料填写不正确！！！', 1001);
        }

        if (!$title || strlen($title) > 33) {
            throw new \Exception('标题长度 1 - 33 ！！！', 1005);
        }

        if (!in_array($type, [1, 2, 3, 4, 5])) {
            throw new \Exception('奖品类型不对！！！', 1002);
        }

        if (is_numeric($count) && ($count > 30000 || $count < 0)) {
            throw new \Exception('奖品次数超出范围！！！', 1003);
        }

        if (!is_numeric($prize) || ($count > 2000000000 || $count < 0)) {
            throw new \Exception('金额错误！！！', 1004);
        }

        if ($chance) {
            $chance = json_encode(explode(',', str_replace(array('，', '；', ',', ';', '#'), ',', $chance)));
        } else {
            $chance = '[]';
        }

        $extend = DB::table('event_prize')->where('id', $id)->value('extend');
        $extend = json_decode($extend??'[]', true);
        $extend['group'] = $group;
        $data['extend'] = json_encode($extend);

        $data['title'] = $title;
        $data['chance'] = $chance;
        $data['count'] = $count;
        $data['type'] = $type;
        if ($type != 3) $data['prize'] = $prize;

        //保存图片
        $path = '';
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            if ($file->getSize() > 2097152) {
                throw new \Exception('图片超过了2M！！！', 1002);
            }
            if (!in_array($file->getMimeType(), array('image/jpeg', 'image/gif', 'image/jpg', 'image/png', 'image/bmp'))) {
                throw new \Exception('图片类型不正确！！！', 1003);
            }
            if ($file->isValid()) {
                $client_name = $file->getClientOriginalName();
                $entension = $file->getClientOriginalExtension();
                $new_name = md5(date("Y-m-d H:i:s") . $client_name) . "." . $entension;

                $img_path = 'upload/event_prize/' . date('Y_m') . '/' . date('d') . '/';
                $url_path = asset($img_path . $new_name);
                $file_path = public_path($img_path);

                $file->move($file_path, $new_name);
                $path = $url_path;
            }
        }

        if (!empty($path)) {
            $icon = DB::table('event_prize')->where('id', $id)->value('icon');
            if ($icon) {
                $tempu = parse_url($icon);
                @unlink($_SERVER['DOCUMENT_ROOT'] . $tempu['path']);
            }
            $data['icon'] = $path;
        }

        $re = DB::table('event_prize')->where('id', $id)->update($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，编辑活动奖品（积分盘古币）", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '编辑成功'];
        } else {
            return ['errcode' => 1010, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 删除活动奖品（704）
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function del(Request $request)
    {
        $id = $request->input('id');

        if (!$id) throw new \Exception('请输入奖品id！！！', 1001);

        $re = DB::table('event_prize')->where('id', $id)->whereIn('type', [1, 2, 4, 5])->update(['status' => 2]);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，删除活动奖品（704）", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '删除成功'];
        } else {
            return ['errcode' => 1010, 'msg' => '没有数据被修改'];
        }
    }


}
