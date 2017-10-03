import React from 'react';
import * as utilAction from '../util';
import ChangeType from './../../view/index/tab_content/user/change_type'
//获取列表
export function userList(form) {
    window.ajax.post(window.config.root + '/user_manage/user_manage', form, function (ret) {
        if (ret.errcode) {
            window.store.dispatch({
                type: "ERROR",
                payload: ret.msg
            });
        } else {
            window.store.dispatch({
                type: "USER_MANAGE_INIT",
                payload: ret.data
            });
        }
    });
}
//编辑类型
export function getType(form,search) {
    window.ajax.post(window.config.root + '/user_manage/user_manage/edit_user_type', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            userList(search);
            console.log(ret.msg);
        }
    });
}

//修改类型开窗
export function openChangeType(item,change,search) {
    let close = function (type) {
        if(type === "cancel"){
            utilAction.close("changeType")
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "changeType",
            fade: true,
            view: <ChangeType onClick={close} item={item} search={search} changes={change}/>
        }
    });
}
//修改类型关窗
export function typeClose() {
    window.store.dispatch({
        type: "DIALOG_CLOSE",
        payload: "changeType"
    });
}
//解绑
export function unbundling(form,search) {
    window.ajax.post(window.config.root + '/user_manage/user_manage/relievePhone', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
            userList(search);
        } else {
            userList(search);
            console.log(ret.msg);

        }
    });
}

//禁用
export function enable(form,search) {
    window.ajax.post(window.config.root + '/user_manage/user_manage/disable_account', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
            userList(search);
        } else {
            userList(search);
        }
    });
}

/*离开清除数据*/
export function userManageClear() {
    window.store.dispatch({
        type: "USER_MANAGE_CLEAR"
    });
}
