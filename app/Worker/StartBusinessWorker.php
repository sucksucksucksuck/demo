<?php
/**
 * This file is part of workerman.
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the MIT-LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @author walkor<walkor@workerman.net>
 * @copyright walkor<walkor@workerman.net>
 * @link http://www.workerman.net/
 * @license http://www.opensource.org/licenses/mit-license.php MIT License
 */
use \Workerman\Worker;
use \GatewayWorker\BusinessWorker;

//use \Workerman\Autoloader;
//
//// 自动加载类
//Autoloader::setRootPath(__DIR__);
//
//

//BusinessWorker::$logFile = storage_path('/logs/worker_man_business.log');
//BusinessWorker::$pidFile = storage_path('/worker_man_business.pid');
//// bussinessWorker 进程
//if (!config('app.main') || !config('worker_man.distributed')) {
$worker = new BusinessWorker();
//// worker名称
$worker->name = 'WebPushBusinessWorker';
//// bussinessWorker进程数量
$worker->count = 4;
//// 服务注册地址
$worker->registerAddress = sprintf("%s:%d", config('worker_man.register_server'), config('worker_man.register_port'));
$worker->onWorkerStart = function ($worker) {

};
//// 如果不是在根目录启动，则运行runAll方法
if (!defined('GLOBAL_START')) {
    Worker::runAll();
}
//}

