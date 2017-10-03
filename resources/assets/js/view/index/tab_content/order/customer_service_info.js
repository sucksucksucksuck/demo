/**
 * Created by sucksuck on 2017/4/27.
 */


import React from 'react';
import * as orderAction from '../../../../action/order';
import {connect} from 'react-redux';
import Form from'../../../../modules/form';
import * as utilAction from '../../../../action/util';

const order_status = {
    1: "待确认",
    2: "订单确认",
    3: "已发货",
    4: "已签收",
    5: "夺宝完成"
};
const status = {
    1:  "未开奖",
    2:  "等待开奖",
    3:  "已开奖",
    4:  "已关闭",
};
const module = 214;
class CustomerServiceInfo extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['orderCustomerInfo'];
        // this.state = this.props.extend;
        // console.log(this.props);
    }

    componentDidMount() {  //render前
        orderAction.getCustomerInfo({id: this.props.extend});

    }

    componentWillMount() {  //render前

    }
    componentWillUnmount() {
        orderAction.clear();
    }
    componentWillUpdate() {

    }
    componentWillReceiveProps(props) {
        this.state = props['orderCustomerInfo'];
        this.forceUpdate();
    }

    onCancel() {
        window.history.back();
    }
    luckyCode(){
        let p =[];
        for(let x in this.props.orderCustomerInfo.lucky_codes){
            if(this.state.info.lucky_code===this.props.orderCustomerInfo.lucky_codes[x].lucky_code){
                p.push(<span key={x} className="red">{this.props.orderCustomerInfo.lucky_codes[x].lucky_code}</span>);
            }else {
                p.push(<span key={x}>{this.props.orderCustomerInfo.lucky_codes[x].lucky_code}</span>);

            }
        }
        return p;
    }
    status(){
        if(this.state.info.status) {
            return status[this.state.info.status];
        }
    }
    orderStatus(){
        if(this.state.info.order_status) {
            return order_status[this.state.info.order_status];
        }
    }
    onSubmit() {
        utilAction.confirm("是否确认修改?", () => {
            orderAction.setWinningInfo(this.refs['form'].getValue(this.state.info));
            return true;
        });
    }
    getOrderId() {
        let id = [];
        for(let x in this.state.info.pay_order_id) {
            id.push(<span key={x}>{this.state.info.pay_order_id[x]}</span>)
        }
        return id;
    }
    render() {
        return (
            <div className="order-form">
                <div className="info">
                    <div className="detail">
                        <img src={this.state.info.icon} onError={(e) => {
                            e.target.src = window.config.root + "/image/index/index_user.png";
                        }}/>
                        <div className="text">
                            <div><a href={this.state.info.url} target="_blank" title={this.state.info.title}>{this.state.info.title}</a></div>
                            <div>
                                <span>单价:{this.state.info.unit_price}</span>
                                <span>商品ID:{this.state.info.goods_id}</span>
                                <span>期数:{this.state.info.periods}</span>
                                <span>期数ID:{this.state.info.id}</span>
                            </div>
                        </div>
                    </div>
                    <div className="date">
                        <div>揭晓时间:{this.state.info.lottery_show_at}</div>
                        <div>发货时间:{this.state.info.deliver_at}</div>
                    </div>
                </div>
                <div className="wrap">
                    <Form ref="form"
                          defaultValue={this.state.info}
                          onSubmit={this.onSubmit.bind(this)}
                          onChange={(e) => {
                              this.state[e.target.name] = e.target.value;
                          }}
                          save={false}
                    >
                        <div className="item-title">订单编号</div>
                        <div className="id-disable">{this.state.info.order_id}</div>
                        <div className="item-title">开奖结果</div>
                        <div className="id-disable">{this.status()}</div>
                        <div className="item-title">订单状态</div>
                        <div className="id-disable">{this.orderStatus()}</div>
                        <div className="item-title">购买人次</div>
                        <div className="id-disable">{this.state.info.num}</div>
                        <div className="item-title">实付款</div>
                        <div className="lucky">{Math.abs(this.state.info.ual_amount)}元
                            {this.state.info.red_title ? <span>已使用{this.state.info.red_title}</span> : null}
                            <div>该付款包含的订单:{this.getOrderId()}</div>
                        </div>
                        <div className="item-title">本期该ID购买总数</div>
                        <div className="id-disable">{this.state.info.num_sum}</div>
                        <div className="item-title">夺宝号码</div>
                        <div className="lucky">
                            {this.luckyCode()}
                        </div>
                        <div className="item-title">用户昵称</div>
                        <div className="id-disable">{this.state.info.nickname}</div>
                        <div className="item-title">用户UID</div>
                        <div className="id-disable">{this.state.info.user_id}</div>
                        <div className="item-title">下单IP</div>
                        <div className="id-disable">{this.state.info.ip}</div>
                        <div className="item-title">商品实际金额</div>
                        <div className="id-disable">{this.state.info.amount}</div>
                    </Form>
                </div>
            </div>
        )
    }
}

export default connect(({orderCustomerInfo}) => ({orderCustomerInfo}))(CustomerServiceInfo);
