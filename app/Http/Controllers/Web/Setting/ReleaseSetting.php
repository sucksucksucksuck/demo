<?php

namespace App\Http\Controllers\Web\Setting;

use Illuminate\Http\Request;
use DB;
use App\Common\Helper;

/**
 * 发布配置
 * Class ReleaseSetting
 * @package App\Http\Controllers\Web\Setting
 */
class ReleaseSetting extends AbsSetting
{
    public $permission = [
        'execute' => 1,
        'release' => 2
    ];

    protected function getPagePermission()
    {
        return $this->user->permission['604'] ?? 0;
    }

    /**
     *  发布配置参数
     * @param Request $request
     * @return array
     */
    public function execute(Request $request)
    {
        return ['errcode' => 0, 'msg' => 'ok', 'data' => []];
    }

    /**
     * 发布
     * @param Request $request
     * @return array
     */
    public function release(Request $request)
    {
        $password = $request->input('password');

        $key = 'UpdateOnlineCodePassword_'.$this->user->id;
        \Cache::forget($key);
        \Cache::put($key, ['password' => Helper::password($password), 'time' => time()], 1);

        return ['errcode' => 0, 'msg' => 'ok'];
    }


}
