/**
 * Created by sun_3211 on 2017/4/1.
 */

//webSocket = new WebSocket("ws://127.0.0.1:8080/websocket.ws/"+ relationId +"/"+ userCode);
import * as authAction  from '../action/auth';
export default class {

    constructor() {
        this.pingDate = false;
        this.webSocket = false;
        this.isConnect = false;
        this.isLogin = false;
        // window.setInterval(function () {
        //     if (window.config.isLogin) {
        //         window.ajax.post(window.config.root + '/auth/login/ping', function (ret) {
        //             console.log(ret);
        //         });
        //     }
        // }, 60 * 1000);
    }

    connect() {
        this.webSocket = new WebSocket(window.config.webSocket);
        this.webSocket.onopen = this.onOpen.bind(this);
        this.webSocket.onmessage = this.onMessage.bind(this);
        this.webSocket.onclose = this.onClose.bind(this);
        this.webSocket.onerror = this.onError.bind(this);
        this.pingDate = new Date().getTime();
    }

    logout() {
        // this.isLogin = false;
        //if (this.isConnect) {
        // this.isConnect = false;
        //  this.webSocket.close();
        //  }
        if (this.isConnect) {
            this.send({"action": "logout", payload: {"session_id": window.config.session_id}});
        }
    }

    checkConnection() {
        window.setTimeout(function () {
            // console.log("checkConnection", this.pingDate, new Date().getTime());
            if (this.isLogin && new Date().getTime() - this.pingDate > 3000 * window.config.webSocketPingInterval) {
                this.login();
            } else {
                this.checkConnection();
            }
        }.bind(this), 1000 * window.config.webSocketPingInterva);
    }

    send(data) {
        this.webSocket.send(JSON.stringify(data));
    }

    onOpen() {
        //console.log(e);
        this.isConnect = true;
        if (window.config.isLogin) {
            this.login();
        }
    }

    login() {
        if (this.isConnect) {
            this.send({"action": "login", payload: {"session_id": window.config.session_id}});
        }
    }

    onMessage(e) {
        let data = JSON.parse(e.data);
        switch (data.action) {
            case "ping":
                this.pingDate = new Date().getTime();
                this.send({"action": "ping"});
                break;
            case "login":
                if (data.payload.errcode) {
                    this.isLogin = false;
                    authAction.logout();
                } else {
                    this.isLogin = true;
                }
                break;
            case "logout":
                this.isLogin = false;
                authAction.logout(data.payload.msg);
                break;
            case "goods_monitor":
                let goods_id = [];
                let selected = window.store.getState().monitorGoodsSetting.selected;
                for (let key in selected) {
                    goods_id.push(selected[key].id);
                }
                window.goodsMonitorDB.insertMonitor(data.payload.monitor)
                    .then(function () {
                        return window.goodsMonitorDB.selectMonitor(goods_id);
                    })
                    .then(function (result) {
                        return window.goodsMonitorDB.getPeriodsUser(data.payload.monitor.periods_id, result);
                    })
                    .then(function (result) {
                        data.payload.periods.user = result.user;
                        return window.goodsMonitorDB.getTotalGoods(result);
                    })
                    .then(function (result) {
                        window.store.dispatch({
                            type: "MONITOR_GOODS_REFRESH",
                            payload: {
                                selected: selected,
                                monitor: result.monitor,
                                periods: data.payload.periods,
                                total_goods: result.total_goods
                            }
                        });
                    });
                break;
        }
    }

    onClose(e) {
        this.isConnect = false;
        window.setTimeout(this.connect.bind(this), 5000);
        console.log("onClose", e);
    }

    onError(e) {
        this.isConnect = false;
        window.setTimeout(this.connect.bind(this), 5000);
        console.log("onError", e);
    }
}