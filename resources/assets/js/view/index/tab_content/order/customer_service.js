/**
 * Created by sucksuck on 2017/4/27.
 */

import React from 'react';
import {connect} from 'react-redux';
import AbsOrder from './abs_order';
import {NavLink} from 'react-router-dom'
import * as orderAction from '../../../../action/order';
import * as utilAction from '../../../../action/util';
import * as openWindow from '../../../../modules/open_window/user_all_order';
import Button from '../../../../modules/button';
import DateInput from '../../../../modules/date_input';
import Select from '../../../../modules/select';

const head = [
    {"text": "商品图标", "key": "icon", "type": "img", className: "img w80"},
    {"text": "商品名字", "key": "title", className: ""},
    {"text": "用户", "key": "user", "type": "user", className: "user"},
    {"text": "购买次数", "key": "num", "type": "num", className: " "},
    {"text": "总需人次", "key": "total", "type": "total", className: " "},
    {"text": "商品原价", "key": "amount", "type": "amount", className: "real_amount "},
    {"text": "订单状态", "key": "order_status", "type": "order_status", className: ""}

];

const order_status = {
    1: "待确认",
    2: "订单确认",
    3: "已发货",
    4: "已签收",
    5: "夺宝完成",
    6: "打款失败",
};

const module = 213;

class CustomerService extends AbsOrder {
    constructor(props) {
        super(props, module);
        this.state = props['orderCustomer'];
    }


    componentWillReceiveProps(props) {
        this.state = props['orderCustomer'];
        this.forceUpdate();
    }


    getTableHead() {
        return head;
    }

    exportChecked() {
        let ids = this.refs['table'].getChecked();
        if (ids.length) {
            orderAction.customerExcel({id: ids});
        } else {
            utilAction.prompt("请先选择订单");
        }
    }

    getSearch() {
        return [
            <div key="1" className="item">
                <div>用户ID</div>
                <input type="text" name="user_id"/>
            </div>,
            <div key="2" className="item">
                <div>订单编号</div>
                <input type="text" name="order_id"/>
            </div>,
            <div key="3" className="item">
                <div>价格范围</div>
                <input type="text" className="price" name="min_price"/>-
                <input type="text" className="price" name="max_price"/>
            </div>,
            <div key="4" className="item">
                <div>订单状态</div>
                <Select name="order_status" object={true} opts={order_status} defaultText="全部"/>
            </div>,
            <div key="5" className="item">
                <div>商品分类</div>
                <Select name="category_id" opts={this.state.category} value="id" text="title" defaultText="全部"/>
            </div>,
            <div key="6" className="item">
                <div>商品名字</div>
                <input type="text" name="title"/>
            </div>,
            <div key="7" className="item">
                <div>商品ID</div>
                <input type="text" name="goods_id"/>
            </div>,
            <div key="8" className="item">
                <div>商品期数</div>
                <input type="text" name="periods"/>
            </div>,
            <div key="9" className="item">
                <div>期数id</div>
                <input type="text" name="id"/>
            </div>,
            <DateInput title="开奖时间" key="11" name="12" start="start_time" end="end_time"/>
        ];
    }

    exportOption(e) {
        e.preventDefault();
        if ((this.state.end_time && this.state.start_time) || (this.state.deliver_start_time && this.state.deliver_end_time)) {
            orderAction.customerExcel({
                end_time: this.state.end_time,
                start_time: this.state.start_time,
                order_status: this.state.order_status,
                admin_id: this.state.admin_id
            });
        } else {
            this.state.warn = true;
            this.state.warnText = "请填写完整日期";
            this.forceUpdate();
        }
    }

    getColumnStyle(val, head, item) {
        if (head.type === "user") {
            return <div onMouseUp={() => {
                if (window.hasPermission(217, 0)) {
                    openWindow.userAllOrder(item.user_id);
                }
            }}>
                <div>{item.nickname}</div>
                <div>{item.user_id}</div>
            </div>;
        }
        if (head.type === "order_status") {
            return order_status[val];
        }
        if (head.type === "amount") {
            return <div>
                <div>{item.amount}</div>
                <div>{item.real_amount}</div>
            </div>;
        }

    }

    exportChange() {
        this.state.export = !this.state.export;
        this.state.exportAll = this.state.exportAll ? false : null;
        this.forceUpdate();
    }

    onSubmit() {
        this.state.search.page = 1;
        if (this.state.search.user_id && window.hasPermission(213, 4)) {
            this.state.user = true;
        } else {
            this.state.user = false;
        }
        orderAction.getCustomer(this.state.search);
    }

    componentWillUnmount() {
        // orderAction.winningClear();
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

    componentDidMount() {  //render前
        orderAction.getCustomer(this.state.search);
        orderAction.getGoodsCategory();
        orderAction.adminList();
    }


    getNavigator() {
        return (
            <div className="navigator">
                {this.getStatus()}
                <div className="button">
                    <Button>
                        <button name="1" module={module} action="2" onClick={this.complete.bind(this)}>夺宝完成</button>
                        <button name="2" module={module} action="1" onClick={this.exportChange.bind(this)}>导出</button>
                    </Button>
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
                            <div className={this.state.warn ? "red" : "black"}>{this.state.warnText}</div>
                            订单状态
                            <Select name="order_status" object={true} opts={order_status} defaultText="全部"/>
                            操作人:
                            <Select name="admin_id" opts={this.state.admin_list} value="id" text="truename"
                                    defaultText="全部"/>
                            <div className="button">
                                <button onClick={this.exportOption.bind(this)}>确定
                                </button>
                                <button onClick={this.closeExport.bind(this)}>取消
                                </button>
                            </div>
                        </form> : null}
                </div>
            </div>);
    }

    getTableButton() {
        let btn = [
            <NavLink key="1" module="214" action="0" name="details"
                     to="/order/customer_service/info/${id}">订单详情</NavLink>,
            <button key="2" module={module} action="3" name="order-status">修改订单状态</button>
        ];
        return btn;
    }

    onItemButtonClick(search, item, name) {
        if (name === "order-status") {
            orderAction.changeOrderStatus("customer", item['id'], item['order_status'], search);
        }
    }


    complete() {
        let ids = this.refs['table'].getChecked();
        if (ids.length !== 0) {
            utilAction.confirm("是否改变订单状态为'夺宝完成',请确认", () => {
                orderAction.customerComplete({id: ids}, this.state.search);
                // orderAction.getCustomer(this.state.search);
                return true;
            });

        } else {
            utilAction.prompt("请先选择订单");

        }
    }

    // onSale(status){
    //     this.state.search.status = status;
    //     orderAction.getWinning(this.state.search);
    //     this.forceUpdate();
    // }


    onPage(page, pageSize) {
        this.state.search.page = page;
        this.state.search.page_size = pageSize;
        orderAction.getCustomer(this.state.search);
    }
}

export default connect(({orderCustomer}) => ({orderCustomer}))(CustomerService);
