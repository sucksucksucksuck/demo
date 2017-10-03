/**
 * Created by sucksuck on 2017/5/25.
 */
import React from 'react';
import * as utilAction from '../util';

//活动设置
export function getEventList(form) {
    window.ajax.post(window.config.root + '/event_manage/manage/event_list', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "EVENT_LIST_INIT",
                payload: ret.data
            });
        }
    });
}

//清空信息
export function clear() {
    window.store.dispatch({
        type: "EVENT_DISPLAY_INFO_CLEAR",
    });
}

export function prizeInfoClear() {
    window.store.dispatch({
        type: "PRIZE_INFO_CLEAR",
    });
}





