/**
 * Created by sun_3211 on 2017/2/15.
 */

import 'react-hot-loader/patch';
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
import * as menuAction from './action/menu';
import GoodsMonitorDB from './modules/goods_monitor_db';
import {AppContainer} from 'react-hot-loader'
//import {BrowserRouter} from 'react-router-dom'
//import '../css/app.less';

window.socketApi = new SocketApi();
window.ajax = ajax;
window.store = storage()(createStore)(combineReducers(reducers));
window.goodsMonitorDB = new GoodsMonitorDB();
// window.addEventListener("popstate", function (e) {
//     // var state = e.state;
//     //console.log(e.state);
//     menuAction.forward(e.state);
//     // do something...
// });
const render = (Root) => {
    ReactDOM.render(
        <AppContainer>
            <Provider store={store}>
                <Root/>
            </Provider>
        </AppContainer>,
        document.getElementById("react_root")
    );
};
window.addEventListener('load', function () {
    window.goodsMonitorDB.createGoods();
    window.goodsMonitorDB.createMonitor();
    // window.socketApi.connect();
    render(Main);
    if (module.hot) {
        console.log('可以刷新页面');
        module.hot.accept("./view/main", () => {
            console.log('页面正在刷新!');
            let Main = require("./view/main");
            render(Main);
        })
    }
}, true);
