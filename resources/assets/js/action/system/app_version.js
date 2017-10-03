/**
 * Created by lrx on 2017/7/11.
 */

import React from 'react'
import * as utilAction from '../util';

export function versionInit() {
    window.ajax.post(window.config.root + '/setting/app_version', function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "VERSION_INIT",
                payload: ret.data
            });
        }
    });
}

export function upFile(form) {
    window.ajax.post(window.config.root + '/setting/app_version/upload',form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}

export function updateVersion(form) {
    window.ajax.post(window.config.root + '/setting/app_version/update_version',form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
