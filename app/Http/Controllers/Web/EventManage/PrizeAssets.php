<?php

namespace App\Http\Controllers\Web\EventManage;

use Illuminate\Http\Request;
use DB;

class PrizeAssets extends AbsEventManage
{
    public $permission = [
        'execute' => 1,
        'goodsInfo' =>1,
        'create' => 2,
        'edit' => 3,
        'del' => 4
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['705']??0;
    }

    /**
     *  奖品积分金额
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $id = $request->input('id');

        if (!$id) throw new \Exception('请输入活动id！！！', 1001);

        $prefix = DB::getTablePrefix();
        $query = DB::table('event_prize as ep')
            ->where([['ep.event_id', $id],['ep.status',1]])
            ->whereIn('ep.type',[4,5]);

        $total = $query->count();
        $list = $query
            ->select('ep.id','ep.title','ep.count','ep.type','ep.chance','ep.describe','ep.prize',
                DB::raw("(select count(*) from {$prefix}user_prize as up where up.prize_id={$prefix}ep.id) as all_num")
            )
            ->orderBy('ep.id','asc')
            ->forPage($this->page, $this->page_size)
            ->get();

        foreach ($list as $k => $v) {
            $list[$k]->chance = implode(',',json_decode($list[$k]->chance??'[]', true));
            $list[$k]->extend = json_decode($list[$k]->extend??'[]',true);
            $list[$k]->group = $list[$k]->extend['group']??'';
            unset($list[$k]->extend);
        }

        $event_info = DB::table('event')->select('id', 'title', 'begin_at', 'end_at', 'no')->where('id', $id)->first();

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['event_info' => $event_info, 'rows' => $list, 'total' => $total, 'search' => ['page' => $this->page, 'page_size' => $this->page_size]]];
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
            ->select('id','title','count','type','chance','describe','prize')
            ->where('id',$id)
            ->first();

        if($data) {
            $data->chance = implode(',', json_decode($data->chance??'[]', true));
            $data->extend = json_decode($data->extend??'[]',true);
            $data->group = $data->extend['group']??'';
            unset($data->extend);
        }

        return ['errcode' => 0, 'msg' => 'ok', 'data' =>$data ];
    }

    /**
     * 添加活动奖品（积分盘古币）
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
        $type = $request->input('type',4);
        $group = $request->input('group', 1);
        $count = is_numeric($count)?intval($count):1;

        if (!$event_id || !$title || (!$chance && !is_numeric($count))) {
            throw new \Exception('资料填写不正确！！！', 1001);
        }

        if (!in_array($type,[4,5])) {
            throw new \Exception('奖品类型不对！！！', 1002);
        }

        if (is_numeric($count) && ($count > 30000 || $count < 0)) {
            throw new \Exception('奖品次数超出范围！！！', 1003);
        }

        if($chance){
            $chance = json_encode(explode(',', str_replace(array('，', '；', ';', '.', '|', ' ', '/', '\\'), ',', $chance)));
        }else{
            $chance = '[]';
        }

        $data['extend'] = json_encode(['group'=>$group]);
        $data['event_id'] = $event_id;
        $data['title'] = $title;
        $data['chance'] = $chance;
        $data['count'] = $count;
        $data['type'] = $type;

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

                $img_path = 'image/event_prize/' . date('Y_m') . '/' . date('d') . '/';
                $url_path = asset($img_path . $new_name);
                $file_path = public_path($img_path);

                $file->move($file_path, $new_name);
                $path = $url_path;

            }
        }

        if (!empty($path)) $data['icon'] = $path;
        $re = DB::table('event_prize')->insertGetId($data);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$re}，添加活动奖品（积分盘古币）", 'type' => 2, 'ip' => $request->getClientIp()]);
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
        $type = $request->input('type',4);
        $group = $request->input('group', 1);
        $count = is_numeric($count)?intval($count):1;

        if (!$title || (!$chance && !is_numeric($count))) {
            throw new \Exception('资料填写不正确！！！', 1001);
        }

        if (!in_array($type,[4,5])) {
            throw new \Exception('奖品类型不对！！！', 1002);
        }

        if (is_numeric($count) && ($count > 30000 || $count < 0)) {
            throw new \Exception('奖品次数超出范围！！！', 1003);
        }

        if($chance){
            $chance = json_encode(explode(',', str_replace(array('，', '；', ';', '.', '|', ' ', '/', '\\'), ',', $chance)));
        }else{
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

                $img_path = 'image/event_prize/' . date('Y_m') . '/' . date('d') . '/';
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
     * 删除活动奖品（积分盘古币）
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function del(Request $request){
        $id = $request->input('id');

        if (!$id) throw new \Exception('请输入奖品id！！！', 1001);

        $re = DB::table('event_prize')->where('id', $id)->update(['status'=>2]);

        if ($re) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，删除活动奖品（积分盘古币）", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '删除成功'];
        } else {
            return ['errcode' => 1010, 'msg' => '没有数据被修改'];
        }
    }

}
