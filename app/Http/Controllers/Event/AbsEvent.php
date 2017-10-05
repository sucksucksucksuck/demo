<?php
/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/4/13
 * Time: 16:50
 */

namespace App\Http\Controllers\Event;


abstract class AbsEvent
{
    public $begin_at;
    public $end_at;
    public $event;
    public $user_event = null;
    public $page_size = 10;

    public function recharge($user_id, $amount)
    {

    }

    /**
     * 当用户消费成功后会调用这个接口
     * @param $user_id
     * @param $amount
     */
    public function consumer($user_id, $amount)
    {

    }

    /**
     * 用户注册
     * @param $user_id
     */
    public function register($user_id)
    {

    }

    /**
     * 用户关注
     * @param $user_id
     */
    public function follow($user_id)
    {

    }

    abstract function init($user);

    abstract function luckDraw($user, $type = 'default');

    abstract function record($user, $page = 1);

    protected function event_at()
    {
        if (!$this->event) {
            throw new \Exception('活动已下架', 6103);
            // echo json_encode(['errcode'=>,'msg'=>''],JSON_UNESCAPED_UNICODE);
            //  exit;
        }

        if ($this->begin_at && $this->begin_at > date('Y-m-d H:i:s')) {
            throw new \Exception('活动还没开始', 6101);
            // echo json_encode(['errcode'=>,'msg'=>''],JSON_UNESCAPED_UNICODE);
            //  exit;
        }

        if ($this->end_at && $this->end_at < date('Y-m-d H:i:s')) {
            throw new \Exception('活动已经结束', 6102);
            // echo json_encode(['errcode'=>6102,'msg'=>''],JSON_UNESCAPED_UNICODE);
            // exit;
        }
    }

    protected function addUserEvent($user_id, $event_id, $extend = [])
    {
        $data = [];
        $data['user_id'] = $user_id;
        $data['event_id'] = $event_id;
        $data['update_at'] = date('Y-m-d H:i:s');

        $data['extend'] = json_encode($extend);
        return \DB::table('user_event')->insertGetId($data);
    }

    protected function getUserEvent($user_id, $event_id,$user_extend = [])
    {
        $this->user_event = \DB::table('user_event')->where([['user_id', $user_id], ['event_id', $event_id]])->first();
        if (!$this->user_event) {
            $user_event_id = $this->addUserEvent($user_id, $event_id, $user_extend);
            $this->user_event = \DB::table('user_event')->where('id', $user_event_id)->first();
            $this->user_event->extend = json_decode($this->user_event->extend??'[]', true);
        } else {
            $this->user_event->extend = json_decode($this->user_event->extend??'[]', true);
        }

    }
}