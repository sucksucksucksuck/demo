<?php

namespace App\Http\Controllers\Web\GameUser;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Created by PhpStorm.
 * User: YRW
 * Date: 2017/10/3
 * Time: 19:47
 */
class GameUserInfo extends AbsGameUserManag
{

  public function execute(Request $request)
  {
    // TODO: Implement execute() method.

    $keyword = $request->input('keyword', '');
    $alipay = $request->input('alipay', '');
    $page = $request->input('page', 1);
    $page_size = $request->input('page_size', 10);

    $query = DB::table('game_user');

    if ($keyword) {
      //$query->where('');
    }
    if ($alipay) {
      $query->where('bind_alipay', '=', $alipay);
    }

    $infos = $query->orderByDesc('updated_at')->forPage($page, $page_size)->get();

    $data = [
        'total' => $query->count(),
        'rows' => $infos,
        'search' => [
            'page' => $page,
            'page_size' => $page_size,
        ]
    ];

    return $this->ajax_return(0, 'success', $data);
  }
}