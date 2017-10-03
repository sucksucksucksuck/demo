
import * as utilAction from '../util';

//获取记录列表
export function getLogList(form) {
    window.ajax.post(window.config.root + '/system_log/pay_log', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "PAY_LOG_INIT",
                payload: ret.data
            });
        }
    });
}
//统计
export function onStatistics(form) {
    window.ajax.post(window.config.root + '/system_log/pay_log/sum_amount', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "STATISTICS",
                payload: ret
            });
        }
    });
}
/*离开清除数据*/
export function payLogClear() {
    window.store.dispatch({
        type: "PAY_LOG_CLEAR"
    });
}