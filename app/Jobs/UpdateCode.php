<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class UpdateCode implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $params;

    /**
     * UpdateCode constructor.
     * @param $params
     */
    public function __construct($params)
    {
        $this->queue = 'update_code';
        $this->params = $params;
        //
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $file = storage_path('logs/update_code.log');
        try {
            if (file_exists($file)) {
                exec("chown www-data:www-data $file");
            }
            if ($this->params == 'ok') {
                file_put_contents($file, "\nok\n", FILE_APPEND);
            } else {
                $cmd = config('app.shell') . $this->params . ' > ' . $file . ' &';
                exec($cmd);
                dispatch((new UpdateCode('ok'))->delay(8 * 60));
            }
        } catch (\Exception $e) {
        }
        //sleep(60 * 8);
        //
        //
    }
}
