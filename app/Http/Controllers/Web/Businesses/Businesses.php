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
        ->select(['bus.id', 'bus.bus_id', 'bus.bus_account', 'bus.status', 'bus.coins', 'bus.amount'])
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

    if (!$request->has('bus_account')
        || empty($data['bus_account'])
        || !$request->has('phone')
        || empty('phone')
    ) {
      return $this->ajax_return(1, '请填写相关信息!');
    }
    $business = DB::table('businesses')
        ->select(['phone', 'bus_account', 'wechat'])
        ->where('bus_account', '=', $data['bus_account'])
        ->orWhere('phone', '=', $data['phone'])
        ->toSql();

    if ($business !== null) {
      return $this->ajax_return(1, "账号【{$data['bus_account']}】或手机号【{$data['phone']}】已被注册!");
    }

    $password = '852741';
    if (!empty($data['password'])) {
      $password = $data['password'];
    }

    $oldUser = DB::table('businesses')->select('bus_id')->orderByDesc('id')->first();

    $bus_id = 10000;
    if ($oldUser !== null) {
      $bus_id = ++$oldUser->bus_id;
    }

    $save_data = [
        'bus_id' => $bus_id,
        'bus_account' => $data['bus_account'],
        'password' => Helper::password($password),
        'phone' => $data['phone'],
        'wechat' => $data['wechat'],
        'created_at' => date('Y-m-d H:i:s'),
    ];

    try {
      $result = DB::table('businesses')
          ->insert($save_data);
      $disResult = DB::table('business_dis')->insert(['b_id' => $bus_id, 'discount' => $data['discount']]);

      DB::commit();
      if ($result && $disResult) {
        return ['errcode' => 0, 'msg' => '添加成功'];
      }
    } catch (\Exception $e) {
      DB::rollBack();
      return ['errcode' => 1, 'msg' => '添加失败'];
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
    if (empty($data['bus_id'])) {
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
        ->where('bus_id', '=', $data['bus_id'])
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
        'bus_id' => $data['bus_id'],
        'coins' => $totalCoins, //向平台充值 当前充值数加上原始数据 给游戏用户充值 反之
        'amount' => $totalAmount, //当前金额加上原来金额
        'created_at' => date('Y-m-d H:i:s'),
        'recharge_total' => $total,
        'recharge_coins' => $totalCoins,
        'recharge_amount' => $totalAmount,
        'recharge_last_amount' => floatval($data['amount'])
    ];

    $coinsLogs = [//银商金币充值记录表
        'bus_id' => $data['bus_id'],
        'bus_account' => $data['bus_account'],
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
        $coinRes = $coinsQuery->where(['bus_id' => $data['bus_id'], 'type' => 2])
            ->update($coins);
      } else {
        $coins['created_at'] = date('Y-m-d H:i:s');//第一次充值时间
        $coins['type'] = 2;
        $coinRes = $coinsQuery->insert($coins);
      }
      //更改银商 金币和金额
      $busRes = DB::table('businesses')->where('bus_id', '=', $data['bus_id'])->update($bankUserData);

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
    $bus_id = $request->input('bus_id');
    if (empty($bus_id)) {
      //return ['errcode' => 1, 'msg' => '请输入查询银商ID'];
      return $this->ajax_return(1, '请输入查询的银商ID');
    }

    $buss = DB::table('businesses')
        ->select([
            'bus_id',
            'bus_account',
            'phone',
            'email',
            'qq',
            'wechat',
            'created_at',
        ])->where('bus_id', '=', $bus_id)->first();

    if ($buss === null) {
      return $this->ajax_return(0, '未找到相关用户');
    }
    $buss = json_decode(json_encode($buss), true);
    //查询金币余额
    $coin = DB::table('business_coins')
        ->select(['coins'])->where('bus_id', '=', $bus_id)->first();

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
      $businessLogQuery->where('bus_id');
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
        'bus_id',
        'bus_account',
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
    $bus_id = $request->input('bus_id');
    if ($bus_id) {
      $infoQuery = DB::table('businesses');
      $disQuery = DB::table('business_dis');

      $infoObj = $infoQuery->select([
          'bus_id',
          'coins',//剩余金币
          'bus_account',
          'phone',
          'email',
          'wechat',
          'qq'])->where('bus_id', '=', $bus_id)->first();

      $disObj = $disQuery->select(['discount'])->where('b_id', '=', $bus_id)->first();

      $platFinance = DB::table('business_coins')->select([
          'recharge_total',
          'recharge_coins',
          'recharge_amount',
          'recharge_last_amount',
          'updated_at',
      ])->where(['bus_id' => $bus_id, 'type' => 2])->first(); //查询银商在平台充值的财务信息

      $userFinance = DB::table('business_coins')->select([
          'recharge_total',
          'recharge_coins',
          'recharge_amount',
          'recharge_last_amount',
          'updated_at',
      ])->where(['bus_id' => $bus_id, 'type' => 1])->first();//查询银商给游戏用户充值的财务信息

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
}