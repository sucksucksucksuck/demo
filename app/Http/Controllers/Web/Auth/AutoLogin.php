<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/5
 * Time: 13:14
 */

namespace App\Http\Controllers\Web\Auth;

use Illuminate\Http\Request;

/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/2/15
 * Time: 14:36
 */
class AutoLogin extends Login
{
    public function execute(Request $request)
    {
        $user = session('admin');
        if(!$user){
            return ['errcode' => 403, 'msg' => '未登录系统'];
        }
        return ['errcode' => 0, 'msg' => '登录成功', 'data' => ['user' => $user, 'menu' => $this->getMenu()]];
    }
}