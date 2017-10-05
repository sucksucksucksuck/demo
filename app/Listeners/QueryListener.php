<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/2/28
 * Time: 18:28
 */

namespace App\Listeners;


use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\Log;

class QueryListener
{
    public function handle(QueryExecuted $event)
    {
        //
        $sql = str_replace("?", "'%s'", $event->sql);
//        if ($event->bindings) {
//            $log = vsprintf($sql, $event->bindings);
//        } else {
//            $log = $sql;
//        }
        Log::info($sql);
    }
}