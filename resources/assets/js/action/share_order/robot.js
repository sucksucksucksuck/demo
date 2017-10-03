/**
 * Created by sucksuck on 2017/7/11.
 */
import React from 'react';
import * as utilAction from '../util';
import CreateShareOrder from '../../view/index/tab_content/share_order/create_share_order';

export function getList(form) {
    window.ajax.post(window.config.root + '/share_order/robot',form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "ROBOT_INIT",
                payload: ret.data
            });
        }
    });
}
export function getGoodsCategory() {
    window.ajax.post(window.config.root + '/goods/search/category', function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "CATEGORY_INIT",
                payload: ret.data
            });
        }
    });
}
export function createShareOrder(item,search) {
    console.log(search);
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("createShareOrder");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "createShareOrder",
            fade: true,
            view: <CreateShareOrder item={item}  onClick={call} search={search}/>
        }
    });
}
//新建晒单
export function createShare(form,search) {
    window.ajax.post(window.config.root + '/share_order/robot/create_share',form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("createShareOrder");
            getList(search);
        }
    });
}

//修改晒单


//获取晒单信息
export function getShare(form) {
    window.ajax.post(window.config.root + '/share_order/robot',form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "SHARE_ORDER_INFO_INIT",
                payload: ret.data
            });
        }
    });
}