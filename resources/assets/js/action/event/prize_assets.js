/**
 * Created by sucksuck on 2017/5/27.
 */
import React from 'react';
import * as utilAction from '../util';
import AssetsInfo from '../../view/index/tab_content/event/prize_assets_info';

//资产奖品设置
export function getPrizeAssets(id) {
    window.ajax.post(window.config.root + '/event_manage/prize_assets', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "EVENT_PRIZE_ASSETS_INIT",
                payload: ret.data
            });
        }
    });
}

//资产弹窗
export function assetsPopUp(id, event_id, search) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("edit_assets");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "edit_assets",
            fade: true,
            view: <AssetsInfo onClick={call} id={id} event_id={event_id} search={search}/>
        }
    });
}
//删除资产奖品信息
export function delPrizeAssets(form, search) {
    window.ajax.post(window.config.root + '/event_manage/prize_assets/del', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            getPrizeAssets(search);
        }
    });
}