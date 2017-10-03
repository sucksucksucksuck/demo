/**
 * Created by sucksuck on 2017/6/1.
 */
import * as utilAction from '../util';

export function prizeInfoClear() {
    window.store.dispatch({
        type: "PRIZE_INFO_CLEAR",
    });
}
//红包奖品信息
export function getPrizeRedInfo(id) {
    window.ajax.post(window.config.root + '/event_manage/prize_red/red_info', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "PRIZE_RED_INFO_INIT",
                payload: ret.data
            });
        }
    });
}

//红包奖品信息编辑
export function setPrizeRedInfo(form, search) {
    window.ajax.post(window.config.root + '/event_manage/prize_red/edit', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("edit_red");
            getPrizeRed(search);

        }
    });
}
//创建红包奖品信息
export function createPrizeRedInfo(form, search) {
    window.ajax.post(window.config.root + '/event_manage/prize_red/create', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("edit_red");
            getPrizeRed(search);

        }
    });
}
//红包奖品设置
export function getPrizeRed(id) {
    window.ajax.post(window.config.root + '/event_manage/prize_red', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "EVENT_PRIZE_RED_INIT",
                payload: ret.data
            });
        }
    });
}



