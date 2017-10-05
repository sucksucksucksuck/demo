<?php

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/2/28
 * Time: 10:54
 */

namespace App\Common;

class Aes
{
    const KEY = 'FvMFwSR07jxTzDkr';

    static function decrypt($encrypt_string, $iv, $key = self::KEY)
    {
        return openssl_decrypt($encrypt_string, 'aes-128-cbc', $key, false, $iv);
    }

    static function encrypt($string, $iv, $key = self::KEY)
    {
        return openssl_encrypt($string, 'aes-128-cbc', $key, false, $iv);
        //  return base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_128, $key, $string, MCRYPT_MODE_CBC, $iv));
    }
}