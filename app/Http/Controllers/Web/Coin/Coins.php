<?php

namespace App\Http\Controllers\Web\Coin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: YRW
 * Date: 2017/10/2
 * Time: 11:34
 */
class Coins extends AbsCoinManage
{

  /**
   * 金币流水
   * @param Request $request
   * @return array
   */
  public function execute(Request $request)
  {
    // TODO: Implement execute() method.
    $time = $request->input('time');
    $type = $request->input('type');

    $page = $request->input('page', 1);
    $page_size = $request->input('page_size', 10);

    $query = DB::table('coin');

    if ($time) {
      $query->where('create_at', '>=', $time[0]);
    }
    if ($type) {
      $query->where('type', '<=', $time[1]);
    }

    $coins = $query->select()
        ->orderByDesc('create_at')
        ->forPage($page, $page_size)
        ->get();

    $count = $query->count();

    return ['rows' => $coins, 'total' => $count, 'search' => [
        'page' => $page,
        'page_size' => $page_size,
    ]];
  }

}