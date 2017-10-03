/**
 * Created by sun_3211 on 2017/4/14.
 */

import * as utilAction from '../util';

export function getGoodsList(form) {
    window.ajax.post(window.config.root + '/monitor/status', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "GOODS_STATUS_LIST_INIT",
                payload: ret.data
            });
        }
    });
}
export function getGoodsCategory() {
    window.ajax.post(window.config.root + '/goods/search/category', function (ret) {
        if (ret.errcode) {
        } else {
            window.store.dispatch({
                type: "GOODS_CATEGORY_INIT",
                payload: ret.data
            });
        }
    });
}

export function setGoodsStatus(form,search) {
    window.ajax.post(window.config.root + '/monitor/status/status', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            getGoodsList(search);
            console.log(ret.msg);
        }
    });
}