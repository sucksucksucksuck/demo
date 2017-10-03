/**
 * Created by sucksuck on 2017/6/5.
 */
import * as utilAction from '../util';

//活动信息
export function getManageInfo(id) {
    window.ajax.post(window.config.root + '/event_manage/manage_info', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "MANAGE_INFO_INIT",
                payload: ret.data
            });
        }
    });
}

//保存活动信息
export function setManageInfo(form, search) {
    window.ajax.post(window.config.root + '/event_manage/manage_info/edit', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("manage_info");
            getPrizeList(search);

        }
    });
}

//奖品设置
export function getPrizeList(id) {
    window.ajax.post(window.config.root + '/event_manage/prize', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "EVENT_PRIZE_LIST_INIT",
                payload: ret.data
            });
        }
    });
}
