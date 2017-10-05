<?php

namespace App\Http\Middleware;

use App\Common\Helper;
use App\Exceptions\Handler;
use Closure;

/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/2/6
 * Time: 12:10
 */
class  ResetConfig
{
    public function handle($request, Closure $next)
    {
        Helper::globalConfig();
        $data = $next($request);
        return $data;
    }

}