/**
 * Created by sucksuck on 2017/5/26.
 */
import * as utilAction from '../util';
import * as openWindow from '../../modules/open_window';

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
//导出活动数据
export function exportEvent(form) {
    openWindow.post(window.config.root + '/event_manage/manage/excel_prize', form, (ret) => {
        console.log(ret);
        if (ret.errcode) {
            utilAction.close("toast");
        }

    });
}


//导出排行榜数据
export function exportRank(form) {
    openWindow.post(window.config.root + '/event_manage/manage/excel_rank', form, (ret) => {
    });
}
//关联信息清除
export function clearAssociate(form) {
    window.store.dispatch({
        type: "ASSOCIATED_INFO_CLEAR"
    })
}