<?php

namespace App\Http\Controllers\Api;

use App\Common\Aes;
use App\Common\Helper;
use App\Exceptions\Handler;
use App\Http\Controllers\Web\Platform\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/2/16
 * Time: 15:43
 */
abstract class AbsResponse
{
    var $user_id;
    var $type;
    var $header;
    var $user;
    var $system;
    var $file;
    /**
     * @var \Illuminate\Http\Request
     */
    var $request;

    function init()
    {

    }

    function __construct()
    {
    }

    function setType($type = null)
    {
        $this->type = $type;
    }

    function setHeader($header = null)
    {
        $this->header = $header;
    }

    function setRequest($request = null)
    {
        $this->request = $request;
    }

    function setFiles($file = null)
    {
        $this->file = $file;
    }

    public abstract function execute(array $params);

    public function response()
    {
        $token = false;
        $file = [];
        $isLogin = false;
        try {
            if ($this->request->ip() == config('app.old_ip')) {
                $params = $this->request->all();
                if (isset($params['user_id']) && $params['user_id'] != 0) {
                    $uid = $params['user_id'];
                    $token = get_class($this) . $uid;
                    $use = Cache::get($token);
                    if ($use) {
                        return Helper::response(['errcode' => 600, 'msg' => '请求过于平凡,稍后再试']);
                        //return response(json_encode(, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), 200, ['Content-Type' => 'application/json']);
                    }
                    cache([$token => true], 10);
                    $vip = DB::connection('anyou')->table('vip')->where(['uid' => $uid])->first();
                    $user = DB::table('user')->find($vip->uid);
                    $isLogin = true;
                    if ($user) {
//                        if ($user->status === 2) {
//                            return Helper::response(['errcode' => 200, 'msg' => '账号被禁用']);
//                        }
                        $this->user = $user;
                        $this->user->residual_amount = $vip->jine;
                        $this->user->nickname = $vip->name;
                        $this->user->icon = $vip->pic;
                        $this->user->last_login_ip = $vip->ip2;
                        $this->user->last_login_at = date('Y-m-d H:i:s', $vip->dltime === 0 ? $vip->atime : $vip->dltime);
                        $this->user->residual_amount = $vip->jine;
                        $this->user->create_ip = $vip->ip;
                        $this->user->channel = $vip->tgqd;
                        $this->user->type = $vip->abot;
                        $this->user->reg = $vip->reg;
//                        $this->user->idaf = $vip->idaf;
                        $this->user->phone = $vip->photo;
                    } else {
                        Helper::insertUserByVip($vip);
                        $this->user = new \stdClass();
                        $this->user->id = $vip->uid;
                        $this->user->type = $vip->abot;
                        $this->user->residual_amount = $vip->jine;
                        $this->user->nickname = $vip->name;
                        $this->user->icon = $vip->pic;
                        $this->user->last_login_ip = $vip->ip2;
                        $this->user->last_login_at = date('Y-m-d H:i:s', $vip->dltime === 0 ? $vip->atime : $vip->dltime);
                        $this->user->residual_amount = $vip->jine;
                        $this->user->create_ip = $vip->ip;
                        $this->user->channel = $vip->tgqd;
                        $this->user->type = $vip->abot;
                        $this->user->reg = $vip->reg;
//                        $this->user->idaf = $vip->idaf;
                        $this->user->phone = $vip->photo;
                        $this->user->status = 0;
                    }
                }
            } else if (isset($this->header['boundary'])) {
                //user_use
                Helper::userUse([
                    'idaf' => $this->request->header('device') ?? '',
                    'device' => $this->request->header('type') == 'ios' ? 2 : 1,
                    'version' => $this->request->header('version', 0),
                    'ip' => $this->request->ip()
                ]);
                $post_data = file_get_contents('php://input', 'r');
                $boundary = '--' . $this->header['boundary'][0] . '--';
                $vi = substr($this->header['boundary'][0], 10, 16);
                $data = explode($boundary, $post_data);
                if (strlen($data[0]) > 0) {
                    $params = Aes::decrypt($data[0], $vi);
                    $params = json_decode($params, true);
                    if (!$params) {
                        return Helper::response(['errcode' => 606, 'msg' => '数据解密失败']);
                        //  return response(json_encode(['errcode' => 606, 'msg' => '数据解密失败'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), 200, ['Content-Type' => 'application/json']);
                    }
                } else {
                    $params = [];
                }
                if (count($data) > 1) {
                    $file = array_slice($data, 1);
                }
                if (isset($params['token'])) {
                    $use_token = get_class($this) . $params['token'];
                    //    $token = $params['token'];
                    $use = cache($use_token);
                    if ($use) {
                        return Helper::response(['errcode' => 600, 'msg' => '请求过于频繁,稍后再试']);
                        //  return response(json_encode(['errcode' => 600, 'msg' => '请求过于频繁,稍后再试'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), 200, ['Content-Type' => 'application/json']);
                    }
                    cache([$token => true], 10);
                    $this->user = DB::table('user')->where(['token' => $params['token']])->first();
                    $isLogin = true;
                    if ($this->user) {
                        if ($this->user->status != 1) {
                            return Helper::response(['errcode' => 200, 'msg' => '账号被禁用']);
                        }
                        if ($this->user->type == 1 && isset($params['ip'])) {
                            unset($params['ip']);
                        }
//                        $vip = DB::connection('anyou')->table('vip')->where(['uid' => $this->user->id])->where('email', '!=', '1')->first();
//                        if ($vip) {
//                            DB::table('user')->where(['id' => $vip->id])->update([
//                                'residual_amount' => $vip->jine
//                            ]);
//                            Helper::updateOldEmail($vip->id);
//                            //$this->user->residual_amount = $vip->jine;
//                        }
                        // return response(json_encode(['errcode' => 200, 'msg' => '账号被禁用'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), 200, ['Content-Type' => 'application/json']);
                    }
                }
            } else {
                return Helper::response(['errcode' => 100, 'msg' => '非法访问']);
            }
            DB::beginTransaction();
            $this->init();
            if ($this->type) {
                $data = $this->{$this->type}($params);
            } else {
                $this->setFiles($file);
                $data = $this->execute($params);
            }
            $data['isLogin'] = $isLogin;
            return Helper::response($data);
            // return response(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), 200, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            DB::rollBack();
            $errcode = $e->getCode();
            if ($errcode == 0) {
                $errcode = 501;
            }
            if ($errcode == 500) {
                $errcode = 502;
            }
            return Helper::response(['errcode' => $errcode, 'msg' => $e->getMessage()]);
            //  return response(json_encode(['errcode' => $errcode, 'msg' => $e->getMessage()], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), 200, ['Content-Type' => 'application/json']);
        } finally {
            DB::commit();
            if ($token) {
                Cache::forget($token);
            }
        }
    }
}