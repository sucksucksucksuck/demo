<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Workerman\Worker;

class WS extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ws {action=start : start|stop|restart|status} {--d}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '操作WorkerMan';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        global $argv;
        define('GLOBAL_START', 1);
        Worker::$logFile = storage_path('logs/worker_man_' . date('Y-m-d') . '.log');
        Worker::$pidFile = storage_path('worker_man.pid');
        $d = isset($argv[3]) && $argv[3] == '--d';
        //pathinfo(__FILE__)['basename']
        $argv = ['artisan ws', $argv[2]];
        if ($d) {
            $argv[] = '-d';
        }
        foreach (glob(app_path('/Worker/Start*.php')) as $start_file) {
            require_once $start_file;
        }
        Worker::runAll();
        if (file_exists(Worker::$logFile)) {
            exec('chown www-data:www-data ' . Worker::$logFile);
        }
    }
}
