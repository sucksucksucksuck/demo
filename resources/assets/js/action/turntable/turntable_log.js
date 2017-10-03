/**
 * Created by lrx on 2017/7/21.
 */
import * as utilAction from '../util';

//获取列表
export function getLogList(form) {
    window.ajax.post(window.config.root + '/turntable_manage/log', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "TURNTABLE_LOG_INIT",
                payload: ret.data
            });
        }
    });
}
//统计
export function statistics(form) {
    window.ajax.post(window.config.root + '/turntable_manage/log/statistics', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "TURNTABLE_LOG_STATISTICS",
                payload: ret.data
            });
        }
    });
}
export function clear() {
    window.store.dispatch({
        type: "TURNTABLE_LOG_CLEAR",
    });
}