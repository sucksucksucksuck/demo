/**
 * Created by sun_3211 on 2017/2/15.
 */

import React from "react";
import ReactDOM from "react-dom";
import  './modules/global';
import {Provider}  from "react-redux";
import {createStore, combineReducers} from 'redux'
import storage from './modules/storage';
import * as reducers from "./reducer";
import Main from "./view/main";
import ajax from './modules/ajax';
import SocketApi from './modules/socket';
import GoodsMonitorDB from './modules/goods_monitor_db';
// import  '../image/navigation/column_commodity.png';
// import  '../image/navigation/column_integral.png';
// import  '../image/navigation/column_lucky.png';
// import  '../image/navigation/column_new.png';
// import  '../image/navigation/column_problem.png';
// import  '../image/pay/alipay.png';
// import  '../image/pay/bankcard.png';
// import  '../image/pay/jd.png';
// import  '../image/pay/junka.png';
// import  '../image/pay/wxpay.png';
// import  '../image/pay/image_chongzhi.png';
// import  '../image/pay/quick.png';
// import  '../image/share/logo.png';

window.socketApi = new SocketApi();
window.ajax = ajax;
window.store = storage()(createStore)(combineReducers(reducers));
//window.store = createStore(combineReducers(reducers));
window.goodsMonitorDB = new GoodsMonitorDB();
window.addEventListener('load', function () {
    // window.socketApi.connect();
    window.goodsMonitorDB.createGoods();
    window.goodsMonitorDB.createMonitor();
    ReactDOM.render(
        <Provider store={store}>
            <Main />
        </Provider>,
        document.getElementById("react_root")
    );
}, true);

