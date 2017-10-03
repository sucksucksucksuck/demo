
import React from 'react'
import OffShelf from '../../view/index/tab_content/system/off_shelf'
import * as utilAction from '../util';

export function initConfig() {
    window.ajax.post(window.config.root + '/setting/system_setting', function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "CONFIG_INIT",
                payload: ret.data
            });
        }
    });
}
export function editConfig(form) {
    window.ajax.post(window.config.root + '/setting/system_setting/edit',form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            console.log(ret.msg);
        }
    });
}
/*下架*/
export function offShelf() {
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "offShelf",
            fade: true,
            view: <OffShelf/>
        }
    });
}
/*关窗*/
export function offShelfClose() {
    window.store.dispatch({
        type: "DIALOG_CLOSE",
        payload: "offShelf"
    });
}