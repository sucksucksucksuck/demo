<?php
/**
 * Created by PhpStorm.
 * User: YRW
 * Date: 2017/10/3
 * Time: 20:12
 */

namespace App\Http\Controllers\Web\GameUserRechargeLog;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * 用户充值提现流水
 * Class Logs
 * @package App\Http\Controllers\Web\GameUserRechargeLog
 */
class Logs extends AbsGameUserRechargeLog
{

  public function execute(Request $request)
  {
    // TODO: Implement execute() method.
    $keyword = $request->input('keyword', '');
    $start_time = $request->input('start_time', '');
    $end_time = $request->input('end_time', '');

    $model = $request->input('model', '');
    $type = $request->input('type', '');

    $page = $request->input('page');
    $page_size = $request->input('page_size');

    $query = DB::table('game_user_recharge_log');
    if ($keyword) {

    }
    if ($start_time && $end_time) {
      $query->whereBetween('opt_at', [$start_time, $end_time]);
    } else {
      if ($start_time) {
        $query->where('opt_at', '>', $start_time);
      }
      if ($end_time) {
        $query->where('opt_at', '<', $end_time);
      }
    }
    if ($model) {
      $query->where('pay_model', '=', $model);
    }
    if ($type) {
      $query->where('type', '=', $model);
    }

    $data['rows'] = $query->orderByDesc('opt_at')->forPage($page, $page_size)->get();
    $data['total'] = $query->count();
    $data['search'] = [
        'page' => $page,
        'page_size' => $page_size,
    ];
    return $this->ajax_return(0, 'success', $data);
  }
}