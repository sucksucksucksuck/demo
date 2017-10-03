/**
 * Created by lrx on 2017/5/31.
 */
import React from 'react';
import * as utilAction from '../util';
import CreateService from './../../view/index/tab_content/user/create_service';
import EditService from './../../view/index/tab_content/user/edit_service';
//获取列表
export function userList(form) {
    window.ajax.post(window.config.root + '/user_manage/customer_service_manage', form, function (ret) {
        if (ret.errcode) {
            console.log(ret.msg);
            window.store.dispatch({
                type: "ERROR",
                payload: ret.msg
            });
        } else {
            window.store.dispatch({
                type: "SERVICE_MANAGE_INIT",
                payload: ret.data
            });
        }
    });
}

//修改金额
export function changeAmount(form,search) {
    window.ajax.post(window.config.root + '/user_manage/customer_service_manage/recharge_amount', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            userList(search);

        }
    });
}
//修改类型
export function changeType(form,search) {
    window.ajax.post(window.config.root + '/user_manage/customer_service_manage/edit_user_type', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            console.log(ret.msg);
            userList(search);
        }
    });
}
//修改备注
export function changeRemark(form,search) {
    window.ajax.post(window.config.root + '/user_manage/customer_service_manage/remark', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            console.log(ret);
            userList(search);

        }
    });
}
//修改昵称
export function changeNickname(form,search) {
    window.ajax.post(window.config.root + '/user_manage/customer_service_manage/edit_nick_name', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            console.log(ret);
            userList(search);

        }
    });
}
//解绑
export function unbundling(form,search) {
    window.ajax.post(window.config.root + '/user_manage/customer_service_manage/relieve_phone', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            userList(search);
        }
    });
}
/*离开清除数据*/
export function serviceManageClear() {
    window.store.dispatch({
        type: "SERVICE_MANAGE_CLEAR"
    });
}

//禁用
export function enable(form,search) {
    window.ajax.post(window.config.root + '/user_manage/customer_service_manage/disable_account', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
            userList(search);
        } else {
            userList(search);
        }
    });
}
//新增客服号弹窗
export function openCreateService(search) {
    let close = function (type) {
        if(type === "cancel"){
            utilAction.close("createService");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "createService",
            fade: true,
            view: <CreateService onClick={close} search={search}/>
        }
    });
}
//编辑客服号弹窗
export function openEditService(data) {
    let close = function (type) {
        if(type === "cancel"){
            utilAction.close("editService")
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "editService",
            fade: true,
            view: <EditService onClick={close} data={data} />
        }
    });
}

//新建客服号
export function createService(form,search) {
    window.ajax.post(window.config.root + '/user_manage/customer_service_manage/create', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("createService");
            openEditService(ret.data);
            userList(search);
        }
    });
}