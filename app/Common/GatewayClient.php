<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/10
 * Time: 11:15
 */

namespace App\Common;


use GatewayWorker\Lib\Gateway;
use Illuminate\Support\Facades\Log;


class GatewayClient
{
    public static function init($message = null)
    {
        Gateway::$registerAddress = sprintf("%s:%d", config('worker_man.register_server'), config('worker_man.register_port'));
        if ($message && is_array($message)) {
            $message = json_encode($message, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }
        //Log::debug($message);
        return $message;
    }

    public static function sendToAll($message, $client_id_array = null, $exclude_client_id = null, $raw = false)
    {
        try {
            Gateway::sendToAll(self::init($message), $client_id_array, $exclude_client_id, $raw);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
        }
    }

    public static function sendToGroup($group, $message, $exclude_client_id = null, $raw = false)
    {
        try {
            Gateway::sendToGroup($group, self::init($message), $exclude_client_id, $raw);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
        }
    }

    public static function sendToUid($uid, $message)
    {
        try {
            Gateway::sendToUid($uid, self::init($message));
        } catch (\Exception $e) {
            Log::error($e->getMessage());
        }
    }
}