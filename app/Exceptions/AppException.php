<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/3/30
 * Time: 10:01
 */

namespace App\Exceptions;

/**
 * Class WebException
 * @package App\Exceptions
 */
class AppException extends \Exception
{
    var $data = [];

    public function __construct($message = "", $code = 500, $data = [])
    {
        $this->data = $data;
        parent::__construct($message, $code, null);
    }
}