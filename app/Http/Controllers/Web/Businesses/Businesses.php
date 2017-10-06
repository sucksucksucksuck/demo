<?php

namespace App\Http\Controllers\Web\Businesses;

use App\Common\Helper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: YRW
 * Date: 2017/10/2
 * Time: 14:05
 */
class Businesses extends BusinessesManage
{

  /**
   * 银商列表
   * @param Request $request
   * @return array
   */
  public function execute(Request $request)
  {
    $keyword = $request->input('keyword');
    $start_time = $request->input('start_time');
    $end_time = $request->input('end_time');
    $status = $request->input('status', 1);

    $page = $request->input('page', 1);
    $page_size = $request->input('page_size', 10);

    $query = DB::table('businesses as bus');

    if ($keyword) {//关键字搜索
//      $query->orWhere(['bus.bus_id' => ['like', "'{$keyword}'"], 'bus.bus_account' => ['like', "'{$keyword}'"]], 'like');
    }
    if ($start_time && $end_time) {
      $query->orWhereBetween('created_at', [$start_time, $end_time]);
    }
    $rows = $query
        ->select(['bus.id', 'bus.bus_id', 'bus.bank_account', 'bus.status', 'bus.coins', 'bus.amount'])
        ->where('bus.status', '=', $status)
        //->join('business_coins as bc', 'bus.bus_id', '=', 'bc.bus_id', 'right')
//        ->join('business_coin_logs as bcl', 'bus.bus_id', '=', 'bcl.bus_id', 'left')
        ->orderByDesc('bus.created_at')
        ->forPage($page, $page_size)
        ->get();

    $total = $query->count();

    return ['rows' => $rows, 'total' => $total,
        'search' => [
            'page' => $page,
            'page_size' => $page_size,
        ]];
  }

  /**
   * 添加银商用户
   * @param Request $request
   * @return array
   */
  public function add(Request $request)
  {
    $data = $request->all();

    if (!$request->has('bank_account')
        || empty($data['bank_account'])
        || !$request->has('phone')
        || empty('phone')
    ) {
      return $this->ajax_return(1, '请填写相关信息!');
    }
    if (!$request->has('discount') || empty($data['discount'])) {
      return $this->ajax_return(1, '请填写折扣值!');
    }
    $business = DB::table('businesses')
        ->select(['phone', 'bank_account', 'wechat'])
        ->where('bank_account', '=', $data['bank_account'])
        ->orWhere('phone', '=', $data['phone'])
        ->first();

    if ($business !== null) {
      return $this->ajax_return(1, "账号【{$data['bank_account']}】或手机号【{$data['phone']}】已被注册!");
    }

    $password = '852741';
    if (!empty($data['password'])) {
      $password = $data['password'];
    }

    $oldUser = DB::table('businesses')->select('bank_id')->orderByDesc('id')->first();

    $bus_id = 10000;
    if ($oldUser !== null) {
      $bus_id = ++$oldUser->bus_id;
    }

    $save_data = [
        'bank_id' => $bus_id,
        'bank_account' => $data['bank_account'],
        'password' => Helper::password($password),
        'phone' => $data['phone'],
        'wechat' => $data['wechat'],
        'created_at' => date('Y-m-d H:i:s'),
    ];

    DB::beginTransaction();
    try {
      $result = DB::connection('pgyg')->table('businesses')->insert($save_data);
      $disResult = DB::connection('pgyg')->table('business_dis')->insert(['bank_id' => $bus_id, 'discount' => $data['discount']]);

      if ($result && $disResult) {
        DB::commit();
        return ['errcode' => 0, 'msg' => '添加成功'];
      }
    } catch (\Exception $e) {
      DB::rollBack();
      return ['errcode' => 1, 'msg' => '添加失败' . $e->getMessage()];
    }
    return ['errcode' => 1, 'msg' => '添加失败'];
  }

