/**
 * Created by sucksuck on 2017/7/11.
 */
import * as utilAction from '../util';
import React from 'react';
import CreateShareOrder from '../../view/index/tab_content/share_order/create_share_order';
import ShareInfo from '../../view/index/tab_content/share_order/share_info';

export function getList(form) {
    window.ajax.post(window.config.root + '/share_order/share', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "SHARE_ORDER_LIST_INIT",
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
//获取晒单详情
export function getShareInfo(form) {
    window.ajax.post(window.config.root + '/share_order/share/share_info', form, function (ret) {
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
//清空晒单详情
export function clearShareInfo(form) {
    window.store.dispatch({
        type: "SHARE_ORDER_INFO_CLEAR",
    });
}
//修改晒单详情
export function editShareInfo(form,search) {
    window.ajax.post(window.config.root + '/share_order/share/edit', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("createShareOrder");
            getList(search);
        }
    });
}
//隐藏
export function changeShareStatus(form, search) {
    window.ajax.post(window.config.root + '/share_order/share/status', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            getList(search);
        }
    });
}
//删除
export function delShare(form, search) {
    window.ajax.post(window.config.root + '/share_order/share/del', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            getList(search);
        }
    });
}
//打开详情弹窗
export function shareInfo(item, search) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("shareInfo");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "shareInfo",
            fade: true,
            view: <ShareInfo item={item} onClick={call}/>
        }
    });
}

//打开编辑弹窗
export function createShareOrder(item, search) {
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
            view: <CreateShareOrder item={item} onClick={call} search={search}/>
        }
    });
}