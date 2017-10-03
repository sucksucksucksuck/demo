/**
 * Created by sucksuck on 2017/5/31.
 */
import React from 'react';
import * as utilAction from '../util';
import EventImageUpload from "../../view/index/tab_content/event/event_img_upload";
//活动内容详情
export function getEventInfo(id) {
    window.ajax.post(window.config.root + '/event_manage/display_info', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "EVENT_DISPLAY_INFO_INIT",
                payload: ret.data
            });
        }
    });
}
//新增活动内容详情
export function createEvent(form) {
    window.ajax.post(window.config.root + '/event_manage/display_info/create', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.history.back();
        }
    });
}
//修改活动内容详情
export function setEventInfo(form) {
    window.ajax.post(window.config.root + '/event_manage/display_info/edit', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.history.back();
        }
    });
}
//清空信息
export function clear() {
    window.store.dispatch({
        type: "EVENT_DISPLAY_INFO_CLEAR",
    });
}
export function imageUpload(callback){
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("eventImageUpload");
        }
        if (type === "ok" && callback) {
            if (callback(type) === true) {
                utilAction.close("eventImageUpload");
            }
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "eventImageUpload",
            fade: true,
            view: <EventImageUpload onClick={call} onSelected={callback}/>
        }
    });
}