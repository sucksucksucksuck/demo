/**
 * Created by sucksuck on 2017/3/20.
 */

import React from 'react';
import {connect} from 'react-redux';
import List from '../order/list';
import * as orderAction from '../../../../action/order';

const head = [
    {"text": "商品图标", "key": "icon", "type": "img", className: "img w80"},
    {"text": "商品名字", "key": "title"},
    {"text": "期数", "key": "periods", "type": "periods", className: "period"},
    {"text": "用户", "key": "user", "type": "user", className: "user w150"},
    {"text": "实际金额", "key": "amount", "type": "amount"},
    {"text": "订单状态", "key": "order_status", "type": "order_status",className: "w100"},
    {"text": "开奖结果", "key": "status", "type": "status",className: "w100"},
];

class NotWinningList extends List {
    constructor(props) {
        super(props);
        this.state = props['notWinning'];
        // this.state.head = head;
        // this.state.page = 1;
        this.button = [];
        this.name = "notwinning";
        this.head = head;
    }

    componentDidMount() {  //render前
        orderAction.getNotwinning(this.state.search);
        this.state.export = false;
        this.state.exportAll = false;
        // this.state.search.page = 1;
        // this.forceUpdate();
    }

    componentWillMount() {
        orderAction.goodsCategory();
        this.getNavButton(this.state.button)
    }

    componentWillReceiveProps(props) {
        this.setState(props["notWinning"]);
        this.forceUpdate();
    }
    onSubmit() {
        this.state.search.page = 1;
        orderAction.getNotwinning(this.state.search);
    }
    onPage(page, page_size) {
        this.state.search.page = page;
        this.state.search.page_size = page_size;
        orderAction.getNotwinning(this.state.search);
    }
}
export default connect(({notWinning}) => ({notWinning}))(NotWinningList);