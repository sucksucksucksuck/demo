/**
 * Created by sucksuck on 2017/7/4.
 */
import * as utilAction from '../util';

//获取记录列表
export function getLogList(form) {
    window.ajax.post(window.config.root + '/vip_manage/operation_log', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "OPERATION_LOG_INIT",
                payload: ret.data
            });
        }
    });
}
//
export function clear() {
    window.store.dispatch({
        type: "OPERATION_LOG_CLEAR",
    });
}