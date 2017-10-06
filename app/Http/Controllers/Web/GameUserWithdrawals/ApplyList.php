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
   * 提现审核
   * @param Request $request
   * @return array
   */
  public function verify(Request $request)
  {
    $status = $request->input('status', 0);
    $id = $request->input('id', 0);
    $remark = $request->input('remark', '');
    if (!$id || !$status) {
      return $this->ajax_return(1, '非法操作!');
    }
    $user = DB::table('game_user_withdrawals')->where(['id', '=', $id])->first();
    if (!$user) {
      return $this->ajax_return(1, '操作失败!');
    }
    $data = [
        'status' => $status,
        'remark' => $remark,
    ];
    /*此处需要发送审核请求 调用游戏端接口*/
    $apiParam = [ //接口参数
        'game_id' => $user['game_id'],
        'order_id' => $user['order_id'],
        'status' => $status,
        'remark' => $data['remark']
    ];

    if ($status == 2) {
      $data['remark'] = '不允许的操作';
    }
    $result = DB::table('game_user_withdrawals')->where('id', '=', $id)->update($data);
    $userRecharge = DB::table('game_user_recharge')->where(['game_id' => $user['game_id']])->first();
    $rechargeData = [
        'exp_amount' => ($userRecharge + $user['exp_amount']),//总提现 加上本次提现金额
        'exp_count' => ++$userRecharge->exp_count,
        'exp_last_time' => $userRecharge->created_at,
    ];
    if ($userRecharge) {
      $res = DB::table('game_user_recharge')
          ->where('game_id', '=', $user['game_id'])
          ->update($rechargeData);
    } else {
      $rechargeData['game_id'] = $user['game_id'];
      $res = DB::table('game_user_recharge')->insert($rechargeData);
    }

    if ($result !== false && $res !== false) {
      return $this->ajax_return(0, '操作成功!');
    }

    return $this->ajax_return(1, '操作失败!');
  }

}