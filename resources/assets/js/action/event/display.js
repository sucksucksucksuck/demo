/**
 * Created by sucksuck on 2017/5/25.
 */
import React from 'react';
import * as utilAction from '../util';
import AssociateContent from '../../view/index/tab_content/event/associate_content';
import AssociateUrl from '../../view/index/tab_content/event/associate_url';
import AssociateGoods from '../../view/index/tab_content/event/associate_goods';
import AssociateEventId from '../../view/index/tab_content/event/associate_event_id';
import Color from '../../modules/color/dialog';
import ImageUpload from '../../modules/image/upload';
//活动展示
export function getEventDisplayList(form) {
    window.ajax.post(window.config.root + '/event_manage/display', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "EVENT_DISPLAY_LIST_INIT",
                payload: ret.data
            });
        }
    });
}

//修改活动状态
export function changeStatus(form, search) {
    window.ajax.post(window.config.root + '/event_manage/display/status', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            getEventDisplayList(search);
        }
    });
}



//关联链接弹窗
export function associateUrl(event_id, search,callback) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("associate_url");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "associate_url",
            fade: true,
            view: <AssociateUrl onClick={call} event_id={event_id} search={search} onSelected={callback}/>
        }
    });
}



//关联活动弹窗
export function associateEventId(event_id, search, callback) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("associate_event_id");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "associate_event_id",
            fade: true,
            view: <AssociateEventId onClick={call} onSelected={callback} event_id={event_id} search={search}/>
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
            getEventDisplayList(search);

        }
    });
}

//关联专栏弹窗
export function associateContent(event_id, search) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("associate_content");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "associate_content",
            fade: true,
            view: <AssociateContent onClick={call} event_id={event_id} search={search}/>
        }
    });
}



//关联商品弹窗
export function associateGoods(event_id, search,callback) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("associate_goods");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "associate_goods",
            fade: true,
            view: <AssociateGoods onClick={call} event_id={event_id} onSelected={callback} search={search}/>
        }
    });
}

export function color(callback) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("color");
        }
        if (type === "ok" && callback) {
            if (callback(type) === true) {
                utilAction.close("confirm");
            }
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "color",
            fade: true,
            view: <Color onClick={call} onButtonClick={callback}/>
        }
    });
}

export function imageUpload(callback,event_id,url){
    console.log(event_id, url);
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("imageUpload");
        }
        if (type === "ok" && callback) {
            if (callback(type) === true) {
                utilAction.close("imageUpload");
            }
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "imageUpload",
            fade: true,
            view: <ImageUpload onClick={call} event_id={event_id} onSelected={callback} url={url}/>
        }
    });
}

