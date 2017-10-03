/**
 * Created by sucksuck on 2017/8/9.
 */

import React from 'react';
import * as utilAction from '../util';
import CreatestationMsg from '../../view/index/tab_content/message_manage/create_station_msg';

//获取列表
export function getList(form) {
    window.ajax.post(window.config.root + '/message_manage/station_message', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "STATION_MESSAGE_INIT",
                payload: ret.data
            });
        }
    });
}

/*离开清除数据*/
export function clearData() {
    window.store.dispatch({
        type: "CLEAR_DATA"
    });
}

//新增推送消息
export function createstationMsg(search) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("createstationMsg");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "createstationMsg",
            fade: true,
            view: <CreatestationMsg onClick={call} search={search}/>
        }
    });
}

export function saveStationMsg(form,search) {
    window.ajax.post(window.config.root + '/message_manage/station_message/create', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("createstationMsg");
            getList(search);

        }
    });
}

export function delMessage(form,search) {
    window.ajax.post(window.config.root + '/message_manage/station_message/del', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            getList(search)
        }
    });
}