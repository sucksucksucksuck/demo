/**
 * Created by sucksuck on 2017/6/5.
 */
import * as utilAction from '../util';
import * as eventAction from './display';


//关联商品列表
export function associateGoodsList(form) {
    window.ajax.post(window.config.root + '/goods/search/goods_list', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "ASSOCIATED_GOODS_LIST_INIT",
                payload: ret.data
            });
        }
    });
}
//获取关联信息
export function getAssociateInfo(id) {
    window.ajax.post(window.config.root + '/event_manage/display_info', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            if(ret.data.extend.item == 2){
                associateGoodsList({category_id: ret.data.extend.category_id});
            }

            window.store.dispatch({
                type: "ASSOCIATED_INFO_INIT",
                payload: ret.data
            });

        }
    });
}
//保存关联商品
export function setAssociateGoods(form, search) {
    window.ajax.post(window.config.root + '/event_manage/display_info/edit_goods', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("associate_goods");
            eventAction.getEventDisplayList(search);
        }
    });
}
//清空
export function clear() {
    window.store.dispatch({
        type: "ASSOCIATED_INFO_CLEAR",
    });
}