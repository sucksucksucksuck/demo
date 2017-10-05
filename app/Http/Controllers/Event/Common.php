<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/13
 * Time: 16:05
 */

namespace App\Http\Controllers\Event;


use Illuminate\Support\Facades\Log;

class Common
{
    private static function check()
    {
        $result = [];
        $file = scandir(__DIR__);
        foreach ($file as $f) {
            try {
                $class = "App\\Http\\Controllers\\Event\\{$f}\\Index";
                //echo $class;
                //echo '<br />';
                if (class_exists($class)) {
                    $obj = new $class();
                    $begin_at = 0;
                    if ($obj->begin_at) {
                        $begin_at = strtotime($obj->begin_at);
                    }
                    $end_at = PHP_INT_MAX;
                    if ($obj->end_at) {
                        $end_at = strtotime($obj->end_at);
                    }
                    $args = func_get_args();
                    $fun = array_shift($args);
                    if ($begin_at < time() && $end_at > time()) {
                        $rest = call_user_func_array([$obj, $fun], $args);
                        if ($rest) {
                            //echo $class;
                            $result[] = $rest;
                        }
                    }
                }
            } catch (\Exception $e) {
                //echo $e->getMessage();
                //echo '<br />';
                Log::error($e->getMessage());
            }
        }
        return $result;
    }

    /**
     * 当用户充值后会调用这个接口
     * @param $user_id
     * @param $amount
     */
    public static function recharge($user_id, $amount)
    {
        self::check('recharge', $user_id, $amount);
    }

    /**
     * 当用户消费成功后会调用这个接口
     * @param $user_id
     * @param $amount
     */
    public static function consumer($user_id, $amount)
    {
        self::check('consumer', $user_id, $amount);
    }

    /**
     * 用户注册
     * @param $user_id
     */
    public static function register($user_id)
    {
        self::check('register', $user_id);
    }

    /**
     * 用户关注
     * @param $user_id
     * @return array
     */
    public static function follow($user_id)
    {
        return self::check('follow', $user_id);
    }
}