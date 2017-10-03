/**
 * Created by sucksuck on 2017/3/8.
 */

import * as utilAction from '../util'
import React from 'react'
import AgencyRecharge from '../../view/index/tab_content/agency/agency_recharge'

//获取银商列表
export function getList(form) {
    window.ajax.post(window.config.root + '/businesses/businesses', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg)
        } else {
            window.store.dispatch({
                type: "USER_WITH_PASS_LIST",
                payload: ret.data
            })
        }
    })
}