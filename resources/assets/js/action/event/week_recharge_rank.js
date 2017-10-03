/**
 * Created by sucksuck on 2017/7/28.
 */
import * as utilAction from '../util';


export function getRankList(id) {
    window.ajax.post(window.config.root + '/event_manage/goods_list', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "RECHARGE_RANK_INIT",
                payload: ret.data
            });
        }
    });
}

export function getPeriodsList(id) {
    window.ajax.post(window.config.root + '/event_manage/goods_list/get_periods', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "RANK_PERIODS_INIT",
                payload: ret.data.rows
            });
        }
    });
}