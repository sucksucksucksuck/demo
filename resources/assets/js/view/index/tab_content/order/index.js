/**
 * Created by sucksuck on 2017/4/6.
 */

import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom'
import AbsOrder from './abs_order';
import * as orderAction from '../../../../action/order';
import * as openWindow from '../../../../modules/open_window/user_all_order';
import DateInput from '../../../../modules/date_input';
import Select from '../../../../modules/select';

const head = [
    {"text": "商品图标", "key": "icon", "type": "img", className: "img w80"},
    {"text": "商品名字", "key": "title", className: "w400"},
    {"text": "用户ID", "key": "user_id", "type": "user", className: "user"},
    {"text": "收货人信息", "key": "contact", "type": "contact", className: "w150"},
    {"text": "购买次数", "key": "num", "type": "num", className: "w80"},
    {"text": "总需次数", "key": "total", "type": "total", className: "w80"},
    {"text": "商品原价", "key": "amount", "type": "amount", className: "real_amount w80"},
    {"text": "订单状态", "key": "winning", "type": "winning", className: "w80"},
    {"text": "开奖结果", "key": "status", "type": "status", className: "w80"}
];
const status = {
    1: "未开奖",
    2: "等待开奖",
    3: "已开奖",
    4: "已关闭",
};
const order_status = {
    1: "待确认",
    2: "订单确认",
    3: "已发货",
    4: "已签收",
    5: "夺宝完成",
    6: "打款失败",
};
const user_type = {
    "0": "普通用户",
    "1": "机器人",
    "3": "特殊用户",
    "4": "客服"
};
const module = 205;
class Order extends AbsOrder {
    constructor(props) {
        super(props, module);
        this.state = props['order'];
        this.state.checkbox = false;
    }

    componentWillReceiveProps(props) {
        this.state = props['order'];
        this.forceUpdate();
    }

    getTableHead() {
        return head;
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
                <select ref="order_status" name="order_status">
                    <option value="">全部</option>
                    <option value="1">待确认</option>
                    <option value="2">订单确认</option>
                    <option value="3">已发货</option>
                    <option value="4">已签收</option>
                    <option value="5">夺宝完成</option>
                    <option value="6">打款失败</option>
                </select>
            </div>,
            <div key="13" className="item">
                <div>中奖状态</div>
                <select name="winning" ref="winning">
                    <option value="">全部</option>
                    <option value="0">未中奖</option>
                    <option value="1">已中奖</option>
                </select>
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
                <input type="text" name="periods_id"/>
            </div>,
            <div key="10" className="item">
                <div>收货人信息</div>
                <input type="text" name="contact_name"/>
            </div>,
            <div key="14" className="item">
                <div>用户类型</div>
                <Select name="user_type" object={true} opts={user_type} defaultText="全部"/>
            </div>,
            <div key="12" className="item">
                <div>支付单号</div>
                <input type="text" name="order_no"/>
            </div>,
            <DateInput title="购买时间" key="11" name="12" start="start_time" end="end_time"/>
        ];
    }

    getSearchRows() {
        return this.state.rows;
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
        if (head.type === "winning") {
            if (val == 0) {
                return "未中奖";
            } else {
                return <div className="order-status">{order_status[item.order_status]}</div>;
            }
        }
        if (head.type == "contact") {
            if (item.winning == 0) {
                return null;
            } else {
                return (<div>
                    <div>{item.contact_name}</div>
                    <div>{item.contact_id}</div>
                    <div>{item.contact_phone}</div>
                </div>);
            }
        }
        if (head.type === "status") {
            return status[val];
        }
        if (head.type === "amount") {
            return <div>
                <div>{item.amount}</div>
                <div>{item.real_amount}</div>
            </div>;
        }

    }

    getNavigator() {
        return null;
    }

    getTotal() {
        return this.state.total;
    }

    getPage() {
        return this.state.search.page;
    }

    onSubmit() {
        this.state.search.page = 1;
        if (this.state.search.user_id && window.hasPermission(205, 1)) {
            this.state.user = true;
        } else {
            this.state.user = false;
        }
        orderAction.getAll(this.state.search);
    }

    componentDidMount() {  //render前
        orderAction.getAll(this.state.search);
        orderAction.getGoodsCategory();
        //隐藏行数 确定按钮 输入页码框
        // document.getElementsByClassName("ok")[0].style.display = "none";

    }

    getTableButton() {
        let btn = [<NavLink key="1" name="details" to="/order/info/${order_id}">订单详情</NavLink>];
        return btn;
    }

    onPage(page, pageSize) {
        this.state.search.page = page;
        this.state.search.page_size = pageSize;
        orderAction.getAll(this.state.search);
        this.forceUpdate();
    }


    onFormChange(e) {
        this.state.search[e.target.name] = e.target.value;
        if (e.target.name === "order_status" && e.target.value != "") {
            this.refs['winning'].value = "1";
            this.state.search.winning = "1";
        }
        if (e.target.name === "winning" && e.target.value == "0") {
            this.refs['order_status'].value = "";
            this.state.search.order_status = "";
        }
        this.forceUpdate();
    }

    onPageSizeChange(e) {
        if (e.target.value == "") {
            this.state.page_size = "";
        } else {
            let page = parseInt(e.target.value);
            if (!page) {
                this.state.page_size = "";
            } else {
                if (page > 100) {
                    this.state.page_size = 100;
                } else {
                    this.state.page_size = page;
                }
            }
            this.forceUpdate();
        }
    }


}

export default connect(({order}) => ({order}))(Order);
