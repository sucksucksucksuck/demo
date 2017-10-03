/**
 * Created by sucksuck on 2017/4/11.
 */

import React from 'react';
import * as orderAction from '../../../../action/order';
import {connect} from 'react-redux';
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

class AllOrderInfo extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['allOrderInfo'];
    }

    componentDidMount() {  //render前

    }
    componentWillReceiveProps(props) {
        this.state = props['allOrderInfo'];
        this.forceUpdate();
    }

    componentWillMount() {  //render前
        orderAction.getAllOrderInfo({id:this.props.extend});

    }

    componentWillUpdate() {

    }
    onCancel() {
        window.history.back();
    }
    luckyCode(){
        let p =[];
        for(let x in this.props.allOrderInfo.lucky_codes){
            if(this.state.info.lucky_code===this.props.allOrderInfo.lucky_codes[x].lucky_code){
                p.push(<span key={x} className="red">{this.props.allOrderInfo.lucky_codes[x].lucky_code}</span>);

            }else {
                p.push(<span key={x}>{this.props.allOrderInfo.lucky_codes[x].lucky_code}</span>);
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
        if(this.state.info.winning) {
            return order_status[this.state.info.order_status];
        }else {
            return "未中奖";
        }
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
                <div className="navigator">
                    <div className="detail">
                        <img src={this.state.info.icon} onError={(e) => {
                            e.target.src = window.config.root + "/image/index/index_user.png";
                        }}/>
                        <div className="text">
                            <div>{this.state.info.title}</div>
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
                    <form ref="form"
                          defaultValue={this.state.info}>
                        <div className="item-title">订单编号 </div>
                        <div className="id-disable" >{this.state.info.order_id}</div>
                        <div className="item-title">支付单号</div>
                        <div className="id-disable" >{this.state.info.order_no}</div>
                        <div className="item-title">开奖结果</div>
                        <div className="id-disable" >{this.status()}</div>
                        <div className="item-title">订单状态</div>
                        <div className="id-disable" >{this.orderStatus()}</div>
                        <div className="item-title">购买人次</div>
                        <div className="id-disable" >{this.state.info.num}</div>
                        <div className="item-title">实付款</div>
                        <div className="lucky">{Math.abs(this.state.info.ual_amount)}元
                            {this.state.info.red_title ? <span>已使用{this.state.info.red_title}</span> : null}
                            <div>该付款包含的订单:{this.getOrderId()}</div>
                        </div>
                        <div className="item-title">夺宝号码</div>
                        <div className="lucky">
                            {this.luckyCode()}
                        </div>
                        <div className="item-title">用户昵称</div>
                        <div className="id-disable" >{this.state.info.nickname}</div>
                        <div className="item-title">用户UID</div>
                        <div className="id-disable" >{this.state.info.user_id}</div>
                        <div className="item-title">下单IP</div>
                        <div className="id-disable" >{this.state.info.ip}</div>
                        <div className="item-title">商品实际金额</div>
                        <div className="id-disable" >{this.state.info.amount}</div>
                        {this.state.info.order_status==3?<div>
                            <div className="item-title">商品实际发货金额</div>
                            <div className="id-disable" >{this.state.info.real_amount}</div>
                        </div>:null}
                        {this.state.info.winning==1 && this.state.info.order_type==2?
                            <div>

                                <div className="item-title">收货人姓名</div>
                                <div className="id-disable">{this.state.info.contact_name}</div>
                                <div className="item-title" name="contact_phone">收货人联系方式</div>
                                <div className="id-disable">{this.state.info.contact_phone}</div>
                                <div className="item-title">收货人地址</div>
                                <div className="id-disable h80">{this.state.info.contact_id}</div>
                                <div className="item-title">快递公司</div>
                                <div className="id-disable">{this.state.info.payment_channel}</div>
                                <div className="item-title">快递单号</div>
                                <div className="id-disable">{this.state.info.payment_no}</div>
                                <div className="item-title">额外费用</div>
                                <div className="id-disable" >{this.state.info.payment_fee}</div>
                        </div>: null}
                        {this.state.info.winning==1 && this.state.info.order_type==1?
                            <div>
                                <div className="item-title">商品实际发货金额</div>
                                <div className="id-disable" >{this.state.info.real_amount}</div>
                                <div className="item-title">支付宝姓名</div>
                                <div className="id-disable">{this.state.info.contact_name}</div>
                                <div className="item-title">支付宝账号</div>
                                <div className="id-disable">{this.state.info.contact_id}</div>
                                <div className="item-title">打款支付宝</div>
                                <div className="id-disable">{this.state.info.payment_channel}</div>
                                <div className="item-title">打款银行卡</div>
                                <div className="id-disable">{this.state.info.payment_bank}</div>
                                <div className="item-title">额外费用</div>
                                <div className="id-disable">{this.state.info.payment_fee}</div>
                                <div className="item-title">流水号</div>
                                <div className="id-disable">{this.state.info.payment_no}</div>
                            </div>: null}
                        <div className="button">
                            <button type="button" onClick={this.onCancel}>取消</button>
                        </div>
                    </form>
                </div>
            </div>
        )

    }
}

export default connect(({allOrderInfo}) => ({allOrderInfo}))(AllOrderInfo);


