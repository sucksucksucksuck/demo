/**
 * Created by sucksuck on 2017/7/4.
 */
import * as utilAction from '../util';

//获取记录列表
export function getLogList(form) {
    window.ajax.post(window.config.root + '/vip_manage/conflict_log', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "CONFLICT_LOG_INIT",
                payload: ret.data
            });
        }
    });
}
//统计
export function settle(form,search) {
    window.ajax.post(window.config.root + '/vip_manage/conflict_log/settle', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            getLogList(search);
        }
    });
}
