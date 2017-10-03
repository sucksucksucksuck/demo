/**
 * Created by sun_3211 on 2017/4/11.
 */
import React from 'react';
import * as utilAction from '../util';
import GoodsMonitorSetting from '../../view/index/tab_content/monitor/setting';
import QuickPurchaseSetting from '../../view/index/tab_content/monitor/quick_purchase_setting';
//配置监控商品
export function openSetting() {
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "goodsMonitorSetting",
            fade: true,
            view: <GoodsMonitorSetting onClick={(type) => {
                if (type === "ok") {
                }
                utilAction.close("goodsMonitorSetting");
            }}/>
        }
    });
}

//配置一键购买商品
export function openQuickPurchaseSetting() {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("quickPurchaseSetting");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "quickPurchaseSetting",
            fade: true,
            view: <QuickPurchaseSetting onClick={call}/>
        }
    });
}

//打开配置一键购买设置
export function getQuickSetting() {
    window.ajax.post(window.config.root + '/monitor/goods', function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "QUICK_PURCHASE_SETTING_DATA",
                payload: ret.data
            });
            openQuickPurchaseSetting();
        }
    });
}

export function getGoods() {
    window.ajax.post(window.config.root + '/monitor/goods', function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "MONITOR_GOODS_SETTING_DATA",
                payload: ret.data
            });
            openSetting();
        }
    });
}
export function selected(goods) {
    window.store.dispatch({
        type: "MONITOR_GOODS_SETTING_SELECTED",
        payload: goods
    });
}
//一键购买选择商品
export function quickSelected(goods) {
    window.store.dispatch({
        type: "QUICK_PURCHASE_SETTING_SELECTED",
        payload: goods
    });
}
export function close() {
    window.store.dispatch({
        type: "DIALOG_CLOSE",
        payload: "goodsMonitorSetting"
    });
}
//一键购买
export function quickPurchase(form) {
    window.ajax.post(window.config.root + '/monitor/goods/quick_purchase', form, function (ret) {
        if (ret.errcode) {
            utilAction.toast(ret.msg,false);
        } else {
            utilAction.toast(ret.msg,false);
        }
    });
}

export function appoint(form) {
    window.ajax.post(window.config.root + '/monitor/goods/appoint', form, function (ret) {
        if (ret.errcode) {
            utilAction.toast(ret.msg,false);
        } else {
            window.store.dispatch({
                type: "MONITOR_GOODS_APPOINT",
                payload: form
            });
        }
    });
}
export function cancel(form) {
    window.ajax.post(window.config.root + '/monitor/goods/cancel', form, function (ret) {
        if (ret.errcode) {
            utilAction.toast(ret.msg,false);
            //console.log(ret.msg);
        } else {
            window.store.dispatch({
                type: "MONITOR_GOODS_CANCEL",
                payload: form
            });
        }
    });
}
export function robot(id, goods_id) {
    let form = {id: id, lottery_type: 2};
    window.ajax.post(window.config.root + '/monitor/goods/lottery_type', form, function (ret) {
        if (ret.errcode) {
            utilAction.toast(ret.msg,false);
        } else {
            form.goods_id = goods_id;
            window.store.dispatch({
                type: "MONITOR_GOODS_ROBOT",
                payload: form
            });
        }
    });
}
export function all(id, goods_id) {
    let form = {id: id, lottery_type: 1};
    window.ajax.post(window.config.root + '/monitor/goods/lottery_type', form, function (ret) {
        if (ret.errcode) {
            utilAction.toast(ret.msg,false);
        } else {
            form.goods_id = goods_id;
            window.store.dispatch({
                type: "MONITOR_GOODS_ALL",
                payload: form
            });
        }
    });
}
export function switchPanel() {
    window.store.dispatch({
        type: "MONITOR_GOODS_SWITCH_PANEL"
    });
}

export function initPage(props) {
    let goods_id = [];
    let selected = props.monitorGoodsSetting.selected;
    for (let key in selected) {
        goods_id.push(selected[key].id);
    }
    window.goodsMonitorDB.selectMonitor(goods_id)
        .then(function (result) {
            return window.goodsMonitorDB.getTotalGoods(result);
        })
        .then(function (result) {
            //console.log(result);
            window.store.dispatch({
                type: "MONITOR_GOODS_REFRESH",
                payload: {
                    selected: selected,
                    monitor: result.monitor,
                    total_goods: result.total_goods
                }
            });
        });
}

export function dataUpdate() {
    window.ajax.post(window.config.root + '/monitor/goods/operate_data', function (ret) {
        if (ret.errcode) {
            console.log(ret.msg);
        } else {
            window.store.dispatch({
                type: "MONITOR_GOODS_DATA_UPDATE",
                payload: ret
            });
        }
    });
}

export function userInfo(id) {
    window.ajax.post(window.config.root + '/monitor/user_info', id,function (ret) {
        // console.log(ret.data);
        if (ret.errcode) {
            console.log(ret.msg);
        } else {
            window.store.dispatch({
                type: "MONITOR_USER_INFO",
                payload: ret.data
            });
        }
    });
}

export function userOrder(id) {
    window.ajax.post(window.config.root + '/monitor/user_info/user_order', id,function (ret) {
        // console.log(ret.data);
        if (ret.errcode) {
            console.log(ret.msg);
        } else {
            window.store.dispatch({
                type: "MONITOR_USER_ORDER",
                payload: ret.data
            });
        }
    });
}
