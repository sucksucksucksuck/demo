/**
 * Created by sucksuck on 2017/6/2.
 */
import * as utilAction from '../util';

//活动设置
export function getEventList(form) {
    window.ajax.post(window.config.root + '/event_manage/manage/event_list', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "EVENT_LIST_INIT",
                payload: ret.data
            });
        }
    });
}

export function getRankList(id) {
    window.ajax.post(window.config.root + '/event_manage/manage/rank', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "RANK_LIST_INIT",
                payload: ret.data
            });
        }
    });
}

export function setRank(form, search) {
    window.ajax.post(window.config.root + '/event_manage/manage/edit_rank', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            getRankList(search);
        }
    });
}

