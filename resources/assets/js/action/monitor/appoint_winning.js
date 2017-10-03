/**
 * Created by lrx on 2017/5/5.
 */
import * as utilAction from '../util';

//获取记录列表
export function getRecordsList(form) {
    window.ajax.post(window.config.root + '/monitor/appoint_winning/execute', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "RECORD_INIT",
                payload: ret.data
            });
        }
    });
}
