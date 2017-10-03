/**
 * Created by sucksuck on 2017/10/2 12:03.
 */
import * as utilAction from '../util'
import React from 'react'
import AgencyRecharge from '../../view/index/tab_content/agency/agency_recharge'

//获取商品列表
export function getCoinLog(form) {
    window.ajax.post(window.config.root + '/coin/coins', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg)
        } else {
            window.store.dispatch({
                type: "COINS_LOG_INIT",
                payload: ret.data
            })
        }
    })
}

//信息
export function openAgencyRechaarge(search) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("createAdmin")
        }
    }
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "createAdmin",
            slide: true,
            fade: true,
            close: true,
            view: <AgencyRecharge onClick={call} search={search}/>
        }
    })
}