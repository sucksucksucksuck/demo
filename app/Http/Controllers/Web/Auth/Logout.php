<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/12
 * Time: 10:15
 */

namespace App\Http\Controllers\Web\Auth;


use App\Http\Controllers\Web\AbsResponse;
use Illuminate\Http\Request;

class Logout extends AbsAuth
{
    public function execute(Request $request)
    {
        $request->session()->remove('admin');
        //session(['admin' => null]);
        return ['errcode' => 0, 'msg' => '成功登出'];
    }
}