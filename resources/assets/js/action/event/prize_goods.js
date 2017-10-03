/**
 * Created by sucksuck on 2017/5/27.
 */
import * as utilAction from '../util';
import GoodsInfo from '../../view/index/tab_content/event/prize_goods_info';
import React from 'react';

//实物奖品设置
export function getPrizeGoods(id) {
    window.ajax.post(window.config.root + '/event_manage/prize_goods', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "EVENT_PRIZE_GOODS_INIT",
                payload: ret.data
            });
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
//删除实物奖品信息
export function delPrizeGoods(form, search) {
    window.ajax.post(window.config.root + '/event_manage/prize_goods/del', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            getPrizeGoods(search);
        }
    });
}

//实物奖品信息
export function getPrizeGoodsInfo(id) {
    window.ajax.post(window.config.root + '/event_manage/prize_goods/goods_info', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "PRIZE_GOODS_INFO_INIT",
                payload: ret.data
            });
        }
    });
}