  /**
   * 银商充值
   * @param Request $request
   * @return array
   */
  public function recharge(Request $request)
  {

    $data = $request->all();
    if (empty($data['bank_id'])) {
      return $this->ajax_return(1, '请填写相关银商ID');
    }
    if (empty($data['coin_number'])) {
      return $this->ajax_return(1, '请输入充值金币数量');
    }
    if (empty($data['amount'])) {
      return $this->ajax_return(1, '请输入充值金额');
    }

    $coinsQuery = DB::table('business_coins');
    $coinsLogQuery = DB::table('business_coin_logs');

    $coinsRow = $coinsQuery->select(['coins', 'amount', 'recharge_total'])
        ->where(['bank_id' => $data['bank_id']])
        ->first();//获取银商充值数据

    $coin_number = 0; //剩余的金币
    $amount = 0; //总充值金额
    $total = 0;

    if ($coinsRow !== null) {
      $coin_number = $coinsRow->coins;
      $amount = $coinsRow->amount;
      $total = ++$coinsRow->total;
    }

    $totalCoins = (intval($data['coin_number']) + $coin_number);
    $totalAmount = (floatval($data['amount']) + $amount);
    $coins = [//银商金币表
        'bank_id' => $data['bank_id'],
        'coins' => $totalCoins, //向平台充值 当前充值数加上原始数据 给游戏用户充值 反之
        'amount' => $totalAmount, //当前金额加上原来金额
        'created_at' => date('Y-m-d H:i:s'),
        'recharge_total' => $total,
        'recharge_coins' => $totalCoins,
        'recharge_amount' => $totalAmount,
        'recharge_last_amount' => floatval($data['amount'])
    ];

    $coinsLogs = [//银商金币充值记录表
        'bank_id' => $data['bank_id'],
        'bank_account' => $data['bank_account'],
        'type' => 2,
        'coin_number' => $data['coin_number'], //当前充值金币
        'coin_synumber' => $totalCoins, //+相加当前金币
        'amount' => $data['amount'], //当前充值的金额
    ];

    $bankUserData = [
        'coins' => $totalCoins,
        'amount' => $totalAmount,
    ];

    DB::beginTransaction();
    try {
      $result = $coinsLogQuery->insert($coinsLogs);
      if ($coinsRow !== null) {
        $coins['update_at'] = date('Y-m-d H:i:s'); //充值时间
        $coinRes = $coinsQuery->where(['bank_id' => $data['bank_id']])
            ->update($coins);
      } else {
        $coins['created_at'] = date('Y-m-d H:i:s');//第一次充值时间
        $coinRes = $coinsQuery->insert($coins);
      }
      //更改银商 金币和金额
      $busRes = DB::table('businesses')->where('bank_id', '=', $data['bank_id'])->update($bankUserData);

      if ($result && $coinRes !== false && $busRes !== false) {
        DB::commit();
        return $this->ajax_return(0, '充值成功!');
      }
    } catch (\Exception $e) {
      DB::rollBack();
      return $this->ajax_return(1, '充值失败' . $e->getMessage());
    }
    return $this->ajax_return(1, '充值失败!');
  }

  /**
   * 银商充值时调用的查询方法
   * @param Request $request
   * @return array|\Illuminate\Database\Eloquent\Model|mixed|null|static
   */
  public function findBusiness(Request $request)
  {
    $bus_id = $request->input('bank_id');
    if (empty($bus_id)) {
      //return ['errcode' => 1, 'msg' => '请输入查询银商ID'];
      return $this->ajax_return(1, '请输入查询的银商ID');
    }

    $buss = DB::table('businesses')
        ->select([
            'bank_id',
            'bank_account',
            'phone',
            'email',
            'qq',
            'wechat',
            'created_at',
        ])->where('bank_id', '=', $bus_id)->first();

    if ($buss === null) {
      return $this->ajax_return(0, '未找到相关用户');
    }
    $buss = json_decode(json_encode($buss), true);
    //查询金币余额
    $coin = DB::table('business_coins')
        ->select(['coins'])->where('bank_id', '=', $bus_id)->first();

    $coins = 0;
    if ($coin !== null) {
      $coins = $coin->coins;
    }
    $buss['coins'] = $coins;

    return $buss;
  }

