/**
 * Created by sucksuck on 2017/6/1.
 */
import * as utilAction from '../util';

//实物奖品信息
export function getPrizeGoodsInfo(id) {
    window.ajax.post(window.config.root + '/event_manage/prize/assets_info', id, function (ret) {
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


export function prizeInfoClear() {
    window.store.dispatch({
        type: "PRIZE_INFO_CLEAR",
    });
}
//实物奖品信息编辑
export function setPrizeGoodsInfo(form, search) {
    window.ajax.post(window.config.root + '/event_manage/prize/edit', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("edit_goods");
            getPrizeList(search);
        }
    });
}
//创建实物奖品信息
export function createPrizeGoodsInfo(form, search) {
    window.ajax.post(window.config.root + '/event_manage/prize/create', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            getPrizeList(search);
            utilAction.close("edit_goods");
        }
    });
}
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