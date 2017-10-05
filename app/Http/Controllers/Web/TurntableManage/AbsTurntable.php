<?php

namespace App\Http\Controllers\Web\TurntableManage;

use App\Http\Controllers\Web\AbsResponse;


abstract class AbsTurntable extends AbsResponse
{
    public $event_id = 5;
    public $event = [101, 102, 103, 104, 105, 106, 107, 108];
    public $turntable_name = ['幸运大转盘', '豪华大转盘', '至尊大转盘', '荣耀大转盘', '铂金大转盘', '钻石大转盘', '王者大转盘', '财神大转盘'];
}
