/**
 * Created by sucksuck on 2017/5/27.
 */
import React from 'react';
import * as utilAction from '../util';
import RedInfo from '../../view/index/tab_content/event/prize_red_info';
import ManageInfo from "../../view/index/tab_content/event/manage_info";
import ReissuePrize from '../../view/index/tab_content/event/reissue_prize';
import GoodsInfo from '../../view/index/tab_content/event/prize_goods_info';
import AssetsInfo from '../../view/index/tab_content/event/prize_assets_info';

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
//补发弹窗
export function reissuePrizePopUp(item, event_title, event_id) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("reissue_prize");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "reissue_prize",
            fade: true,
            view: <ReissuePrize onClick={call} item={item} event_title={event_title} event_id={event_id}/>
        }
    });
}
//物品弹窗
export function goodsPopUp(id, search) {
    console.log(search);
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("edit_goods");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "edit_goods",
            fade: true,
            view: <GoodsInfo onClick={call} id={id} search={search}/>
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

//红包弹窗
export function redPopUp(id, event_id, search) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("edit_red");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "edit_red",
            fade: true,
            view: <RedInfo onClick={call} id={id} event_id={event_id} search={search}/>
        }
    });
}
//初始化活动数据
export function initialization(id) {
    window.ajax.post(window.config.root + '/event_manage/manage/initialization', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//活动修改弹窗
export function manageInfoPopUp(event_id, search) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("manage_info");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "manage_info",
            fade: true,
            view: <ManageInfo onClick={call} event_id={event_id} search={search}/>
        }
    });
}

//删除实物奖品信息
export function delPrizeGoods(form, search) {
    window.ajax.post(window.config.root + '/event_manage/prize/del', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            getPrizeList(search);
        }
    });
}


//清除数据
export function clearPrizeList() {
    window.store.dispatch({
        type: "EVENT_PRIZE_LIST_CLEAR",
    });
}
