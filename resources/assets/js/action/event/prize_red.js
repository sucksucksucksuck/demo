/**
 * Created by sucksuck on 2017/5/27.
 */
import React from 'react';
import * as utilAction from '../util';
import RedInfo from '../../view/index/tab_content/event/prize_red_info';

//红包奖品设置
export function getPrizeRed(id) {
    window.ajax.post(window.config.root + '/event_manage/prize_red', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "EVENT_PRIZE_RED_INIT",
                payload: ret.data
            });
        }
    });
}

//红包弹窗
export function redPopUp(id, event_id, search) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("edit_red");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "edit_red",
            fade: true,
            view: <RedInfo onClick={call} id={id} event_id={event_id} search={search}/>
        }
    });
}

//删除红包奖品信息
export function delPrizeRed(form, search) {
    window.ajax.post(window.config.root + '/event_manage/prize_red/del', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            getPrizeRed(search);
        }
    });
}