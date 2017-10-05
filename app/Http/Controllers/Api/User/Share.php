<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/7/25
 * Time: 13:51
 */

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Api\AbsResponse;

//分享
class Share extends AbsResponse
{
    public function execute(array $params)
    {
        $data = [
            'name' => 'share_modal',
            'url' => 'widget://html/new_win.html',
            'animation' => [
                'type' => 'none'
            ],
            'bgColor' => 'rgba(0,0,0,0.65)',
            'vScrollBarEnabled' => false,
            'bounces' => false,
            'pageParam' => [
                'script' => './lib/user/personal/share/index.js',
                'content' => [
                    'title' => '盘古云购',
                    'describe' => '时下热门众筹APP，1元购出惊喜 每日签到得积分，更有机会0元中宝马，...',
                    'url' => 'http://www.gz.lq.pgyg.com/',
                    'icon' => url('/image/share/logo.png')
                ]
            ]
        ];

        return ['errcode' => 0, 'msg' => '', 'data' => $data];
    }

}