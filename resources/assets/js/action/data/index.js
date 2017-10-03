/**
 * Created by sucksuck on 2017/4/25.
 */

import * as utilAction from '../util';
import * as openWindow from '../../modules/open_window';

export function getDataProfile() {
    window.ajax.post(window.config.root + '/data/data_profile', function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "DATA_PROFILE_INIT",
                payload: ret.data
            });
        }
    });
}

export function getFinanceStatistics(form) {
    window.ajax.post(window.config.root + '/data/finance_statistics', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "FINANCE_STATISTICS_INIT",
                payload: ret.data
            });
        }
    });
}

export function getPayStatistics(form) {
    window.ajax.post(window.config.root + '/data/pay_statistics', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "PAY_STATISTICS_INIT",
                payload: ret.data
            });
        }
    });
}

export function getMonthUser(form) {
    window.ajax.post(window.config.root + '/data/month_user', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "MONTH_USER_INIT",
                payload: ret.data
            });
        }
    });
}
export function excel(form) {
    openWindow.post(window.config.root + '/data/month_user/excel', form, (ret) => {
    });
}