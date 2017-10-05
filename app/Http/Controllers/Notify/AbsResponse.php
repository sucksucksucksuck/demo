<?php

namespace App\Http\Controllers\Notify;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/2/27
 * Time: 20:01
 */
abstract class AbsResponse
{
    var $user_id;
    var $type;
    var $header;
    var $user;
    var $system;
    /**
     * @var \Illuminate\Support\Facades\Request
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

    function test()
    {
        Log::debug('参数为=' . print_r($this->request->all(), true));
        return['err'];
    }

    public abstract function execute(array $params);

    public function response(array $params)
    {
        //TODO
//        $this->system = $params['system'] ?? 'new';
//        $token = false;
//        try {
//            if ($this->system == 'old') {

//            } else {

//            }
//            DB::beginTransaction();
//            $this->init();
//            if ($this->type) {
//                $data = $this->{$this->type}($params);
//            } else {
//                $data = $this->execute($params);
//            }
//            DB::commit();
//            return response(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), 200, ['Content-Type' => 'application/json']);
//        } catch (\Exception $e) {
//            DB::rollBack();
//            $errcode = $e->getCode();
//            if ($errcode == 0) {
//                $errcode = 500;
//            }
//            return response(json_encode(['errcode' => $errcode, 'msg' => $e->getMessage(), 'data' => $e->getTrace()], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), 200, ['Content-Type' => 'application/json']);
//        } finally {
//            if ($token) {
//                Cache::forget($token);
//            }
//        }
    }
}