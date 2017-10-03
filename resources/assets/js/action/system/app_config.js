
import React from 'react'
import * as utilAction from '../util';

//支付
export function initConfig() {
    window.ajax.post(window.config.root + '/setting/app_pay_setting', function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "APP_INIT",
                payload: ret.data
            });
            serviceInit()
        }
    });
}

export function updateStatus(form) {
    window.ajax.post(window.config.root + '/setting/app_pay_setting/update_status',form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            console.log(ret.msg);
        }
    });
}

export function updateVersion(form) {
    console.log(form);
    window.ajax.post(window.config.root + '/setting/app_pay_setting/update_version',form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            console.log(ret.msg);
            initConfig()
        }
    });
}
//客服
export function serviceInit() {
    window.ajax.post(window.config.root + '/setting/customer_service_setting', function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "SERVICE_INIT",
                payload: ret.data
            });
        }
    });
}

export function serviceStatus(form) {
    window.ajax.post(window.config.root + '/setting/customer_service_setting/update_status',form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            console.log(ret.msg);
        }
    });
}

export function serviceVersion(form) {
    window.ajax.post(window.config.root + '/setting/customer_service_setting/update_version',form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            console.log(ret.msg);
            serviceInit()
        }
    });
}
//标签
export function upGoodsTag(form) {
    console.log(form);
    window.ajax.post(window.config.root + '/setting/app_pay_setting/up_goods_tag',form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            serviceInit()
        }
    });
}
//排序
export function sortUpdate(form) {
    console.log(form);
    window.ajax.post(window.config.root + '/setting/app_pay_setting/update_sort',form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            console.log(ret);
        }
    });
}