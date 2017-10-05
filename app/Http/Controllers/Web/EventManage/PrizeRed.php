<?php

namespace App\Http\Controllers\Web\EventManage;

use Illuminate\Http\Request;
use DB;

class PrizeRed extends AbsEventManage
{
    public $permission = [
        'execute' => 1,
        'create' => 2,
        'edit' => 3,
        'del' => 4
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['707']??0;
    }

    /**
     *  奖品信息
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $id = $request->input('id');

        if (!$id) throw new \Exception('请输入活动id！！！', 1001);

        $query = DB::table('event_prize as ep')
            ->leftJoin('red as r', 'r.id', '=', 'ep.prize')
            ->where([['ep.event_id', $id], ['ep.type', 3], ['ep.status', 1]]);

        $total = $query->count();
        $list = $query
            ->select('ep.id', 'ep.title', 'ep.count', 'ep.type', 'ep.chance', 'ep.describe', 'ep.prize','ep.extend',
                'r.min_amount', 'r.max_amount', 'r.use_amount', 'r.delayed', 'r.expired', 'r.receive_quantity', 'r.count as r_count','r.grant_count as all_num','r.use_count as use_num'
            )
            ->orderBy('ep.id', 'desc')
            ->forPage($this->page, $this->page_size)
            ->get();

        foreach ($list as $k => $v) {
            $list[$k]->no_use_num = $v->all_num - $v->use_num;
            $list[$k]->chance = implode(',',json_decode($list[$k]->chance??'[]', true));
            $list[$k]->extend = json_decode($list[$k]->extend??'[]',true);
            $list[$k]->group = $list[$k]->extend['group']??'';
            unset($list[$k]->extend);
        }

        $event_info = DB::table('event')->select('id', 'title', 'begin_at', 'end_at', 'no')->where('id', $id)->first();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['event_info' => $event_info, 'rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
    }

    /**
     * 奖品信息
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function redInfo(Request $request)
    {
        $id = $request->input('id');

        if (!$id) throw new \Exception('请输入奖品id！！！', 1001);

        $data = DB::table('event_prize as ep')
            ->leftJoin('red as r', 'r.id', '=', 'ep.prize')
            ->select('ep.id', 'ep.title', 'ep.count', 'ep.type', 'ep.chance', 'ep.describe', 'ep.prize','ep.extend',
                'r.min_amount', 'r.max_amount', 'r.use_amount', 'r.delayed', 'r.expired', 'r.receive_quantity', 'r.count as r_count'
            )
            ->where('ep.id', $id)
            ->first();

        if ($data) {
            $data->chance = implode(',', json_decode($data->chance??'[]', true));
            $data->extend = json_decode($data->extend??'[]',true);
            $data->group = $data->extend['group']??'';
            unset($data->extend);
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     * 添加红包
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function create(Request $request)
    {
        $event_id = $request->input('event_id');
        $title = trim($request->input('title'));
        $chance = $request->input('chance');
        $count = $request->input('count');
        $group = $request->input('$group', 1);
        $count = is_numeric($count) ? intval($count) : 1;

        $amount = trim($request->input('amount', 0));
        $use_amount = $request->input('use_amount', 0);
        $delayed = $request->input('delayed', 0);
        $expired = $request->input('expired', 0);
        $red_count = $request->input('red_count', -1);
        $receive_quantity = $request->input('receive_quantity', 1);
        $red_title = $request->input('red_title');

        $use_amount = is_numeric($use_amount)?intval($use_amount):0;

        if (!$event_id || (!$chance && !is_numeric($count)) || !is_numeric($receive_quantity)) {
            throw new \Exception('资料填写不正确！！！', 1001);
        }

        if (!$title || strlen($title) > 33) {
            throw new \Exception('标题长度 1 - 33 ！！！', 1005);
        }

        if (is_numeric($count) && ($count > 30000 || $count < 0)) {
            throw new \Exception('奖品次数超出范围！！！', 1003);
        }

        if ($chance) {
            $chance = json_encode(explode(',', str_replace(array('，', '；', '.',';', '#',' '), ',', $chance)));
        } else {
            $chance = '[]';
        }

        if (is_numeric($amount)) {
            $amount = [$amount, $amount];
        } else {
            $amount = explode(',', str_replace(array('，', '；', '.',';', '#',' '), ',', $amount), 2);
        }
        if (!is_numeric($amount[0]) || !is_numeric($amount[1])) {
            throw new \Exception('红包金额错误！！！', 1003);
        }

        if ($red_title) {
            $red_data['title'] = $red_title;
        } else if ($use_amount) {
            $red_data['title'] = "满{$use_amount}减%s元红包";
        } else {
            $red_data['title'] = "直减%s元红包";
        }

        $data['extend'] = json_encode(['group'=>$group]);
        $data['event_id'] = $event_id;
        $data['title'] = $title;
        $data['chance'] = $chance;
        $data['count'] = $count;
        $data['type'] = 3;

        $red_data['min_amount'] = $amount[0];
        $red_data['max_amount'] = $amount[1];
        $red_data['use_amount'] = $use_amount;
        $red_data['use_at'] = date('Y-m-d H:i:s');
        $red_data['delayed'] = $delayed;
        $red_data['expired'] = $expired;
        $red_data['event_id'] = $event_id;
        $red_data['begin_at'] = null;
        $red_data['end_at'] = null;
        $red_data['count'] = $red_count;
        $red_data['receive_quantity'] = $receive_quantity;

        //保存图片
        $path = '';
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            if ($file->getSize() > 2097152) {
                throw new \Exception('图片超过了2M！！！', 1102);
            }
            if (!in_array($file->getMimeType(), array('image/jpeg', 'image/gif', 'image/jpg', 'image/png', 'image/bmp'))) {
                throw new \Exception('图片类型不正确！！！', 1103);
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

        DB::beginTransaction();
        $red_id = DB::table('red')->insertGetId($red_data);
        if (!$red_id) {
            throw new \Exception('红包添加失败！！！', 3001);
        }
        $data['prize'] = $red_id;
        $re = DB::table('event_prize')->insertGetId($data);

        if ($re) {
            DB::commit();
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$re}，添加活动红包", 'type' => 2, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '添加成功'];
        } else {
            DB::rollBack();
            return ['errcode' => 1010, 'msg' => '添加失败'];
        }
    }

    /**
     * 编辑红包
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function edit(Request $request)
    {
        $id = $request->input('id');
        $title = trim($request->input('title'));
        $chance = $request->input('chance');
        $count = $request->input('count', 1);
        $group = $request->input('group', 1);
        $count = is_numeric($count) ? intval($count) : 1;

        $amount = $request->input('amount', 0);
        $use_amount = $request->input('use_amount', 0);
        $delayed = $request->input('delayed', 0);
        $expired = $request->input('expired', 0);
        $red_count = $request->input('red_count', -1);
        $receive_quantity = $request->input('receive_quantity', 1);
        $red_title = trim($request->input('red_title'));

        if ((!$chance && !is_numeric($count))) {
            throw new \Exception('资料填写不正确！！！', 1001);
        }

        if (!$title || strlen($title) > 33) {
            throw new \Exception('标题长度 1 - 33 ！！！', 1005);
        }

        if (is_numeric($count) && ($count > 30000 || $count < 0)) {
            throw new \Exception('奖品次数超出范围！！！', 1003);
        }

        if ($chance) {
            $chance = json_encode(explode(',', str_replace(array('，', '；', ';', '.','#',' '), ',', $chance)));
        } else {
            $chance = '[]';
        }

        if (is_numeric($amount)) {
            $amount = [$amount, $amount];
        } else {
            $amount = explode(',', str_replace(array('，', '；', ';', '.','#',' '), ',', $amount), 2);
        }
        if (!is_numeric($amount[0]) || !is_numeric($amount[1])) {
            throw new \Exception('红包金额错误！！！', 1005);
        }

        if ($red_title) {
            $red_data['title'] = $red_title;
        } else if ($use_amount) {
            $red_data['title'] = "满{$use_amount}减%s元红包";
        } else {
            $red_data['title'] = "直减%s元红包";
        }

        $event_prize = DB::table('event_prize')->select('extend','prize')->where([['id', $id],['type',3]])->first();
        if (!$event_prize) {
            throw new \Exception('奖品不存在！！！', 1006);
        }
        $event_prize->extend = json_decode($event_prize->extend??'[]', true);
        $event_prize->extend['group'] = $group;
        $data['extend'] = json_encode($event_prize->extend);

        $data['title'] = $title;
        $data['chance'] = $chance;
        $data['count'] = $count;

        $red_data['min_amount'] = $amount[0];
        $red_data['max_amount'] = $amount[1];
        $red_data['use_amount'] = $use_amount;
        //$red_data['use_at'] = date('Y-m-d H:i:s');
        $red_data['delayed'] = $delayed;
        $red_data['expired'] = $expired;
        //$red_data['begin_at'] = null;
        //$red_data['end_at'] = null;
        $red_data['count'] = $red_count;
        $red_data['receive_quantity'] = $receive_quantity;

        //保存图片
        $path = '';
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            if ($file->getSize() > 2097152) {
                throw new \Exception('图片超过了2M！！！', 1102);
            }
            if (!in_array($file->getMimeType(), array('image/jpeg', 'image/gif', 'image/jpg', 'image/png', 'image/bmp'))) {
                throw new \Exception('图片类型不正确！！！', 1103);
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

        $red_id = DB::table('red')->where('id', $event_prize->prize)->update($red_data);
        $re = DB::table('event_prize')->where('id', $id)->update($data);

        if ($re || $red_id) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，编辑活动红包", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '编辑成功'];
        } else {
            return ['errcode' => 1010, 'msg' => '没有数据被修改'];
        }
    }

    /**
     * 删除红包
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function del(Request $request)
    {
        $id = $request->input('id');

        if (!$id) throw new \Exception('请输入奖品id！！！', 1001);
        $prize = DB::table('event_prize')->where('id', $id)->value('prize')??0;

        DB::beginTransaction();
        $re = DB::table('event_prize')->where('id', $id)->update(['status' => 2]);
        $re2 = DB::table('red')->where('id', $prize)->update(['status' => 2]);

        if ($re && $re2) {
            DB::commit();
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，删除活动红包", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '删除成功'];
        } else {
            DB::rollBack();
            return ['errcode' => 1010, 'msg' => '没有数据被修改'];
        }
    }
}
