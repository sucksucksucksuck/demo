/**
 * Created by sucksuck on 2017/7/6.
 */
import * as utilAction from '../util';

//统计
export function getList(form) {
    window.ajax.post(window.config.root + '/promotion/rank', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "PROMOTERS_RANK_INIT",
                payload: ret.data
            });
        }
    });
}
export function clear() {
            window.store.dispatch({
                type: "PROMOTERS_RANK_CLEAR",
            });
}