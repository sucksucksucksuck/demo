/**
 * Created by sucksuck on 2017/8/9.
 */

import React from 'react';
import * as utilAction from '../util';
import CreatePushMsg from '../../view/index/tab_content/message_manage/create_push_msg';

//获取列表
export function getList(form) {
    window.ajax.post(window.config.root + '/message_manage/push_message', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "PUSH_MESSAGE_INIT",
                payload: ret.data
            });
        }
    });
}

/*离开清除数据*/

//新增推送消息
export function createPushMsg(search) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("createPushMsg");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "createPushMsg",
            fade: true,
            view: <CreatePushMsg onClick={call} search={search}/>
        }
    });
}

export function savePushMsg(form,search) {
    window.ajax.post(window.config.root + '/message_manage/push_message/create', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("createPushMsg");
            getList(search);
        }
    });
}
export function clearData() {
     window.store.dispatch({
        type: "PG_ANNOUNCEMENT_INFO_CLEAR"
    });
}