<?php
/**
 * Created by PhpStorm.
 * User: YRW
 * Date: 2017/10/4
 * Time: 11:21
 */

namespace App\Http\Controllers\Web\GameUserWithdrawals;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * 提现申请
 * Class ApplyList
 * @package App\Http\Controllers\Web\GameUserWithdrawals
 */
class ApplyList extends AbsGameUserWithdrawals
{

  public function execute(Request $request)
  {
    // TODO: Implement execute() method.

    $user_keyword = $request->input('user_keyword', '');
    $pay_keyword = $request->input('pay_keyword', '');

    $start_at = $request->input('start_time', '');
    $end_at = $request->input('end_at');

    $page = $request->input('page', '');
    $page_size = $request->input('page_size', '');

    $query = DB::table('game_user_withdrawals');

    if ($user_keyword) {

    }
    if ($pay_keyword) {

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

  /**
   * 审核
   * @param Request $request
   * @return array
   */
  public function verify(Request $request)
  {
    $status = $request->input('status', 0);
    $id = $request->input('id', 0);
    if (!$id) {
      return $this->ajax_return(1, '操作失败!');
    }
    if ($status > 0) {
      $data = [
          'status' => $status,
      ];
      if ($status == 2) {
        $data['remark'] = $request->input('remark', '不允许的操作');
      }
      /*此处需要发送审核请求 调用游戏端接口*/

      $result = DB::table('game_user_withdrawals')->where('id', '=', $id)->update($data);
      if ($result !== false) {
        return $this->ajax_return(0, '操作成功!');
      }
    }
    return $this->ajax_return(1, '操作失败!');
  }

}