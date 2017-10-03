/**
 * Created by sucksuck on 2017/7/11.
 * 机器人中奖订单
 */

import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom'
import AbsOrder from '../order/abs_order';
import * as shareAction from '../../../../action/share_order/robot';
import Select from '../../../../modules/select';
import DateInput from '../../../../modules/date_input';

const order_status = {
    1: "待确认",
    2: "订单确认",
    3: "已发货",
    4: "已签收",
    5: "夺宝完成"
};

const share = {
    "1": "已晒单",
    "2": "未晒单"
};

const head = [
    {"text": "商品图标", "key": "icon", "type": "img", className: "img w80"},
    {"text": "商品名字", "key": "title", className: "w400"},
    {"text": "用户", "key": "user", "type": "user", className: ""},
    {"text": "购买次数", "key": "num", "type": "num", className: "w80"},
    {"text": "商品原价", "key": "amount", "type": "amount", className: "real_amount w80"},
    {"text": "订单状态", "key": "order_status", "type": "order_status", className: "w80"},
    {"text": "晒单状态", "key": "share_id", "type": "share_id", className: "w80"}
];
const module = 401;

class Robot extends AbsOrder {
    constructor(props) {
        super(props, module);
        this.state = props['robot'];
    }

    componentWillReceiveProps(props) {
        this.state = props['robot'];
        this.forceUpdate();
    }

    componentDidMount() {
    }

    getColumnStyle(val, head, item) {
        if (head.type === "user") {
            return <div>
                <div>{item.nickname}</div>
                <div>{item.user_id}</div>
            </div>;
        }
        if (head.type === "share_id") {
            if (val == null) {
                return "未晒单";
            } else {
                return "已晒单";
            }
        }
        if (head.type === "order_status") {
            return order_status[val];
        }
    }

    onItemButtonClick(search, item, name) {
        if (name === "share") {
            shareAction.createShareOrder(item, search);
            // orderAction.deliveryPopUp("entity", item, search);

        }
    }

    periodsClick() {

    }

    getTableButton() {
        let btn = [
            <button key="2" module={module} action="1" compare="${share_id}==null" name="share">晒单分享</button>,
        ];
        return btn;
    }

    getSearch() {
        return [
            <div key="2" className="item">
                <div>订单编号</div>
                <input type="text" name="order_id"/>
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
            <div key="11" className="item">
                <div>晒单状态</div>
                <Select name="share" object={true} opts={share} defaultText="全部"/>
            </div>,
            <DateInput title="开奖时间" key="12" name="12" start="start_time" end="end_time"/>
        ];
    }

    componentWillUnmount() {
        // orderAction.entityClear();
    }

    componentWillMount() {  //render前
        shareAction.getList(this.state.search);
        shareAction.getGoodsCategory();
    }

    exportChecked() {
        let ids = this.refs['table'].getChecked();
    }

    getTableHead() {
        return head;
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

    onSubmit() {
        this.state.search.page = 1;
        shareAction.getList(this.state.search);

    }

    onPage(page, pageSize) {
        this.state.search.page = page;
        this.state.search.page_size = pageSize;
        shareAction.getList(this.state.search);

    }


}

export default connect(({robot}) => ({robot}))(Robot);
