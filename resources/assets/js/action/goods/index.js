/**
 * Created by sun_3211 on 2017/3/6.
 */
import * as menuActive from '../menu';
import * as utilAction from '../util';
import {NavLink} from 'react-router-dom'
import React from 'react';
//获取商品列表
export function getGoodsList(form) {
    window.ajax.post(window.config.root + '/goods/search', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "GOODS_LIST_INIT",
                payload: ret.data
            });
        }
    });
}

//获取商品分类
export function getGoodsCategory() {
    window.ajax.post(window.config.root + '/goods/search/category', function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "GOODS_CATEGORY_INIT",
                payload: ret.data
            });
        }
    });
}

//获取商品详细信息
export function getGoodsDetail(id) {
    window.ajax.post(window.config.root + '/goods/info', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "GOODS_DETAILS_INIT",
                payload: ret.data
            });
        }
    });
}


//修改商品
export function saveGoodsInfo(form) {
    window.ajax.post(window.config.root + '/goods/info/edit', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "GOODS_INFO_SAVE",
                payload: ret
            });
            window.history.back();

        }
    });
}


//删除商品
export function deleteGoods(id, search) {
    window.ajax.post(window.config.root + '/goods/search/del', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            getGoodsList(search);
            utilAction.prompt(ret.msg);
        }
    })
}

//下架
export function downShelvesGoods(id, search) {
    window.ajax.post(window.config.root + '/goods/search/down_shelves', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            getGoodsList(search);
            utilAction.prompt(ret.msg);
        }
    })
}

//强制下架
export function forceDownShelvesGoods(id, search) {
    window.ajax.post(window.config.root + '/goods/search/force_down_shelves', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            getGoodsList(search);
            utilAction.prompt(ret.msg);

        }
    })
}

//上架
export function upShelvesGoods(id) {
    window.ajax.post(window.config.root + '/goods/search/up_shelves', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: 'GOODS_CHANGE_STATUS',
                payload: ret.data
            });
            utilAction.prompt(ret.msg);
        }
    })
}


//获取扩展属性
export function getExtend(id) {
    window.ajax.post(window.config.root + '/goods/extend', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: 'GET_EXTEND',
                payload: ret.data
            });

        }
    })
}
//保存扩展属性
export function setExtend(form) {
    // console.log(form);
    window.ajax.post(window.config.root + '/goods/extend/edit', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: 'SET_EXTEND',
                payload: ret.errcode
            });
            utilAction.prompt(ret.msg);
            window.history.back();

        }
    })
}


export function addGoods(category) {
    menuActive.open({
        name: "GoodsEdit",
        extend: {category: category}
    });
}


//发布商品
export function createGoods(form) {
    window.ajax.post(window.config.root + '/goods/info/create', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "GOODS_CREATE",
                payload: ret.data
            });
            utilAction.prompt(ret.msg);
            window.history.back();

        }
    });
}

//操作按钮事件
export function onItemButtonClick(category, item, name) {

}
//清空状态
export function clear() {
    window.store.dispatch({
        type: "GOODS_DETAILS_CLEAR"
    });
}
