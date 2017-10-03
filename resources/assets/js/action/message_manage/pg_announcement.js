/**
 * Created by sucksuck on 2017/8/9.
 */

import React from 'react';
import * as utilAction from '../util';
import CreateAnnouncement from '../../view/index/tab_content/message_manage/create_announcement';

//获取列表
export function getList(form) {
    window.ajax.post(window.config.root + '/message_manage/pangu_message', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "PG_ANNOUNCEMENT_INIT",
                payload: ret.data
            });
        }
    });
}

/*离开清除数据*/
export function clearData() {
    window.store.dispatch({
        type: "PG_ANNOUNCEMENT_INFO_CLEAR"
    });
}

//新增推送消息
export function createAnnouncement(id, search) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("createAnnouncement");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "createAnnouncement",
            fade: true,
            view: <CreateAnnouncement onClick={call} id={id} search={search}/>
        }
    });
}


export function saveAnnouncement(form, search) {
    window.ajax.post(window.config.root + '/message_manage/pangu_message/create', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("createAnnouncement");
            getList(search);
        }
    });
}

export function editAnnouncement(form, search) {
    window.ajax.post(window.config.root + '/message_manage/pangu_message/edit', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("createAnnouncement");
            getList(search);
        }
    });
}

export function getInfo(form) {
    window.ajax.post(window.config.root + '/message_manage/pangu_message/get_info', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "PG_ANNOUNCEMENT_INFO_INIT",
                payload: ret.data
            });
        }
    });
}

export function delMessage(form,search) {
    window.ajax.post(window.config.root + '/message_manage/pangu_message/del', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
           getList(search)
        }
    });
}


