<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/18
 * Time: 9:33
 */

namespace app\Http\Controllers\Notify;


use App\Common\Helper;
use App\Common\Prize;
use App\Exceptions\Handler;
use App\Http\Controllers\Event\Common;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SyncData
{

    /**
     * @param Request $request
     * @return string
     */
    public function recharge(Request $request)
    {
        if ($request->ip() != config('app.old_ip')) {
            return 'no';
        }
        $user_id = $request->get('user_id');
        $amount = $request->get('amount');
        Common::recharge($user_id, $amount);
//        return 'ok';
    }

    /**
     * 当用户消费成功后会调用这个接口
     * @param Request $request
     * @return string
     */
    public function consumer(Request $request)
    {
        if ($request->ip() != config('app.old_ip')) {
            return 'no';
        }
        $user_id = $request->get('user_id');
        $amount = $request->get('amount');
        Common::consumer($user_id, $amount);
        return 'ok';
    }

    /**
     * 用户注册
     * @param Request $request
     * @return string
     */
    public function register(Request $request)
    {
        if ($request->ip() != config('app.old_ip')) {
            return 'no';
        }
        $user_id = $request->get('user_id');
        Common::register($user_id);
        return 'ok';
    }

    /**
     * 用户关注
     * @param Request $request
     * @return string
     */
    public function follow(Request $request)
    {
        if ($request->ip() != config('app.old_ip')) {
            return 'no';
        }
        $user_id = $request->get('user_id');
        $ret = Common::follow($user_id);
        if (count($ret) > 0) {
            return json_encode($ret[0], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }
        return '{}';
    }

    public function dataSync(Request $request)
    {
        // echo $request->getClientIp();
//        $red_list = DB::table('red')->select(['id'])->where(['event_id' => 2])->whereRaw('json_extract(rule,\'$.amount\') = ?', [50])->get();
//        foreach ($red_list as $v) {
//            Prize::red(300200, $v->id);
//        }

        //Prize::red(292830, 226);//'ep.type = 3 and up.create_at>\'2017-04-25\' and up.create_at < \'2017-04-25 18:04:00\''
        // Common::recharge(297056   , 50);
//        $data = DB::table('user_prize as up')
//            ->select(['up.user_id', 'ep.prize', 'ep.title'])
//            ->leftJoin('event_prize as ep', 'up.prize_id', '=', 'ep.id')
//            ->where(['ep.type' => 3])
//            ->where('up.create_at', '>', '2017-04-25')
//            ->where('up.create_at', '<', '2017-04-25 18:04:00')
//            ->get();
//        foreach ($data as $d) {
//            Prize::red($d->user_id, $d->prize);
//        }
//        echo 'ok';
    }
}