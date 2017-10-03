/**
 * Created by s on 2017/3/13.
 */
import * as utilAction from '../util';
import React from 'react';
import ChangeOrderSatus from '../../view/index/tab_content/order/change_order_status';
import EntityDelivery from '../../view/index/tab_content/order/entity_delivery';
import FictitiousDelivery from '../../view/index/tab_content/order/fictitious_delivery';
import FictitiousLowDelivery from '../../view/index/tab_content/order/fictitious_low_delivery';
import * as openWindow from '../../modules/open_window';


//获取商品分类
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
//修改订单状态弹窗
export function changeOrderStatus(ordertype, id, orderstatus, search) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("changeOrderStatus");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "changeOrderStatus",
            fade: true,
            view: <ChangeOrderSatus onClick={call} orderType={ordertype} id={id} orderStatus={orderstatus}
                                    search={search}/>
        }
    });
}
//详情清除
export function clear() {
    window.store.dispatch({
        type: "ORDER_DETAILS_CLEAR"
    });
}
//操作人列表
export function adminList() {
    window.ajax.post(window.config.root + '/platform/admin/operator_list', function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "ADMIN_LIST_INIT",
                payload: ret.data
            });
        }
    });
}

//实物订单列表
export function getEntity(form) {
    window.ajax.post(window.config.root + '/order/entity', form, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: "ORDER_ENTITY_INIT",
                payload: ret.data
            });
            // console.log(ret.data);
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//实物详情
export function getEntityInfo(form) {
    window.ajax.post(window.config.root + '/order/entity_info', form, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'ORDER_ENTITY_INFO_INIT',
                payload: ret.data
            });
            if (!form.operation) {
                getEntityLuckyCode({
                    id: ret.data.id,
                    order_id: ret.data.order_id,
                    user_id: ret.data.user_id,
                    page_size: 100000000
                });
            }

        } else {
            utilAction.prompt(ret.msg);
            if (ret.errcode == 1002) {
                utilAction.close("delivery");
            }
        }
    });
}
//实物发货 保存 和 发货 按钮
export function entityDelivery(form) {
    // console.log(form);
    window.ajax.post(window.config.root + '/order/entity_info/delivery', form, function (ret) {
        if (ret.errcode == 0) {
            utilAction.prompt(ret.msg);
            utilAction.close("delivery");
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//保存实物详情
export function setEntityInfo(form) {
    // console.log(form);
    window.ajax.post(window.config.root + '/order/entity_info/edit', form, function (ret) {
        if (ret.errcode == 0) {
            utilAction.prompt(ret.msg);
            window.history.back();
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//实物->虚拟
export function entityConversion(form) {
    window.ajax.post(window.config.root + '/order/entity_info/conversion', form, function (ret) {
        if (ret.errcode == 0) {
            utilAction.prompt(ret.msg);
            utilAction.close("delivery");
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//实物解锁
export function entityUnlock(id) {
    window.ajax.post(window.config.root + '/order/entity_info/unlock', id, function (ret) {

    });
}
//实物订单修改状态
export function changeEntityOrderStatus(form, search) {
    window.ajax.post(window.config.root + '/order/entity/order_status', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            utilAction.close("changeOrderStatus");
            getEntity(search);
        }
    });
}
//实物订单 状态->完成
export function entityComplete(id, search) {
    // console.log(id);
    window.ajax.post(window.config.root + '/order/entity/complete', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            getEntity(search);
        }
    });
}
//清理数据
export function entityClear() {
    window.store.dispatch({
        type: "ORDER_ENTITY_CLEAR"
    });
}
//实物下载
export function entityExcel(form) {
    openWindow.post(window.config.root + '/order/entity/excel', form, (ret) => {
    });
}
//幸运码
export function getEntityLuckyCode(form) {
    // console.log(form);
    window.ajax.post(window.config.root + '/order/entity/lucky', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "LUCKY_CODES_INIT",
                payload: ret.data
            });
        }
    });
}
//保存实物发货信息
// export function setEntityDelivery(form) {
//     console.log(form);
//     window.ajax.post(window.config.root + '/order/entityinfo/delivery',form, function (ret) {
//         console.log(ret);
//         if (ret.errcode == 0) {
//             utilAction.prompt(ret.msg);
//         } else {
//             if(ret.errcode!=403) {
//                 utilAction.prompt(ret.msg);
//             }
//             if(ret.errcode==403){
//                 utilAction.permission("很可惜，您还没有权限哦，请联系管理员~");
//             }
//         }
//     });
// }
// //保存实物发货信息
// export function setEntityDelivery(form) {
//     // console.log(form);
//     window.ajax.post(window.config.root + '/order/entity_info/delivery',form, function (ret) {
//         console.log(ret);
//         if (ret.errcode == 0) {
//             utilAction.prompt(ret.msg);
//             window.history.back();
//         } else {
//             if(ret.errcode!=403) {
//                 utilAction.prompt(ret.msg);
//             }
//             if(ret.errcode==403){
//                 utilAction.permission("很可惜，您还没有权限哦，请联系管理员~");
//             }
//         }
//     });
// }

//实物->我要发货弹窗
export function deliveryPopUp(type, item, search) {
    // console.log(search);
    if (type == "entity") {
        let call = function (type) {
            if (type === "cancel") {
                utilAction.close("delivery");
            }
        };
        window.store.dispatch({
            type: "DIALOG_OPEN",
            payload: {
                key: "delivery",
                fade: true,
                view: <EntityDelivery onClick={call} type={type} item={item} search={search}/>
            }
        });
    } else if (type == "fictitious") {
        let call = function (type) {
            if (type === "cancel") {
                utilAction.close("delivery");
            }
        };
        window.store.dispatch({
            type: "DIALOG_OPEN",
            payload: {
                key: "delivery",
                fade: true,
                view: <FictitiousDelivery onClick={call} type={type} item={item} search={search}/>
            }
        });
    } else if (type == "fictitiousLow") {
        let call = function (type) {
            if (type === "cancel") {
                utilAction.close("delivery");
            }
        };
        window.store.dispatch({
            type: "DIALOG_OPEN",
            payload: {
                key: "delivery",
                fade: true,
                view: <FictitiousLowDelivery onClick={call} type={type} item={item} search={search}/>
            }
        });
    }

}

//虚拟订单列表
export function getFictitious(form) {
    window.ajax.post(window.config.root + '/order/fictitious', form, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'ORDER_FICTITIOUS_INIT',
                payload: ret.data
            });
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//虚拟详情
export function getFictitiousInfo(id) {
    // console.log(id);
    window.ajax.post(window.config.root + '/order/fictitious_info', id, function (ret) {
        // console.log(ret);
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'ORDER_FICTITIOUS_INFO_INIT',
                payload: ret.data
            });
            if (!id.operation) {
                getFictitiousLuckyCode({
                    id: ret.data.id,
                    order_id: ret.data.order_id,
                    user_id: ret.data.user_id,
                    page_size: 100000000
                });
            }
        } else {
            utilAction.prompt(ret.msg);
            if (ret.errcode == 1002) {
                utilAction.close("delivery");
            }
        }
    });
}
//保存虚拟详情
export function setFictitiousInfo(form) {
    // console.log(form);
    window.ajax.post(window.config.root + '/order/fictitious_info/edit', form, function (ret) {
        // console.log(ret);
        if (ret.errcode == 0) {
            utilAction.prompt(ret.msg);
            window.history.back();
        } else {
            utilAction.prompt(ret.msg);
        }

    });
}
//虚拟发货 保存 和 发货 按钮
export function fictitiousDelivery(form) {
    // console.log(form);
    window.ajax.post(window.config.root + '/order/fictitious_info/delivery', form, function (ret) {
        if (ret.errcode == 0) {
            utilAction.prompt(ret.msg);
            utilAction.close("delivery");
        } else if (ret.errcode == 2102) {
            utilAction.prompt(ret.msg);
            utilAction.close("delivery");
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//虚拟订单修改状态
export function changeFictitiousOrderStatus(form, search) {
    window.ajax.post(window.config.root + '/order/fictitious/order_status', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            utilAction.close("changeOrderStatus");
            getFictitious(search);
        }
    });
}
//虚拟订单 状态->完成
export function ficitiousComplete(id, search) {
    window.ajax.post(window.config.root + '/order/fictitious/complete', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            getFictitious(search);
        }
    });
}
//清理数据
export function fictitiousClear() {
    window.store.dispatch({
        type: "ORDER_FICTITIOUS_CLEAR"
    });
}
//虚拟下载
export function fictitiousExcel(form) {
    openWindow.post(window.config.root + '/order/fictitious/excel', form, (ret) => {
    });
}
//幸运码
export function getFictitiousLuckyCode(form) {
    window.ajax.post(window.config.root + '/order/fictitious/lucky', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "LUCKY_CODES_INIT",
                payload: ret.data
            });
        }
    });
}
//虚拟->实物
export function fictitiousConversion(form) {
    window.ajax.post(window.config.root + '/order/fictitious_info/conversion', form, function (ret) {
        if (ret.errcode == 0) {
            utilAction.prompt(ret.msg);
            utilAction.close("delivery");
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//虚拟解锁
export function fictitiousUnlock(id) {
    window.ajax.post(window.config.root + '/order/fictitious_info/unlock', id, function (ret) {

    });
}

//虚拟低额订单列表
export function getFictitiousLow(form) {
    window.ajax.post(window.config.root + '/order/fictitious_low', form, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'ORDER_FICTITIOUS_LOW_INIT',
                payload: ret.data
            });
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//虚拟低额详情
export function getFictitiousLowInfo(id) {
    // console.log(id);
    window.ajax.post(window.config.root + '/order/fictitious_low_info', id, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'ORDER_FICTITIOUS_LOW_INFO_INIT',
                payload: ret.data
            });
            if (!id.operation) {
                getFictitiousLowLuckyCode({
                    id: ret.data.id,
                    order_id: ret.data.order_id,
                    user_id: ret.data.user_id,
                    page_size: 100000000
                });
            }
        } else {
            utilAction.prompt(ret.msg);
            if (ret.errcode == 1002) {
                utilAction.close("delivery");
            }
        }
    });
}
//保存虚拟低额详情
export function setFictitiousLowInfo(form) {
    // console.log(form);
    window.ajax.post(window.config.root + '/order/fictitious_low_info/edit', form, function (ret) {
        // console.log(ret);
        if (ret.errcode == 0) {
            utilAction.prompt(ret.msg);
            window.history.back();
        } else {
            utilAction.prompt(ret.msg);
        }

    });
}
//虚拟低额发货 保存 和 发货 按钮
export function fictitiousLowDelivery(form) {
    window.ajax.post(window.config.root + '/order/fictitious_low_info/delivery', form, function (ret) {
        if (ret.errcode == 0) {
            utilAction.prompt(ret.msg);
            utilAction.close("delivery");
        } else if (ret.errcode == 2102) {
            utilAction.prompt(ret.msg);
            utilAction.close("delivery");
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//虚拟低额订单修改状态
export function changeFictitiousLowOrderStatus(form, search) {
    window.ajax.post(window.config.root + '/order/fictitious_low/order_status', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            utilAction.close("changeOrderStatus");
            getFictitiousLow(search);
        }
    });
}
//虚拟低额订单 状态->完成
export function ficitiousLowComplete(id, search) {
    window.ajax.post(window.config.root + '/order/fictitious_low/complete', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            getFictitiousLow(search);
        }
    });
}
//清理数据
export function fictitiousLowClear() {
    window.store.dispatch({
        type: "ORDER_FICTITIOUS_LOW_CLEAR"
    });
}
//虚拟低额下载
export function fictitiousLowExcel(form) {
    openWindow.post(window.config.root + '/order/fictitious_low/excel', form, (ret) => {
    });
}
//幸运码
export function getFictitiousLowLuckyCode(form) {
    window.ajax.post(window.config.root + '/order/fictitious_low/lucky', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "LUCKY_CODES_INIT",
                payload: ret.data
            });
        }
    });
}
//虚拟->实物
export function fictitiousLowConversion(form) {
    window.ajax.post(window.config.root + '/order/fictitious_low_info/conversion', form, function (ret) {
        if (ret.errcode == 0) {
            utilAction.prompt(ret.msg);
            utilAction.close("delivery");
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//虚拟解锁
export function fictitiousLowUnlock(id) {
    window.ajax.post(window.config.root + '/order/fictitious_low_info/unlock', id, function (ret) {

    });
}

//虚拟自动列表
export function getExchange(form) {
    window.ajax.post(window.config.root + '/order/fictitious_exchange', form, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'ORDER_EXCHANGE_INIT',
                payload: ret.data
            });
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//虚拟自动详情
export function getExchangeInfo(id) {
    window.ajax.post(window.config.root + '/order/fictitious_exchange_info', id, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'ORDER_EXCHANGE_INFO_INIT',
                payload: ret.data
            });
            getExchangeLuckyCode({
                id: ret.data.id,
                order_id: ret.data.order_id,
                user_id: ret.data.user_id,
                page_size: 100000000
            });
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//保存虚拟自动详情
export function setExchangeInfo(form) {
    window.ajax.post(window.config.root + '/order/fictitious_exchange_info/edit', form, function (ret) {
        if (ret.errcode == 0) {
            utilAction.prompt(ret.msg);
            window.history.back();
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}

//虚拟自动订单修改状态
export function changeExchangeOrderStatus(form, search) {
    window.ajax.post(window.config.root + '/order/fictitious_exchange/order_status', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            utilAction.close("changeOrderStatus");
            getExchange(search);
        }
    });
}
//虚拟自动 状态->完成
export function exchangeComplete(id, search) {
    window.ajax.post(window.config.root + '/order/fictitious_exchange/complete', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            getExchange(search);
        }
    });
}
//清理数据
export function exchangeClear() {
    window.store.dispatch({
        type: "ORDER_EXCHANGE_CLEAR"
    });
}
//虚拟自动下载
export function exchangeExcel(form) {
    openWindow.post(window.config.root + '/order/fictitious_exchange/excel', form, (ret) => {
    });
}
//幸运码
export function getExchangeLuckyCode(id) {
    window.ajax.post(window.config.root + '/order/fictitious_exchange/lucky', id, function (ret) {
        if (ret.errcode) {
            if (ret.errcode != 403) {
                utilAction.prompt(ret.msg);
            }

        } else {
            window.store.dispatch({
                type: "LUCKY_CODES_INIT",
                payload: ret.data
            });
        }
    });
}

//中奖列表
export function getWinning(form) {
    window.ajax.post(window.config.root + '/order/winning', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: 'ORDER_WINNING_SEARCH',
                payload: ret.data
            });
        }
    });
}
// 中奖详情
export function getWinningInfo(form) {
    window.ajax.post(window.config.root + '/order/winning_info', form, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'WINNING_INFO_INIT',
                payload: ret.data
            });
            getWinningLuckyCode({
                id: ret.data.id,
                order_id: ret.data.order_id,
                user_id: ret.data.user_id,
                page_size: 100000000
            });
        } else {
            utilAction.prompt(ret.msg);

        }
    });
}
//保存中奖详情
export function setWinningInfo(form) {
    window.ajax.post(window.config.root + '/order/winning_info/edit', form, function (ret) {
        if (ret.errcode == 0) {
            utilAction.prompt(ret.msg);
            window.history.back();
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//中奖订单修改状态
export function changeWinningOrderStatus(form, search) {
    window.ajax.post(window.config.root + '/order/winning/order_status', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            utilAction.close("changeOrderStatus");
            getWinning(search);
        }
    });
}
//中奖订单 状态->完成
export function winningComplete(id, search) {
    window.ajax.post(window.config.root + '/order/winning/complete', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            getWinning(search);
        }
    });
}
//清理数据
export function winningClear() {
    window.store.dispatch({
        type: "ORDER_WINNING_CLEAR"
    });
}
//中奖下载
export function winningExcel(form) {
    openWindow.post(window.config.root + '/order/winning/excel', form, (ret) => {
    });
}
//幸运码
export function getWinningLuckyCode(id) {
    window.ajax.post(window.config.root + '/order/winning/lucky', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "LUCKY_CODES_INIT",
                payload: ret.data
            });
        }
    });
}

