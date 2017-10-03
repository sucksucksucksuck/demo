/**
 * Created by sucksuck on 2017/3/20.
 */

import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom'
import AbsOrder from './abs_order';
import * as orderAction from '../../../../action/order';
import * as utilAction from '../../../../action/util';
import * as openWindow from '../../../../modules/open_window/user_all_order';


const head = [
    {"text": "商品图标", "key": "icon", "type": "img", className: "img w80"},
    {"text": "商品名字", "key": "title"},
    {"text": "用户", "key": "user", "type": "user", className: "user w150"},
    {"text": "收货人信息", "key": "vcontact", "type": "vcontact", className: "w150"},
    {"text": "购买次数", "key": "num", "type": "num"},
    {"text": "商品原价", "key": "amount", "type": "amount", className: "real_amount w80"},
    {"text": "订单状态", "key": "order_status", "type": "order_status", className: "w100"},
    {"text": "虚拟商品付款", "key": "payment_type", "type": "payment_type", className: "w100"}


];

const order_status = {
    1: "待确认",
    2: "订单确认",
    3: "已发货",
    4: "已签收",
    5: "夺宝完成"
};
const fictitious = {
    1: "手动打款",
    2: "兑吧审核",
    3: "拒绝打款",
    4: "成功打款"
};

const module = 204;
class Exchange extends AbsOrder {
    constructor(props) {
        super(props,module);
        this.state = props['orderExchange'];
        this.name = "exchange";
        this.head = head;
        this.name = "exchange";
        this.button = [
            {"text": "导出", "name": "export"}
        ];
    }

    componentWillReceiveProps(props) {
        this.state = props['orderExchange'];
        this.forceUpdate();
    }

    getTableHead() {
        return head;
    }

    getTableButton() {
        let btn = [
            <NavLink key="1" module="208" action="0" name="details" to="/order/fictitious/exchange/info/${id}" >订单详情</NavLink>,
            <button key="3" module={module} action="3" name="order-status">修改订单状态</button>
        ];
        return btn;
    }


    getColumnStyle(val, head, item) {
        if (head.type === "user") {
            return <div onMouseUp={()=>{
                if(window.hasPermission(217,0)){
                    openWindow.userAllOrder(item.user_id);
                }}}>
                <div>{item.nickname}</div>
                <div>{item.user_id}</div>
            </div>;
        }
        if (head.type === "order_status") {
            return order_status[val];
        }
        if (head.type == "vcontact") {
            return (<div>
                <div>{item.contact_name}</div>
                <div>{item.contact_id}</div>
            </div>)
        }
        if (head.type === "payment_type") {
            return fictitious[val];
        }
        if(head.type === "amount") {
            return <div>
                <div>{item.amount}</div>
                <div>{item.real_amount}</div>
            </div>;
        }
    }

    getNavigator() {
        return (
            <div className="navigator">
                {this.getStatus()}
                <div className="button">
                    {window.hasPermission(module, 2) ? <button onClick={this.complete.bind(this)}>夺宝完成</button> : null}
                    {window.hasPermission(module, 1) ?
                        <button onClick={this.exportChange.bind(this)}>导出</button> : null}
                    {this.state.export ? <div className="export-wrap" onClick={this.closeExport.bind(this)}/> : null}
                    {this.state.export ? <div className="export">
                        <button onClick={this.exportChecked.bind(this)}>勾选的订单</button>
                        <button onClick={this.exportBatchChange.bind(this)}>设置批量导出</button>
                    </div> : null}
                    {this.state.exportAll ? <div className="export-wrap" onClick={this.closeExport.bind(this)}/> : null}
                    {this.state.exportAll ?
                        <form onChange={this.dateChange.bind(this)}
                              className="export">
                            开奖时间
                            <div className="date">
                                <input ref="start_time" type="date" name="start_time"/>-
                                <input ref="end_time"
                                       type="date"
                                       name="end_time"/>
                            </div>

                            发货时间
                            <div className="date">
                                <input ref="deliver_start_time"
                                       type="date"
                                       name="deliver_start_time"/>-
                                <input ref="deliver_end_time"
                                       type="date"
                                       name="deliver_end_time"/>
                            </div>
                            <div className={this.state.warn ? "red" : "black"}>{this.state.warnText}</div>

                            订单状态
                            <select name="order_status">
                                <option value="">全部</option>
                                <option value="1">待确认</option>
                                <option value="2">订单确认</option>
                                <option value="3">已发货</option>
                                <option value="4">已签收</option>
                                <option value="5">夺宝完成</option>
                            </select>
                            操作人:
                            <select name="admin_id">
                                <option value="">全部</option>
                                {this.state.admin_list.map(function (item, index) {
                                    return <option key={index} value={item.id}>{item.truename}</option>;
                                })
                                }
                            </select>
                            <div className="button">
                                <button onClick={this.exportOption.bind(this)}>确定
                                </button>
                                <button  onClick={this.closeExport.bind(this)}>取消
                                </button>
                            </div>
                        </form> : null}
                </div>
            </div>);
    }

    onItemButtonClick(search, item, name) {
        if (name === "order-status") {
            orderAction.changeOrderStatus("exchange", item['id'], item['order_status'], search);
        }

    }

    exportChange() {
        this.state.export = !this.state.export;
        this.state.exportAll = this.state.exportAll ? false : null;
        this.forceUpdate();
    }

    onSubmit() {
        this.state.search.page = 1;
        orderAction.getExchange(this.state.search);
    }

    getSearchRows() {
        return this.state.rows;
    }

    getTotal() {
        return this.state.total;
    }

    getPage() {
        return this.state.search.page;
    }

    componentWillUnmount() {
        // orderAction.exchangeClear();
    }


    exportChecked() {
        let ids = this.refs['table'].getChecked();
        if (ids.length) {
            orderAction.exchangeExcel({id: ids});
        } else {
            utilAction.prompt("请先选择订单");
        }
    }

    exportOption(e) {
        e.preventDefault();
        if ((this.state.end_time && this.state.start_time) || (this.state.deliver_start_time && this.state.deliver_end_time)) {
            orderAction.exchangeExcel({end_time: this.state.end_time,
                start_time: this.state.start_time,
                deliver_start_time: this.state.deliver_start_time,
                deliver_end_time: this.state.deliver_end_time,
                order_status: this.state.order_status,
                admin_id: this.state.admin_id});
        } else {
            this.state.warn = true;
            this.state.warnText = "请填写完整日期";
            this.forceUpdate();
        }
        // console.log(this.state);
    }

    componentWillMount() {  //render前
        orderAction.getExchange(this.state.search);
        orderAction.getGoodsCategory();
        orderAction.adminList();

    }

    complete() {
        let ids = this.refs['table'].getChecked();
        if (ids.length !== 0) {
            utilAction.confirm("是否改变订单状态为'夺宝完成',请确认", () => {
                orderAction.exchangeComplete({id: ids},this.state.search);
                return true;
            });
        } else {
            utilAction.prompt("请先选择订单");

        }
    }

    onPage(page, pageSize) {
        this.state.search.page = page;
        this.state.search.page_size = pageSize;
        orderAction.getExchange(this.state.search);

    }
}
export default connect(({orderExchange}) => ({orderExchange}))(Exchange);
