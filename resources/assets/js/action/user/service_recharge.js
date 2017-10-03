/*
 * Created by lrx on 2017/6/5.
 */
import React from 'react';
import * as utilAction from '../util';
//获取列表
export function getList(form) {
    window.ajax.post(window.config.root + '/user_manage/customer_service_pay', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "SERVICE_RECHARGE_INIT",
                payload: ret.data
            });
        }
    });
}
/*充值金额*/
export function onRechargeAmountClick(form) {
    window.ajax.post(window.config.root + '/user_manage/customer_service_pay/recharge_amount', form, function (ret) {
        if (ret.errcode) {
            window.store.dispatch({
                type: "ERROR",
                payload: ret.msg
            });
        } else {
            console.log(ret.msg);
            getList();
        }
    });
}

/*离开清除数据*/
export function clearData() {
    window.store.dispatch({
        type: "CLEAR_DATA"
    });
}