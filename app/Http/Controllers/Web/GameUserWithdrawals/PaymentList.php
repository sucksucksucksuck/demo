<?php
/**
 * Created by PhpStorm.
 * User: YRW
 * Date: 2017/10/4
 * Time: 11:24
 */

namespace App\Http\Controllers\Web\GameUserWithdrawals;


use Illuminate\Http\Request;

/**
 * 已打款
 * Class PaymentList
 * @package App\Http\Controllers\Web\GameUserWithdrawals
 */
class PaymentList extends AbsGameUserWithdrawals
{

  public function execute(Request $request)
  {
    // TODO: Implement execute() method.

    $user_keyword = $request->input('user_keyword', '');
    $pay_keyword = $request->input('pay_keyword', '');

    $start_at = $request->input('start_time', '');
    $end_at = $request->input('end_at');

    $pay_start_at = $request->input('pay_start_at', '');
    $pay_end_at = $request->input('pay_end_at');

    $page = $request->input('page', '');
    $page_size = $request->input('page_size', '');

    $query = DB::table('game_user_withdrawals');

    if ($user_keyword) {

    }
    if ($pay_keyword) {

    }

    if ($pay_start_at && $pay_end_at) {
      $query->whereBetween('pay_at', [$pay_start_at, $pay_end_at]);
    } else {
      if ($pay_start_at) {
        $query->where('pay_at', '>', $pay_end_at);
      }
      if ($pay_end_at) {
        $query->where('pay_at', '<', $pay_end_at);
      }
    }

    if ($start_at && $end_at) {
      $query->whereBetween('created_at', [$start_at, $end_at]);
    } else {
      if ($start_at) {
        $query->where('created_at', '>', $end_at);
      }
      if ($end_at) {
        $query->where('created_at', '<', $end_at);
      }
    }

    //排序

    $data['rows'] = $query->orderByDesc('created_at')
        ->forPage($page, $page_size)
        ->get();

    $data['total'] = $query->count();
    $data['search'] = [
        'page' => $page,
        'page_size' => $page_size,
    ];

    return $this->ajax_return(0, 'success', $data);
  }
}