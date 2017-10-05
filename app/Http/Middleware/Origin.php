<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/8/2
 * Time: 10:26
 */

namespace App\Http\Middleware;

use App\Exceptions\Handler;
use Closure;
use Illuminate\Http\Request;

class Origin
{
    public function handle(Request $request, Closure $next)
    {
        header('Access-Control-Allow-Origin: http://wx.pgyg.com');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Request-With');
        header('Access-Control-Allow-Credentials: true');
        return $next($request);
    }

}