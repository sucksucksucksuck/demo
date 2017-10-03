/**
 * Created by sucksuck on 2017/10/2 12:03.
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
                type: "AGENCY_ALL_LIST",
                payload: ret.data
            })
        }
    })
}

//禁用银商
export function disable(form, search) {
    window.ajax.post(window.config.root + '/businesses/businesses/disable', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg)
        } else {
            getList(search)
        }
    })
}

//启用银商
export function enable(form, search) {
    window.ajax.post(window.config.root + '/businesses/businesses/enable', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg)
        } else {
            getList(search)
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