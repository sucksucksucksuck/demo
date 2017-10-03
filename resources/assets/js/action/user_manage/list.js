/**
 * Created by sucksuck on 2017/3/8.
 */
import * as utilAction from '../util'
import React from 'react'

//获取银商列表
export function getList(form) {
    window.ajax.post(window.config.root + '/gameuser/game_user_info', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg)
        } else {
            window.store.dispatch({
                type: "USER_MANAGE_LIST",
                payload: ret.data
            })
        }
    })
}
