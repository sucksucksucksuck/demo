/**
 * Created by lrx on 2017/5/19.
 */

import React from 'react'
import ReleaseSystem from '../../view/index/tab_content/system/release_system'
import * as utilAction from '../util';


export function releaseSystem(callback) {
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "releaseConfig",
            fade: true,
            view: <ReleaseSystem onConfirm={callback}/>
        }
    });
}
//密码确认
export function pwdSure(form,callback) {
    window.ajax.post(window.config.root + '/setting/release_setting/release',form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            callback();
        }
    });
}

/*关窗*/
export function releaseClose() {
    window.store.dispatch({
        type: "DIALOG_CLOSE",
        payload: "releaseConfig"
    });
}