//客服列表
export function getCustomer(form) {
    window.ajax.post(window.config.root + '/order/customer_service', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: 'ORDER_CUSTOMER_SERVICE_SEARCH',
                payload: ret.data
            });
        }
    });
}
//客服详情
export function getCustomerInfo(form) {
    window.ajax.post(window.config.root + '/order/customer_service_info', form, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'CUSTOMER_SERVICE_INFO_INIT',
                payload: ret.data
            });
            getCustomerLuckyCode({
                id: ret.data.id,
                order_id: ret.data.order_id,
                user_id: ret.data.user_id,
                page_size: 100000000
            });
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//客服订单修改状态
export function changeCustomerOrderStatus(form, search) {
    window.ajax.post(window.config.root + '/order/customer_service/order_status', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            utilAction.close("changeOrderStatus");
            getCustomer(search);
        }
    });
}
//客服订单 状态->完成
export function customerComplete(id, search) {
    window.ajax.post(window.config.root + '/order/customer_service/complete', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.prompt(ret.msg);
            getCustomer(search);
        }
    });
}
//客服下载
export function customerExcel(form) {
    openWindow.post(window.config.root + '/order/customer_service/excel', form, (ret) => {
    });
}
//幸运码
export function getCustomerLuckyCode(id) {
    window.ajax.post(window.config.root + '/order/customer_service/lucky', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "LUCKY_CODES_INIT",
                payload: ret.data
            });

        }
    });
}

