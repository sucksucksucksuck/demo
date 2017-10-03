/**
 * Created by sucksuck on 2017/6/5.
 */
import * as utilAction from '../util';
import * as eventAction from './display';

//活动设置获取id
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
//关联活动 获取活动url
export function getEventUrlList(form) {
    window.ajax.post(window.config.root + '/event_manage/display', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "EVENT_LIST_URL_INIT",
                payload: ret.data
            });
        }
    });
}

//获取关联信息
export function getAssociateInfo(id) {
    window.ajax.post(window.config.root + '/event_manage/display_info', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "ASSOCIATED_EVENT_INFO_INIT",
                payload: ret.data
            });
        }
    });
}

//保存关联活动
export function setAssociateEvent(form, search) {
    window.ajax.post(window.config.root + '/event_manage/display_info/edit_event_id', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("associate_event_id");
            eventAction.getEventDisplayList(search);

        }
    });
}
//清除关联活动信息
export function clear() {
    window.store.dispatch({
        type: "ASSOCIATED_EVENT_INFO_CLEAR",
    });
}
