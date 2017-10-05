<?php
namespace App\Http\Controllers\Web\Goods;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Extend extends AbsGoods
{
    public $permission = [
        'execute' => 1,
        'edit' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['102']??0;
    }

    /**
     * 查看扩展属性
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $id = intval($request->input('id'));

        if(!$id)return ['errcode' => 1001, 'msg' => '请输入id！'];

        $data = DB::table('goods as g')
            ->leftJoin('periods as p', function($join){
                $join->on('p.goods_id', '=', 'g.id')
                    ->on('p.periods', '=', 'g.periods');
            })
            //robot_buy_setting=机器人模式json数据，lottery_type=1正常 2只有机器人，robot_buy=开启机器人扩展，periods_id=期数id，appoint=中奖人id
            ->select('g.robot_buy_setting','g.lottery_type','g.robot_buy','g.id','g.icon','g.total','g.status','g.title','g.create_at',
                'p.id as periods_id','p.appoint')
            ->where('g.id', $id)
            ->first();
        if($data && !empty($data->robot_buy_setting))
            $data->robot_buy_setting = json_decode( $data->robot_buy_setting ,true);
        return ['errcode' => 0, 'msg' => 'ok', 'data' => $data];
    }

    /**
     *  编辑扩展属性
     * @param Request $request
     * @return array
     */
    public function edit(Request $request)
    {
        $id = intval($request->input('id'));
        $robot_buy_setting = $this->forArr($request->input('robot_buy_setting'));
        $lottery_type = intval($request->input('lottery_type'));
        $robot_buy = $request->input('robot_buy');
        $periods_id = intval($request->input('periods_id'));
        $appoint = intval($request->input('appoint'));
        $status =$request->input('status');

        if(!$id)return ['errcode' => 1001, 'msg' => '请输入id！'];

        /*$robot_buy_setting=[
            'model'=>[
                ['max'=>10,'min'=>1,'chance'=>10],
                ['max'=>10,'min'=>1,'chance'=>10]
            ],
            'time'=>[
                ['begin'=>8,'end'=>1,'interval'=>[100,200]],
                ['begin'=>8,'end'=>1,'interval'=>[100,200]]
            ]
        ];*/
        /*if(empty($robot_buy_setting['time'])) {
            $robot_buy_setting['time'] = [
                ['begin' => 0, 'end' => 23, 'interval' => [30, 60]]
            ];
        }*/

        $data = array();
        if($robot_buy_setting)$data['robot_buy_setting'] = json_encode($robot_buy_setting);
        if($lottery_type)$data['lottery_type'] = $lottery_type;
        if(isset($robot_buy))$data['robot_buy'] = $robot_buy;

        $data2 = array();
        if($appoint)$data2['appoint']=$appoint;
        if($lottery_type)$data2['lottery_type']=$lottery_type;

        if($robot_buy = 1 && $status == 1){
            $data['status'] = 1;
        }

        $re = DB::table('goods')->where('id', $id)->update($data);


        if($re){
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "id:{$id}，商品扩展编辑", 'type' => 3,'ip'=>$request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '操作成功','data' => $re];
        }else{
            return ['errcode' => 1010, 'msg' => '没有数据被修改','data' =>''];
        }
    }

}
