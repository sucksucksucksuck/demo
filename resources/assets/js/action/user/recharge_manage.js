/**
 * Created by lrx on 2017/6/2.
 */
import React from 'react';
import * as utilAction from '../util';
//获取列表
export function getList(form) {
    window.ajax.post(window.config.root + '/user_manage/pay_manage', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "PAY_MANAGE_INIT",
                payload: ret.data
            });
        }
    });
}
/*充值金额*/
export function onRechargeAmountClick(form) {
    window.ajax.post(window.config.root + '/user_manage/pay_manage/recharge_amount', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            getList({id:form.id})
        }
    });
}
/*充值积分*/
export function onRechargeIntegralClick(form) {
    window.ajax.post(window.config.root + '/user_manage/pay_manage/recharge_integral', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            getList({id:form.id})
        }
    });
}
/*离开清除数据*/
export function clearData() {
    window.store.dispatch({
        type: "CLEAR_DATA"
    });
}