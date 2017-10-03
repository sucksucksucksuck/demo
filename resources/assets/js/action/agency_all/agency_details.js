/**
 * Created by sucksuck on 2017/10/3 20:03.
 */
import * as utilAction from '../util'
import React from 'react'

export function getList(form) {
    window.ajax.post(window.config.root + '/businesses/businesses/look_info', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg)
        } else {
            window.store.dispatch({
                type: "AGENCY_INFO_INIT",
                payload: ret.data
            })
        }
    })
}
