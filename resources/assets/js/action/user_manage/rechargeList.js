/**
 * Created by sucksuck on 2017/3/8.
 */
import * as utilAction from '../util'
import React from 'react'

export function getList(form) {
    window.ajax.post(window.config.root + '/gameuser/game_user_info', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg)
        } else {
            window.store.dispatch({
                type: "USER_MANAGE_RECHARGE_LIST",
                payload: ret.data
            })
        }
    })
}
