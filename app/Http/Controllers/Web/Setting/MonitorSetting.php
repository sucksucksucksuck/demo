<?php

namespace App\Http\Controllers\Web\Setting;

use Illuminate\Http\Request;
use DB;
use App\Common\Helper;

class MonitorSetting extends AbsSetting
{
    public $permission = [
        'execute' => 1,
        'editRobot' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['605']??0;
    }

    /**
     *  APP配置参数
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        $robot = [];



        return ['errcode' => 0, 'msg' => 'ok', 'data' => ['robot' => $robot]];
    }

    /**
     *
     * @param Request $request
     * @return void
     */
    public function editSSSS(Request $request)
    {

    }


}
