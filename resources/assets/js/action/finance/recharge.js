/**
 * Created by sucksuck on 2017/10/2 18:13.
 */
import * as utilAction from '../util'
import React from 'react'

export function getList(form) {
    window.ajax.post(window.config.root + '/businesses/businesses/find_business', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg)
        } else {
            window.store.dispatch({
                type: "FINANCE_RECHARGE",
                payload: ret.data
            })
        }
    })
}

export function recharge(form) {
    window.ajax.post(window.config.root + '/businesses/businesses/recharge', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg)
        } else {
            utilAction.prompt(ret.msg)
        }
    })
}
export function clear() {
    window.store.dispatch({
        type: "CLEAR",
    })
}