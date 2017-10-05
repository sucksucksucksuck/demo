<?php

namespace App\Http\Controllers\Web;

use Illuminate\Http\Request;

/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/2/16
 * Time: 15:43
 */
abstract class AbsResponse
{
  /**
   * @param Request $request
   * @return mixed
   */
  var $type;
  var $user;
  var $page;
  var $page_size;
  var $request;
  var $permission = [];
  var $login = true;

  function __construct($request, $m, $a, $t)
  {
    $this->request = $request;
    $this->user = session('admin');

    if ($this->login && empty($this->user->id)) {
      throw new \Exception('用户ID不存在，你可能掉线了！！！', 403);
    }

    if ($this->user && $this->user->permission && isset($this->permission[$t])) {
      $this_val = pow(2, intval($this->permission[$t]) - 1);
      if ($this_val) {
        $val = $this->getPagePermission();
        if (($this_val & $val) != $this_val) {
          throw new \Exception('你权限不足', 402);
        }
      }
    }
  }

  protected function getPagePermission()
  {
    return 0;
  }

  function setType($type = null)
  {
    $this->type = $type;
  }

  public abstract function execute(Request $request);

  public function forPage(Request $request)
  {
    $this->page = intval($request->input('page'));
    $this->page_size = intval($request->input('page_size'));
    if ($this->page <= 0) {
      $this->page = 1;
    }
    if ($this->page_size <= 0) {
      $this->page_size = 20;
    }
    return [$this->page, $this->page_size];
  }

  public function response(Request $request)
  {
    $this->forPage($request);
    if ($this->type) {
      $data = $this->{$this->type}($request);
    } else {
      $data = $this->execute($request);
    }
    if (is_string($data)) {
      return $data;
    }
    if (!is_array($data)) {
      return '非常返回请返回数组';
    }
    if (!isset($data['errcode'])) {
      $data = ['errcode' => 0, 'data' => $data];
    }
    return response(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), 200, ['Content-Type' => 'application/json']);
  }

  public function forArr($str, $separator = ',')
  {
    if (empty($str) && (gettype($str) == 'NULL' || $str == '')) {
      return [];
    } else if (is_array($str)) {
      return $str;
    } else if (!is_null($arr = json_decode($str, true)) && !is_numeric($arr)) {
      return $arr;
    } else if (strstr($str, $separator)) {
      return explode($separator, $str);
    } else {
      return [$str];
    }
  }


  protected function ajax_return($errcode = 1, $msg = 'success', $data = [])
  {
    return ['errcode' => $errcode, 'msg' => $msg, 'data' => $data];
  }
}