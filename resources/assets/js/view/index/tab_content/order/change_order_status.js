/**
 * Created by sucksuck on 2017/4/13.
 */

import React from 'react';
import * as orderAction from '../../../../action/order';
import * as utilAction from '../../../../action/util';
import Form from '../../../../modules/form';
class ChangeOrderSatus extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            orderStatus: props.orderStatus,
            orderType: props.orderType,
            id: props.id,
            search: props.search
        };
    }

    onClick(type, e) {
        e.preventDefault();
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }


    componentWillMount() {
        // console.log(this.state);
    }

    componentWillReceiveProps(props) {
        this.forceUpdate();
    }

    onSubmit(e) {
        e.preventDefault();
        // console.log(this.state);
        if (this.state.orderType === "winning") {
            utilAction.confirm("是否确定修改该订单的状态", () => {
                orderAction.changeWinningOrderStatus({
                    id: this.state.id,
                    order_status: this.state.orderStatus
                }, this.state.search);
                return true;
            });
        }
        if (this.state.orderType === "entity") {
            utilAction.confirm("是否确定修改该订单的状态", () => {
                orderAction.changeEntityOrderStatus({
                    id: this.state.id,
                    order_status: this.state.orderStatus
                }, this.state.search);
                return true;
            });
        }
        if (this.state.orderType === "fictitiousLow") {
            utilAction.confirm("是否确定修改该订单的状态", () => {
                orderAction.changeFictitiousLowOrderStatus({
                    id: this.state.id,
                    order_status: this.state.orderStatus
                }, this.state.search);
                return true;
            });
        }
        if (this.state.orderType === "fictitious") {
            utilAction.confirm("是否确定修改该订单的状态", () => {
                orderAction.changeFictitiousOrderStatus({
                    id: this.state.id,
                    order_status: this.state.orderStatus
                }, this.state.search);
                return true;
            });
        }
        if (this.state.orderType === "exchange") {
            utilAction.confirm("是否确定修改该订单的状态", () => {
                orderAction.changeExchangeOrderStatus({
                    id: this.state.id,
                    order_status: this.state.orderStatus
                }, this.state.search);
                return true;
            });
        }
        if (this.state.orderType === "customer") {
            utilAction.confirm("是否确定修改该订单的状态", () => {
                orderAction.changeCustomerOrderStatus({
                    id: this.state.id,
                    order_status: this.state.orderStatus
                }, this.state.search);
                return true;
            });
        }

    }

    componentWillUnmount() {
        // platformAction.clear();
    }

    render() {
        return (
            <div className="change-order-status">
                <div className="title">修改订单状态
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <Form className="wrap"
                      defaultValue={this.state}>
                    <span className="item-title">订单状态:</span>
                    <select name="orderStatus"
                            onChange={(e) => {
                                this.state.orderStatus = e.target.value;
                                this.forceUpdate();
                            }}>
                        <option value="1">待确认</option>
                        <option value="2">订单确认</option>
                        <option value="3">已发货</option>
                        <option value="4">已签收</option>
                        <option value="5">夺宝完成</option>
                        {this.state.orderType == "fictitious" || this.state.orderType == "fictitiousLow" || this.state.orderType == "winning" || this.state.orderType == "customer" ?
                            <option value="6">打款失败</option> : null}
                    </select>
                </Form>
                <div className="button">
                    <button type="button"
                            className="blue"
                            onClick={this.onSubmit.bind(this)}>保存
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>

            </div>);
    }
}
export default ChangeOrderSatus;