  /**
   * 银商流水记录
   * @param Request $request
   * @return array
   */
  public function businessLog(Request $request)
  {

    $data = $request->all();
    $page = $request->input('page', 1);
    $page_size = $request->input('page_size', 10);

    $businessLogQuery = DB::table('business_coin_logs');

    if ($request->has('keyword') && !empty($data['keyword'])) {
      $businessLogQuery->where('bank_id');
    }
    if ($request->has('type') && $data['type']) {
      $businessLogQuery->where('type', '=', $data['type']);
    }
    if ($request->has('start_time') && $request->has('end_time')) {
      $businessLogQuery->whereBetween('created_at', [$data['start_time'], $data['end_time']]);
    } else {
      if ($request->has('start_time') && !empty($data['start_time'])) {
        $businessLogQuery->where('created_at', '>', $data['start_time']);
      }
      if ($request->has('end_time') && !empty($data['end_time'])) {
        $businessLogQuery->where('created_at', '<', $data['end_time']);
      }
    }

    $businessData = $businessLogQuery->select([
        'bank_id',
        'bank_account',
        'type',
        'coin_number',
        'coin_synumber',
        'recharge_user',
        'game_id',
        'amount',
    ])->forPage($page, $page_size)->orderByDesc('created_at')->get();

    $total = $businessLogQuery->count();
    $result = [
        'total' => $total,
        'rows' => $businessData,
        'search' => [
            'page' => $page,
            'page_size' => $page_size,
        ]
    ];

    return $this->ajax_return(0, 'success', $result);
  }

  /**
   * 禁用银商账号
   * @param Request $request
   * @return array
   */
  public function disable(Request $request)
  {
    $id = $request->input('id');
    if ($id) {
      $result = DB::table('businesses')->where('id', '=', $id)->update(['status' => 2]);
      if ($result) {
        return $this->ajax_return(0, '操作成功!');
      }
    }
    return $this->ajax_return(1, '操作失败!');
  }

  /**
   * 启用
   * @param Request $request
   * @return array
   */
  public function enable(Request $request)
  {
    $id = $request->input('id');
    if ($id) {
      $result = DB::table('businesses')->where('id', '=', $id)->update(['status' => 1]);
      if ($result) {
        return $this->ajax_return(0, '操作成功!');
      }
    }
    return $this->ajax_return(1, '操作失败!');
  }

  /**
   * 查看银商财务数据
   * @param Request $request
   * @return array
   */
  public function lookInfo(Request $request)
  {
    $bus_id = $request->input('bank_id');
    if ($bus_id) {
      $infoQuery = DB::table('businesses');
      $disQuery = DB::table('business_dis');

      $infoObj = $infoQuery->select([
          'bank_id',
          'coins',//剩余金币
          'bank_account',
          'phone',
          'email',
          'wechat',
          'qq'])->where('bank_id', '=', $bus_id)->first();

      $disObj = $disQuery->select(['discount'])->where('bank_id', '=', $bus_id)->first();

      $platFinance = DB::table('business_coins')->select([
          'recharge_total',
//          'recharge_coins',
          'recharge_amount',
          'recharge_last_amount',
          'updated_at',
      ])->where(['bank_id' => $bus_id])->first(); //查询银商在平台充值的财务信息

//      $userFinance = DB::table('business_coins')->select([
//          'recharge_total',
//          'recharge_coins',
//          'recharge_amount',
//          'recharge_last_amount',
//          'updated_at',
//      ])->where(['bus_id' => $bus_id, 'type' => 1])->first();//查询银商给游戏用户充值的财务信息
//      $userFinance = DB::table('game_user_recharge')
//          ->select('total_count', 'last_time', 'last_amount', DB::raw('SUM(total_amount) as total_amount'))
//          ->where(['bank_id' => $bus_id])->first();
      $total_amount = DB::table('game_user_recharge')->sum('total_amount');
      $total_count = DB::table('game_user_recharge')->sum('total_count');
      $max_time = DB::table('game_user_recharge')->max('last_time');
      $last_amount = DB::table('game_user_recharge')
          ->select('last_amount')
          ->where('bank_id', '=', $bus_id)
          ->orderByDesc('last_time')
          ->first();
      $userFinance['total_amount'] = $total_amount;
      $userFinance['total_count'] = $total_count;
      $userFinance['last_time'] = $max_time;
      $userFinance['last_amount'] = $last_amount;

      if (!$infoObj) {
        return $this->ajax_return(1, '查询失败');
      }
      $infoObj = json_decode(json_encode($infoObj), true);
//      $platFinance = json_decode(json_encode($platFinance), true);
//      $userFinance = json_decode(json_encode($userFinance), true);

      $infoObj['discount'] = $disObj->discount;
      $infoObj['platFinance'] = $platFinance;
      $infoObj['userFinance'] = $userFinance;

      return $this->ajax_return(0, 'success', $infoObj);
    }
  }

