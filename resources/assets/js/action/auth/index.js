/**
 * Created by sun_3211 on 2017/2/15.
 */
import React from 'react'
import * as validity from '../../modules/form_validity'
import ChangePassword from '../../view/auth/change_pwd'
import AdminInfo from "../../view/auth/admin_info"
import ForgetPwd from "../../view/auth/forget_pwd"
import MoneyInformation from '../../view/auth/money_information'
import * as utilAction from '../../action/util'

export function login(form, data, e) {
    e.preventDefault()
    let validityField = ['user_id', 'user_pwd']
    if (window.config.sms_code) {
        validityField.push('verify_code')
    } else {
        validityField.push('captcha')
    }
    if (validity.validity(form, validityField)) {
        window.ajax.post(window.config.root + '/auth/login', {
            user_id: data.user_id,
            password: data.user_pwd,
            captcha: data.captcha,
            code: data.verify_code
        }, function (ret) {
            if (!ret.errcode) {
                window.config.isLogin = true
                if (data.remember) {
                    setCookie("user_id", data.user_id)
                    setCookie("user_pwd", data.user_pwd)
                } else {
                    clearAllCookie()
                }
                window.store.dispatch({
                    type: "MENU_INIT",
                    payload: ret.data.menu
                })
                window.store.dispatch({
                    type: "AUTH_LOGIN_SUCCESS",
                    payload: ret.data.user
                })
                window.socketApi.login()
            } else {
                window.store.dispatch({
                    type: "AUTH_LOGIN_FAIL",
                    payload: ret.msg
                })
            }
        })
    }
}
export function clearAllCookie() {
    var keys = document.cookie.match(/[^ =;]+(?=\=)/g)
    if (keys) {
        for (var i = keys.length; i--;)
            document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
    }
}
export function setCookie(name, value) {
    let Days = 17
    let exp = new Date()
    exp.setTime(exp.getTime() + 1000)
    if (value == "" || value == "null" || value == "null" || value == " ") {
    } else {
        document.cookie = name + "=" + escape(value)
    }
}
export function autoLogin() {
    window.ajax.post(window.config.root + '/auth/auto_login', function (ret) {
        if (!ret.errcode) {
            window.config.isLogin = true
            window.store.dispatch({
                type: "MENU_INIT",
                payload: ret.data.menu
            })
            window.store.dispatch({
                type: "AUTH_LOGIN_SUCCESS",
                payload: ret.data.user
            })
        } else {
            window.config.isLogin = false
            window.store.dispatch({
                type: "AUTH_LOGIN_FAIL",
                payload: ret.msg
            })
        }
    })
}
export function getCode(form) {
    window.ajax.post(window.config.root + '/auth/login/get_code', {
        user_id: form.user_id,
        password: form.user_pwd,
        captcha: form.captcha,
    }, function (ret) {
        if (ret.errcode) {
            window.store.dispatch({
                type: "AUTH_LOGIN_SMS_SEND_FAIL",
                payload: {msg: ret.msg, data: ret.data}
            })
        } else {
            window.store.dispatch({
                type: "AUTH_LOGIN_SMS_SEND_SUCCESS",
                payload: ret.msg
            })
        }
    })
}
export function logout(msg = "") {
    window.ajax.post(window.config.root + '/auth/logout', function (ret) {
        if (ret.errcode) {
            alert(ret.msg)
        } else {
            window.config.isLogin = false
            window.store.dispatch({
                type: "LOGOUT",
                payload: msg
            })
        }
    })
}

/**
 * 修改密码
 */
export function changePwd() {
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "changePwd",
            fade: true,
            view: <ChangePassword/>
        }
    })
}

/**
 * 个人信息
 */
export function adminInfo() {
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "adminInfo",
            fade: true,
            view: <AdminInfo/>
        }
    })
}

//打开我的打款信息
export function moneyInfo() {
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "moneyInfo",
            fade: true,
            view: <MoneyInformation/>
        }
    })
}

//关闭我的打款信息
export function closeMoneyInfo() {
    window.store.dispatch({
        type: "DIALOG_CLOSE",
        payload: "moneyInfo"
    })
}

//忘记密码
export function forgetPwd() {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("forgetPwd")
        }
    }
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "forgetPwd",
            fade: true,
            view: <ForgetPwd onClick={call}/>
        }
    })
}



