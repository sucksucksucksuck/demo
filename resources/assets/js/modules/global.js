/**
 * Created by sun_3211 on 2017/4/1.
 */

import createHistory from 'history/createBrowserHistory'
window.ajaxCount = 0;

window.cloneObject = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};

Date.prototype.format = function (fmt) {
    const o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
    return fmt;
};
window.hasPermission = function (module, action) {
    try {
        let permission = window.store.getState().auth.user.permission;
        if (permission === null) {
            return true;
        }
        if ((permission[`${module}`] & Math.pow(2, action)) === Math.pow(2, action)) {
            return true;
        }
    } catch (e) {
        console.log(e);
    }
    return false;

};
window.caseUrl = function (uri) {
    let url = window.config.root + uri;
    return url.substr(url.indexOf('/', 8));
};

window.routerHistory = createHistory();