/**
 * Created by sucksuck on 2017/7/6.
 */
import * as utilAction from '../util';
import * as openWindow from '../../modules/open_window';
export function getList(form) {
    window.ajax.post(window.config.root + '/promotion/achievement', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "PROMOTERS_PERFORMANCE_INIT",
                payload: ret.data
            });
        }
    });
}

//数据
export function getInfo(form) {
    window.ajax.post(window.config.root + '/promotion/achievement/data_statistics', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "PROMOTERS_PERFORMANCE_INFO",
                payload: ret.data
            });
        }
    });
}
//统计
export function getSumAmount(form) {
    window.ajax.post(window.config.root + '/promotion/achievement/sum_amount', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "PROMOTERS_PERFORMANCE_SUM_AMOUNT",
                payload: ret.data
            });
        }
    });
}
//导出
export function excel(form) {
    openWindow.post(window.config.root + '/promotion/achievement/excel', form, (ret) => {
    });
}
