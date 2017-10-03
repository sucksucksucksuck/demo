import React from 'react';
import * as utilAction from '../util';
import ChangeType from './../../view/index/tab_content/user/change_type'
//获取列表
export function userList(form) {
    window.ajax.post(window.config.root + '/user_manage/default_alipay', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "DEFAULT_PAY_INIT",
                payload: ret.data
            });
        }
    });
}

//解绑
export function unbundling(form) {
    window.ajax.post(window.config.root + '/user_manage/default_alipay/relieveAlipay', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            console.log(ret.msg);
            userList()
        }
    });
}
/*离开清除数据*/
export function defaultPayClear() {
    window.store.dispatch({
        type: "DEFAULT_PAY_CLEAR"
    });
}