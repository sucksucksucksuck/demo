/**
 * Created by sucksuck on 2017/7/6.
 */
import * as utilAction from '../util';

export function getList(form) {
    window.ajax.post(window.config.root + '/promotion/promotion', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "CONSUMER_RECHARGE_INIT",
                payload: ret.data
            });
        }
    });
}
//数据
export function getInfo(form) {
    window.ajax.post(window.config.root + '/promotion/promotion/data_statistics', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "CONSUMER_RECHARGE_INFO",
                payload: ret.data
            });
        }
    });
}
//清除
export function clear(form) {
    window.store.dispatch({
        type: "CONSUMER_RECHARGE_CLEAR",
    });
}