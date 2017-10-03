/**
 * Created by sucksuck on 2017/10/2 12:03.
 */
import * as utilAction from '../util'
import React from 'react'
import AgencyRecharge from '../../view/index/tab_content/agency/agency_recharge'
//添加银商用户
export function addAgency(form) {
    window.ajax.post(window.config.root + '/businesses/businesses/add', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg)
        } else {
            utilAction.prompt(ret.msg)
        }
    })
}