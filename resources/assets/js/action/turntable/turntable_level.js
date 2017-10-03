/**
 * Created by lrx on 2017/7/21.
 */
import * as utilAction from '../util';

//获取列表
export function getLogList(form) {
    window.ajax.post(window.config.root + '/turntable_manage/level_statistics', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "TURNTABLE_LEVEL_INIT",
                payload: ret.data
            });
        }
    });
}