  /**
   * 银商代理充值
   * @param Request $request
   * @return array
   */
  public function proxyRecharge(Request $request)
  {
    $game_id = $request->input('game_id', '');
    $game_nickname = $request->input('nickname', '');
    $amount = $request->input('amount', 0);

    if (!$game_id) {
      return $this->ajax_return(1, '请输入游戏用户ID');
    }
    if (!$amount) {
      return $this->ajax_return(1, '请填写你要充值的金额');
    }

    $data = [
        'game_id' => $game_id,
        'game_nickname' => $game_nickname,
        'amount' => $amount,
    ];
    $orderId = 'D' . time() . rand(1000, 9999);
    $coins = $amount * 100;
    $created_at = date('Y-m-d H:i:s');

    $data['created_at'] = $created_at;
    $data['coin_number'] = $coins;
    $data['order_id'] = $orderId;

    $result = DB::table('business_coin_logs')->insert($data);

    if ($result === true) {
      return $this->ajax_return(0, '充值订单已提交成功!');
    }
    return $this->ajax_return(1, '操作失败!');
  }

  /**
   * 代理充值审核
   * @param Request $request
   * @return array
   */
  public function proxyAudit(Request $request)
  {
    $id = $request->input('id', 0);//business_coin_logs 主键
    $status = $request->input('status', 0);
    $remark = $request->input('remark', '');

    if (!$id || !$status) {
      return $this->ajax_return(1, '非法的操作!');
    }

    $coinRow = DB::table('business_coin_logs')->where('id', '=', $id)->first();

    if ($coinRow) {
      DB::beginTransaction();
      try {
        //调用C#接口 修改金币数量

        $coinsLogs = [
            'status' => $status
        ];
        //代理数据操作
        if ($status == 3) { //如果审核不通过
          $coinsLogs['remark'] = $remark;
        }
        // 修改 business_coin_logs 数据库status 字段
        $result = DB::table('business_coin_logs')->where('id', '=', $id)->update($coinsLogs);

        //写入本次充值数据 到game_user_recharge_log
        $userLogs = [
            'order_id' => $coinRow->order_id,
            'bank_id' => $coinRow->bank_id,
            'game_username' => $coinRow->game_username,
            'coins' => $coinRow->coins,
            'amount' => $coinRow->amount,
            'created_at' => $coinRow->created_at,
        ];
        $insRes = DB::table('game_user_recharge_log')->insert($userLogs);

        //更新或者插入 game_user_recharge 表
        $proxyUser = DB::table('game_user_recharge')
            ->where(['bank_id' => $coinRow->bank_id, 'game_id' => $coinRow->game_id])
            ->first();
        $userReCharge = [
            'total_amount' => ($proxyUser->total_amount + $coinRow->amount), //原始金额+本次代理充值的金额
            'total_count' => ++$proxyUser->total_count,
            'last_amount' => $coinRow->amount,
            'last_time' => $coinRow->created_at
        ];
        if ($proxyUser) {
          $updRes = DB::table('game_user_recharge')
              ->where(['bank_id' => $coinRow->bank_id, 'game_id' => $coinRow->game_id])
              ->update($userReCharge);
        } else {
          $userReCharge['bank_id'] = $coinRow->bank_id;
          $userReCharge['game_id'] = $coinRow->game_id;
          $updRes = DB::table('game_user_recharge')
              ->insert($userReCharge);
        }

        if ($result !== false && $insRes !== false && $updRes !== false) {
          DB::commit();
          return $this->ajax_return(0, '操作成功!');
        }
      } catch (\Exception $e) {
        DB::rollBack();
        return $this->ajax_return(1, '充值失败!');
      }
    }
    return $this->ajax_return(1, '操作失败!');
  }
}