//所有订单列表
export function getAll(form) {
    window.ajax.post(window.config.root + '/order/all', form, function (ret) {
        if (ret.errcode == 0) {
            if (ret.data.rows.length == 0) {
                utilAction.prompt("没有数据，返回上一次浏览页面");
            }
            window.store.dispatch({
                type: 'ORDER_ALL_INIT',
                payload: ret.data
            });
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//所有订单详情
export function getAllOrderInfo(form) {
    window.ajax.post(window.config.root + '/order/all_info', form, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'ALL_ORDER_INFO_INIT',
                payload: ret.data
            });
            getAllLuckyCode({
                id: ret.data.id,
                order_id: ret.data.order_id,
                user_id: ret.data.user_id,
                page_size: 100000000
            });
        } else {
            utilAction.prompt(ret.msg);

        }
    });
}
//清理数据
export function allClear() {
    window.store.dispatch({
        type: "ORDER_ALL_CLEAR"
    });
}
//幸运码
export function getAllLuckyCode(id) {
    window.ajax.post(window.config.root + '/order/all/lucky', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "LUCKY_CODES_INIT",
                payload: ret.data
            });
        }
    });
}


//没中奖订单列表
export function getNotwinning(form) {
    window.ajax.post(window.config.root + '/order/notwinning', form, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'NOT_WINNING_INIT',
                payload: ret.data
            });
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//机器人
export function getRobot(form) {
    window.ajax.post(window.config.root + '/order/robot', form, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'ROBOT_INIT',
                payload: ret.data
            });
        } else {
            utilAction.prompt(ret.msg);
        }
    });
}
//保存虚拟发货信息
// export function setFictitiousDelivery(form){
//     window.ajax.post(window.config.root + '/order/fictitious_info/delivery',form, function (ret) {
//         // console.log(ret);
//         if (ret.errcode == 0) {
//             utilAction.prompt(ret.msg);
//             window.history.back();
//         } else {
//             if(ret.errcode!=403) {
//                 utilAction.prompt(ret.msg);
//             }
//             if(ret.errcode==403){
//                 utilAction.permission("很可惜，您还没有权限哦，请联系管理员~");
//             }
//         }
//     });
// }


//虚拟支付宝打款

//低额虚拟支付宝打款