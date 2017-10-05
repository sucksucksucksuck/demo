<?php

namespace App\Jobs;

use App\Common\DuiBaApi;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DuiBa implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     */
    var $periods_id;
    var $loop = false;

    public function __construct($periods_id)
    {
        $this->queue = 'dui_ba';
        $this->periods_id = $periods_id;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        return;
        $periods = DB::table('periods')->find($this->periods_id);
        if ($periods->order_status == 2 && $periods->order_type == 1 && $periods->user_type == 0) {
            // Log::debug('$periods->amount=>' . $periods->amount);
            sleep(mt_rand(2, 4));
            $duiBaApi = new DuiBaApi();
            // Log::debug(2);
            if (in_array($periods->amount, config('dui_ba.amount'))) {
                // Log::debug(3);
                $dui_ba_update = [
                    'periods_id' => $this->periods_id,
                    // 'user_id' => $periods->user_id,
                    //  'amount' => $periods->amount
                ];
                //Log::debug(4);
                $credits = Cache::get('DuiBaCredits', 0);
                //Log::debug('$credits=' . $credits);
                if ($credits < $periods->amount * config('dui_ba.credits_ratio')) {
                    $duiBaApi->login();
                    sleep(mt_rand(1, 2));
                    // Log::debug('登录结果' . $ret);
                    Cache::add('DuiBaCredits', config('dui_ba.credits'), 2 * 60);
                }
                // Log::debug(5);
                Cache::decrement('DuiBaCredits', $periods->amount * config('dui_ba.credits_ratio'));
                // Log::debug(5);
                //$itemUrl = $duiBaApi->getItemUrl();
                // $token = $duiBaApi->getBuyToken($itemUrl);
                $token = $duiBaApi->getBuyToken();
                sleep(mt_rand(1, 2));
                if (!$token) {
                    Cache::forget('DuiBaCredits');
                    if (!$this->loop) {
                        $this->loop = true;
                        $this->handle();
                    } else {
                        Log::debug('兑吧无法获取token');
                    }
                    return;
                }
                $result = $duiBaApi->buy($periods->contact_id, $periods->contact_name, $periods->amount, $token);
                sleep(mt_rand(1, 2));
                //  Log::debug(7);
                // print_r($result);
                Log::debug(print_r($result, true));
                // $dui_ba_update['message'] = $result['message'];
                $periods_update = ['error' => ''];
                // Log::debug(8);
                if ($result['success'] == 1 && !isset($result['neCaptcha'])) {
                    $dui_ba_update['status'] = 1;
                    $periods_update['order_status'] = 3;
                    $periods_update['payment_type'] = 2;
                    $periods_update['payment_fee'] = $periods->amount * config('dui_ba.rate');
                    //DB::table('periods')->where(['id' => $this->periods_id])->update($periods_update);
                    //} else if (strstr($result['message'], 'alipay帐号')) {
                    //      $dui_ba_update['status'] = 2;
                    //     $periods_update['error'] = '您所填写的支付宝账号及姓名有误，请重新填写并提交';
                    //     $periods_update['order_status'] = 1;
                } else {
                    $dui_ba_update['status'] = 2;
                }
                // Log::debug(10);
                if ($result && $result['success'] && !isset($result['neCaptcha'])) {
                    // Log::debug(11);
                    $periods_update['payment_no'] = $dui_ba_update['dui_ba_order_id'] = preg_replace('/(\d{4})$/', 'C${1}', $result['orderId']);
                    $id = $duiBaApi->getRecordDetail($result['url']);
                    if ($id) {
                        DB::table('dui_ba')->where(['dui_ba_order_no' => $id])->update($dui_ba_update);
                    }
                    //$insert['dui_ba_order_no'] = $id;
                } else {
                    Log::debug(print_r($result, true));
                }
                //  Log::debug(12);
                DB::table('periods')->where(['id' => $this->periods_id])->update($periods_update);
                //DB::table('dui_ba')->insert($insert);
            }
        }
        //
    }
}
