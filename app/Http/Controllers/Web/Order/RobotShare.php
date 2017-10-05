<?php

namespace App\Http\Controllers\Web\Order;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;

/**
 *  机器人订单
 */
class RobotShare extends AbsOrder
{
    public $permission = [
        'execute' => 1,
        'edit' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['210']??0;
    }

    /**
     *  晒单
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $id = $request->input('id');

        if(!$id)return ['errcode' => 1001, 'msg' => '请输入id！'];

        $data = DB::table('periods as p')
            ->leftJoin('goods as g','g.id','=','p.goods_id')
            ->leftJoin('share as s','s.id','=','p.share_id')
            ->leftJoin('order as o','o.id','=','p.order_id')
            ->where([['p.id', $id],['p.user_type',1],['p.status',3]])
            ->select('p.periods','p.order_id','p.unit_price','p.lottery_show_at','p.share_id',
                'g.title',
                's.content','s.image',
                'o.create_at')
            ->first();
        if($data->image)
            $data->image = json_decode( $data->image ,true);
        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }

    /**
     *  编辑晒单
     * @param Request $request
     * @return array
     */
    public function edit(Request $request){
        $periods_id = intval($request->input('periods_id'));
        $content = $request->input('content');
        $img_del = $this->forArr($request->input('img_del'));

        if(!$periods_id){
            return ['errcode' => 1001, 'msg' => "请输入对应期数id！！！" ];
        }

        $periods_info = DB::table('periods')->select('share_id','goods_id')->where([['id', $periods_id],['user_type',1],['status',3]])->first();
        if(!$periods_info){
            return ['errcode' => 1002, 'msg' => "期数订单不存在！！！" ];
        }

        if($content)$data['content'] = $content;
        if($periods_id)$data['periods_id'] = $periods_id;
        if($periods_info)$data['goods_id'] = $periods_info->goods_id;

        //保存图片
        $path = array();
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            foreach ($file as $k => $v) {
                if ($v->getSize() > 2097152) {
                    return ['errcode' => 1002, 'msg' => "第" . ($k + 1) . "张图片超过了2M", 'data' => $k];
                }
                if (!in_array($v->getMimeType(), array('image/jpeg', 'image/gif', 'image/jpg', 'image/png', 'image/bmp'))) {
                    return ['errcode' => 1002, 'msg' => "图片类型不正确！"];
                }
            }
            foreach ($file as $k => $v) {
                if ($v->isValid()) {
                    $client_name = $v->getClientOriginalName();
                    $entension = $v->getClientOriginalExtension();
                    $new_name = md5(date("Y-m-d H:i:s") . $client_name) . "." . $entension;

                    $img_path = 'image/order_share/' . date('Y_m') . '/' . date('d') . '/';
                    $url_path = asset($img_path . $new_name);
                    $file_path = public_path($img_path);

                    $v->move($file_path, $new_name);
                    $path[] = $url_path;
                }
            }
        }

        $query = DB::table('share');
        $re2 = true;
        $info = $query->select('content','image')->where('id', $periods_info->share_id)->first();
        if($periods_info->share_id && $info){
            $image_arr = json_decode($info->image,true);
            if(empty($image_arr))$image_arr=array();
            $image_arr =array_merge(array_values($image_arr),$path);
            foreach ($img_del as $k=>$v){
                if(isset($image_arr[$v])){
                    $tempu=parse_url($image_arr[$v]);
                    @unlink($_SERVER['DOCUMENT_ROOT'].$tempu['path']);
                    unset($image_arr[$v]);
                }
            }
            $image_arr = array_values($image_arr);
            $data['image']=json_encode($image_arr);
            $re = $query->where('id', $periods_info->share_id)->update($data);
        }else{
            $data['image']=json_encode($path);
            $re = $query->insertGetId($data);
            $re2 = DB::table('periods')->where('id', $periods_id)->update(['share_id'=>$re]);
        }
        if($re && $re2) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id：{$periods_id}，机器人晒单编辑", 'type' => 3,'ip'=>$request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '晒单成功！', 'data' => $re];
        }else{
            return ['errcode' => 1010, 'msg' =>'晒单失败！'];
        }
    }

}
