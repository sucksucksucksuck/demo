/**
 * Created by lrx on 2017/7/21.
 */
import * as utilAction from '../util';

//搜索
export function getLogList(form) {
    window.ajax.post(window.config.root + '/turntable_manage/level_search', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "TURNTABLE_QUERY_INIT",
                payload: ret.data
            });
        }
    });
}
//添加充值金额
export function addCount(form) {
    window.ajax.post(window.config.root + '/turntable_manage/level_search/add', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        }else {
            getLogList(form);
        }
    });
}
/*离开清除数据*/
export function clearData() {
    window.store.dispatch({
        type: "CLEAR_DATA"
    });
}