<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/4/17
 * Time: 11:02
 */

namespace App\Http\Controllers\Notify;

use App\Jobs\UpdateCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Session;
use App\Common\Helper;

//更新线上代码
class UpdateOnlineCode
{
    private function print($msg)
    {
        echo $msg . "\n";
        echo str_pad('', 4096);
        ob_flush();
        flush();
    }

    public function update(Request $request)
    {
        set_time_limit(10 * 60);
        header('Content-type: text/html; charset=utf-8');
        header('Surrogate-Control: BigPipe/1.0');
        header('Cache-Control: no-cache, must-revalidate');
        header('X-Accel-Buffering: no');
        header('Content-Encoding: identity');
        $user = Session::get('admin');
        if (ob_get_level() == 0) ob_start();
        if ($user && $user->permission === null) {
            $password = \Cache::pull('UpdateOnlineCodePassword_'.$user->id);
            if( !$password || $password['password']!= $user->password || (time() - $password['time']) > 10){
                $this->print(json_encode(['type' => 1, 'value' => '密码错误！！！'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
            }else {
                $m = json_encode(['type' => 1, 'value' => '开始更新'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
                $this->print($m);
                $filename = storage_path('logs/update_code.log');
                $key = 'UpdateCode_' . config('app.site');
                if (!Cache::get($key, false)) {
                    Cache::put($key, true, 10);
                    $m = json_encode(['type' => 1, 'value' => '指令已经发送'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
                    $this->print($m);
                    $params = $request->all();
                    $p = '';
                    foreach ($params as $k => $v) {
                        $p .= ' ' . trim($k);
                        if (trim($v) != '') {
                            $p .= ' ' . trim($v);
                        }
                    }
                    $p .= ' -i' . $request->getClientIp();
                    $p .= ' -s' . config('app.site');
                    file_put_contents($filename, '');
                    dispatch(new UpdateCode($p, $user->id));
                }
                try {
                    $begin = time();
                    $cmd = 'tail -fq ' . $filename . ' 2>&1';
                    $handle = popen($cmd, 'r');
                    while (true) {
                        $buffer = fgets($handle);
                        $msg = explode("\n", $buffer);
                        foreach ($msg as $m) {
                            $m = trim($m);
                            if (!$m) {

                            } else if (is_null(json_decode($m))) {
                                $m = json_encode(['type' => 1, 'value' => $m], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
                                $this->print($m);
                            } else {
                                $this->print($m);
                            }
                        }
                        preg_match('/[\s]?ok[\s]?/', $buffer, $result);
                        if ($result || time() - $begin > 60 * 10) {
                            break;
                        }
                    }
                    pclose($handle);
                    exec('killall tail');
                } catch (\Exception $e) {
                    $m = json_encode(['type' => 1, 'value' => $e->getMessage()], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
                    $this->print($m);
                }
                Cache::forget($key);
                $m = json_encode(['type' => 1, 'value' => '执行完毕'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
                $this->print($m);
            }
        } else {
            $m = json_encode(['type' => 1, 'value' => '不是管理员不允许发布代码'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            $this->print($m);
        }
        ob_end_flush();
    }
}