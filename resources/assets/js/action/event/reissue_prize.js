/**
 * Created by sucksuck on 2017/6/1.
 */
import * as utilAction from '../util';

//补发奖品保存
export function setReissuePrize(form) {
    window.ajax.post(window.config.root + '/event_manage/prize/reissue_prize', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("reissue_prize");
        }
    });
}


export function prizeInfoClear() {
    window.store.dispatch({
        type: "PRIZE_INFO_CLEAR",
    });
}

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
