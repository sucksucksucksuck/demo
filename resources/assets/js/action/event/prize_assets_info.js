/**
 * Created by sucksuck on 2017/6/1.
 */
import * as utilAction from '../util';

//资产奖品信息
export function getPrizeAssetsInfo(id) {
    window.ajax.post(window.config.root + '/event_manage/prize_assets/assets_info', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "PRIZE_ASSETS_INFO_INIT",
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

//资产奖品信息编辑
export function setPrizeAssetsInfo(form, search) {
    window.ajax.post(window.config.root + '/event_manage/prize_assets/edit', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("edit_assets");
            getPrizeAssets(search);

        }
    });
}
//创建资产奖品信息
export function createPrizeAssetsInfo(form, search) {
    window.ajax.post(window.config.root + '/event_manage/prize_assets/create', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("edit_assets");
            getPrizeAssets(search);

        }
    });
}
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
