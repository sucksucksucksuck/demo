/**
 * Created by sucksuck on 2017/10/2 12:03.
 */
import * as utilAction from '../util'
import React from 'react'
import AgencyRecharge from '../../view/index/tab_content/agency/agency_recharge'

//获取商品列表
export function getList(form) {
    window.ajax.post(window.config.root + '/businesses/businesses/business_log', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg)
        } else {
            window.store.dispatch({
                type: "AGENCY_RECHARGE_LOG_LIST",
                payload: ret.data
            })
        }
    })
}

