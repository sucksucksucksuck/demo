/**
 * Created by sun_3211 on 2017/2/4.
 */
import * as utilAction from '../../action/util';
export default {
    ajaxSettings: {
        url: location.href,
        type: "GET",
        async: true,
        timeout: 10000,
        response: function (text, url) {
            // console.log("response");
        },
        success: function () {
        },
        before: function (url) {
            if (url.indexOf("auth/login/ping") === -1) { //找不到
                utilAction.load("loading");
            }
        },
        end: function (url) {
            utilAction.close("load");
        }
    },
    param: function (data, type) {
        if (data && data instanceof FormData) {
            return data;
        }
        if (typeof (data) === "string") {
            return data;
        }
        if (type === 'POST') {
            let formData = new FormData();
            if (typeof (data) === "object") {
                //let arr = [];
                Object.keys(data).forEach(function (key) {
                    let val = data[key];
                    if (val instanceof Array) {
                        val.forEach(function (v) {
                            formData.append(`${key}[]`, v);
                        });
                    } else {
                        formData.append(key, val);
                    }
                });
                //  return arr.join('&');
            }
            return formData;
        } else {
            if (typeof (data) === "object") {
                let arr = [];
                Object.keys(data).forEach(function (key) {
                    let val = data[key];
                    if (val instanceof Array) {
                        val.forEach(function (v) {
                            arr.push(`${key}[]=${decodeURIComponent(v)}`);
                        });
                    } else {
                        arr.push(`${key}=${decodeURIComponent(val)}`);
                    }
                });
                return arr.join('&');
            }
        }
        return null;
    },
    ajax: function (options) {
        let opt = {...this.ajaxSettings, ...options};
        if (window.ajaxCount === 0) {
            opt.before(opt.url);
        }
        // console.log(opt);
        window.ajaxCount++;
        // console.log(window.ajaxCount);
        let xmlHttp = new window.XMLHttpRequest();
        xmlHttp.withCredentials = true;
        let timeoutTimer = 0;
        if (opt.timeout) {
            timeoutTimer = window.setTimeout(function () {
                xmlHttp.abort();//请求中止
                opt.success({errcode: 505, msg: `请求服务器超时`});
                utilAction.close("load");
            }, opt.timeout);
        }
        xmlHttp.onreadystatechange = function () {
            opt.response(xmlHttp.responseText, xmlHttp.responseURL);
            if (xmlHttp.readyState === 4) {
                if (timeoutTimer) {
                    window.clearTimeout(timeoutTimer);
                }
                if (xmlHttp.status === 200) {
                    try {
                        let json = JSON.parse(xmlHttp.responseText);
                        if (json.errcode === 403) {
                            utilAction.prompt(json.msg, () => {
                                window.store.dispatch({
                                    type: "LOGOUT",
                                });
                                return true;
                            });
                        } else if (json.errcode === 402) {
                            utilAction.permission("很可惜，您还没有权限哦，请联系管理员~");
                        } else {
                            opt.success(json);
                        }
                    } catch (e) {
                        console.error('ajax错误', e);
                        opt.success({errcode: 501, msg: e.message});
                    }
                } else {
                    opt.success({errcode: xmlHttp.status, msg: `访问服务器失败`});
                }
                window.ajaxCount--;
                if (window.ajaxCount === 0) {
                    opt.end(opt.url);
                }
            }
        }.bind(this);
        for (let key in opt.headers) {
            xmlHttp.setRequestHeader(key, opt.headers[key]);
        }

        xmlHttp.open(opt.type, opt.url, true);
        if (opt.type.toUpperCase() === 'POST') {
            // xmlHttp.setRequestHeader("Content-type", "application/x-www-four-urlencoded");
            opt.data = this.param(opt.data, opt.type.toUpperCase());
            xmlHttp.send(opt.data);
        } else {
            xmlHttp.send();
        }
        return xmlHttp;
    },
    post: function (url, data, callback) {
        // Shift arguments if data argument was omitted
        if (typeof(data) === 'function') {
            callback = data;
            data = undefined;
        }
        let params = {
            url: url,
            type: "post",
            data: data,
            success: callback
        };
        // console.log(params);
        // The url can be an options object (which then must have .url)
        return this.ajax(params);
    },
    get: function (url, data, callback) {
        // Shift arguments if data argument was omitted
        if (typeof(data) === 'function') {
            callback = data;
            data = undefined;
        }
        let params = {
            url: url,
            type: "post",
            data: data,
            success: callback
        };
        // The url can be an options object (which then must have .url)
        return this.ajax(params);
    }
}