<?php

namespace App\Http\Controllers\Web\Setting;

use Illuminate\Http\Request;
use DB;
use App\Common\Helper;

class SystemSetting extends AbsSetting
{
    public $permission = [
        'execute' => 1,
        'edit' => 2,
        'upFile' => 3
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['601']??0;
    }

    /**
     *  系统配置参数
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $robot = [];
        Helper::globalConfig();
        $json = config('app.global');

        //RobotBuy = 开启机器人，BuySpeed = 购买速度，SinglePeopleBuy = 购买人次，LotteryWait = 开奖时间
        $robot['BuySpeed'] = $json['BuySpeed'];
        $robot['SinglePeopleBuy'] = $json['SinglePeopleBuy'];
        $robot['LotteryWait'] = $json['LotteryWait'];
        $robot['RobotBuy'] = $json['RobotBuy'];

        //AdminLoginSMSCode = 登陆需要验证码
        $robot['AdminLoginSMSCode'] = $json['AdminLoginSMSCode'];

        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['robot' => $robot]];
    }

    /**
     * 编辑参数
     * @param Request $request
     * @return array
     */
    public function edit(Request $request)
    {
        $input = $request->input('input', []);
        if (empty($input)) throw new \Exception('请输入参数', 1001);

        $json = config('app.global');

        foreach ($input as $k => $v) {
            if (isset($json[$k])) {
                if ($v == "true"){
                    $v = true;
                }else if( $v == "false"){
                    $v = false;
                }else if(is_numeric($v)){
                    $v = floatval($v);
                }
                $json[$k] = $v;
            }
        }

        $file_path = config_path('global.json');
        $json = json_encode($json);
        file_put_contents($file_path, $json);

        DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "系统配置-编辑参数", 'type' => 3, 'ip' => $request->getClientIp()]);
        return ['errcode' => 0, 'msg' => '修改完成'];
    }

    /**
     *  强制下架所有商品
     * @param Request $request
     * @return array
     */
    public function forceDownShelvesAll(Request $request)
    {
        $upNum = DB::table('goods')->whereIn('status', '<', 3)->update(['status' => 3, 'down_shelf_at' => date("Y-m-d H:i:s"), 'up_shelf_at' => null]);
        if ($upNum) {
            DB::table('admin_log')->insert(['admin_id' => $this->user->id, 'log' => "所有商品强制下架", 'type' => 3, 'ip' => $request->getClientIp()]);
            return ['errcode' => 0, 'msg' => '所有商品已强制下架'];
        } else {
            return ['errcode' => 1002, 'msg' => '没有商品强制下架'];
        }
    }

    /**
     * 上传文件
     * @param Request $request
     * @return array
     */
    public function upFile(Request $request)
    {
        $path = '';
        $re = null;
        if ($request->hasFile('audio')) {
            $file = $request->file('audio');
            if ($file->getSize() > 20480) {
                return ['errcode' => 1201, 'msg' => "音频超过了20K！"];
            }
            if (!in_array($file->getMimeType(), array('mp3'))) {
                return ['errcode' => 1202, 'msg' => "只能上传mp3格式！"];
            }

            if ($file->isValid()) {
                //$client_name = $file->getClientOriginalName();
                $entension = $file->getClientOriginalExtension();
                $new_name = "tips." . $entension;

                $img_path = '/audio/order/';
                $url_path = asset($img_path . $new_name);
                $file_path = public_path($img_path);

                $file->move($file_path, $new_name);
                $path = $url_path;
            }
        }
        if ($path) {
            $json = config('app.global');
            if (!empty($json['order_audio'])) {
                $src = parse_url($json['order_audio']);
                @unlink($_SERVER['DOCUMENT_ROOT'] . $src['path']);
                unset($json['order_audio']);
            }
            $json['order_audio'] = $path;
            $file_path = config_path('global.json');
            $json = json_encode($json);
            $re = file_put_contents($file_path, $json);
        }

        if ($path && $re) {
            return ['errcode' => 0, 'msg' => '上传成功'];
        } else {
            return ['errcode' => 0, 'msg' => '上传失败'];
        }
    }
}
