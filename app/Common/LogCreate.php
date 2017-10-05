<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/18
 * Time: 15:19
 */

namespace App\Common;


use Monolog\Formatter\LineFormatter;
use Monolog\Handler\ErrorLogHandler;
use Monolog\Handler\RotatingFileHandler;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\SyslogHandler;


class LogCreate
{
    public static function create($filename)
    {
        $filename = storage_path($filename);
        //"single", "daily", "syslog", "errorlog"
        switch (config('app.log')) {
            case 'daily':
                $handler = new RotatingFileHandler($filename, config('app.log_max_files'), config('app.log_level'));
                $handler->setFormatter(new LineFormatter(null, null, true, true));
                break;
            case 'syslog':
                $handler = new SyslogHandler($filename, LOG_USER, config('app.log_level'));
                break;
            case 'errorlog':
                $handler = new ErrorLogHandler(ErrorLogHandler::OPERATING_SYSTEM, config('app.log_level'));
                $handler->setFormatter(new LineFormatter(null, null, true, true));
                break;
            default:
                $handler = new StreamHandler($filename, config('app.log_level'));
                $handler->setFormatter(new LineFormatter(null, null, true, true));
                break;
        }
        return $handler;
    }
}