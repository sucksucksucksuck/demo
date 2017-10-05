<?php

namespace App\Console;

use App\Common\LogCreate;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        Commands\WS::class,
        Commands\CheckDuiBa::class,
        Commands\CheckOrder::class,
        Commands\CheckPeriods::class,
        Commands\RobotBuy::class,
        Commands\ReportUserAmountLog::class,
        Commands\ReportSystem::class,
        Commands\DatabaseBackup::class
    ];
    protected $middleware = [
        //    \App\Http\Middleware\TrimStrings::class,
        //\App\Http\Middleware\ResetConfig::class
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $filePath = storage_path('logs/schedule-' . date('Y-m-d') . '.log');
        //$schedule->command('check_dui_ba')->everyMinute()->appendOutputTo($filePath);
        $schedule->command('check_order')->everyMinute()->appendOutputTo($filePath);
        $schedule->command('check_periods')->everyMinute()->appendOutputTo($filePath);
        $schedule->command('robot_buy')->everyMinute()->appendOutputTo($filePath);
        $schedule->command('report_system')->daily()->appendOutputTo($filePath);
        $schedule->command('report_user_amount_log')->daily()->appendOutputTo($filePath);
        if (config('app.backup')) {
            $schedule->command('backup')->daily()->appendOutputTo($filePath);
        }
        if (file_exists($filePath)) {
            exec("chown www-data:www-data $filePath");
        }
    }

    /**
     * Register the Closure based commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        require base_path('routes/console.php');
    }

    function bootstrap()
    {
        parent::bootstrap();
        $this->app->configureMonologUsing(function ($monolog) {
            $filename = storage_path('logs/laravel-console.log');
            if (file_exists($filename)) {
                exec("chown www-data:www-data $filename");
            }
//            chown($filename, 'www-data:www-data');
            $monolog->pushHandler(LogCreate::create('logs/laravel-console.log'));
        });
    }
}
