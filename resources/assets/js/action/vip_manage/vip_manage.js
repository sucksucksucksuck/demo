/**
 * Created by sucksuck on 2017/7/4.
 */
import * as utilAction from '../util';
import React from 'react';
import VipInfo from '../../view/index/tab_content/vip_manage/edit_vip';
import ChangePromoters from '../../view/index/tab_content/vip_manage/changePromoters';
import Remark from '../../view/index/tab_content/vip_manage/remark';

//vip客户管理列表
export function getVipManage(form) {
    window.ajax.post(window.config.root + '/vip_manage/vip_manage', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "VIP_MANAGE_INIT",
                payload: ret.data
            });
        }
    });
}

//推广员列表
/**
 * 获取推广员
 * @param int $type (1=>推广员，2=>福主管,3=>主管)
 * @return array
 */
export function getPromoters(form) {
    window.ajax.post(window.config.root + '/vip_manage/vip_manage/get_promoters', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            if (form.type == "1") {
                window.store.dispatch({
                    type: "PROMOTERS_LIST_INIT",
                    payload: ret.data
                });
            } else if (form.type == "2") {
                window.store.dispatch({
                    type: "DIRECTOR_LIST_INIT",
                    payload: ret.data
                });
            } else if (form.type == "3") {
                window.store.dispatch({
                    type: "SECOND_DIRECTOR_LIST_INIT",
                    payload: ret.data
                });
            }

        }
    });
}
export function clear() {
    window.store.dispatch({
        type: "VIP_MANAGE_INIT_CLEAR",
    });
}
export function clearInfo() {
    window.store.dispatch({
        type: "VIP_MANAGE_INFO_CLEAR",
    });
}
//更改推广员弹窗
export function changePromoter(promoterList, ids, search) {
    console.log(promoterList);
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("changePromoters");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "changePromoters",
            fade: true,
            view: <ChangePromoters onClick={call} ids={ids} promoterList={promoterList}
                                   search={search}/>
        }
    });
}
//修改推广员
export function editPromoter(form, search) {
    console.log(form);
    window.ajax.post(window.config.root + '/vip_manage/vip_manage/edit_promoters', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            utilAction.close("changePromoters");
            getVipManage(search);
        }
    });
}
//添加/编辑客户
export function vipInfo(promoterList, id, search) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("vipInfo");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "vipInfo",
            fade: true,
            view: <VipInfo onClick={call} id={id} promoterList={promoterList}
                           search={search}/>
        }
    });
}
//删除VIP客户
export function delVip(form, search) {
    window.ajax.post(window.config.root + '/vip_manage/vip_manage/del', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            getVipManage(search);
        }
    });
}
//客户信息
export function getVipInfo(form) {
    window.ajax.post(window.config.root + '/vip_manage/vip_manage/getInfo', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "VIP_INFO_INIT",
                payload: ret.data
            });
        }
    });
}
//清空客户信息
export function clearVipInfo(form) {
    window.store.dispatch({
        type: "VIP_INFO_CLEAR",
    });
}
//保存客户信息
export function setVipInfo(form, search) {
    window.ajax.post(window.config.root + '/vip_manage/vip_manage/edit', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("vipInfo");
            getVipManage(search);
        }
    });
}
//新建客户信息
export function createVipInfo(form, search) {
    window.ajax.post(window.config.root + '/vip_manage/vip_manage/create', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            utilAction.close("vipInfo");
            getVipManage(search);
        }
    });
}
//备注弹窗
export function remark(item, search) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("remark");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "remark",
            fade: true,
            view: <Remark onClick={call} item={item}
                          search={search}/>
        }
    });
}
//保存备注
export function editRemark(form, search) {
    window.ajax.post(window.config.root + '/vip_manage/vip_manage/remake', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            utilAction.close("remark");
            getVipManage(search);
        }
    });
}
