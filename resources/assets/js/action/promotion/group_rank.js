/**
 * Created by sucksuck on 2017/7/6.
 */
//统计
import * as utilAction from '../util';
import * as openWindow from '../../modules/open_window';

export function getList(form) {
    window.ajax.post(window.config.root + '/promotion/group_achievement', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "GROUP_RANK_INIT",
                payload: ret.data
            });
        }
    });
}

export function getsumAmount(form) {
    window.ajax.post(window.config.root + '/promotion/group_achievement/sum_amount', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "STATISTICS",
                payload: ret.data
            });
        }
    });
}
//导出
export function excel(form) {
    openWindow.post(window.config.root + '/promotion/group_achievement/excel', form, (ret) => {
    });
}