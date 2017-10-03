/**
 * Created by sucksuck on 2017/4/9.
 */


import React from 'react';
import ReactDom from 'react-dom';
import {connect} from 'react-redux';
import Form from'../../../../modules/form';
import * as orderAction from '../../../../action/order';
import Input from '../../../../modules/input';
import * as utilAction from '../../../../action/util';

const status = {
    1:  "未开奖",
    2:  "等待开奖",
    3:  "已开奖",
    4:  "已关闭",
};
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
const module = 208;

class OrderExchangeInfo extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['orderExchangeInfo'];
        // console.log(this.state);
    }

    componentDidMount() {  //render前
        // console.log(this.props.extend.id);
        orderAction.getExchangeInfo({id:this.props.extend});
    }

    componentWillMount() {  //render前

    }

    componentWillUpdate() {

    }

    componentWillReceiveProps(props) {
        this.state = props['orderExchangeInfo'];
        this.forceUpdate();

    }
    componentWillUnmount() {
        orderAction.clear();
    }
    onSubmit() {
        utilAction.confirm("是否确认修改?",()=>{
            // console.log(this.state.info);
            orderAction.setExchangeInfo(this.refs['form'].getValue(this.state.info));
            return true;
        });
    }
    onCancel() {
        window.history.back();
    }
    luckyCode(){
        let p =[];
        for(let x in this.state.lucky_codes){
            if(this.state.info.lucky_code===this.state.lucky_codes[x].lucky_code){
                p.push(<span key={x} className="red">{this.state.lucky_codes[x].lucky_code}</span>);

            }else {
                p.push(<span key={x}>{this.state.lucky_codes[x].lucky_code}</span>);

            }
        }
        return p;
    }
    orderStatus(){
        if(this.state.info.order_status) {
            return order_status[this.state.info.order_status];
        }
    }
    status(){
        if(this.state.info.status) {
            return status[this.state.info.status];
        }
    }
    paymentType() {
        if (this.state.info.payment_type) {
            return fictitious[this.state.info.payment_type];
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
                <div className="info">
                    <div className="detail">
                        <img src={this.state.info.icon} onError={(e) => {
                            e.target.src = window.config.root + "/image/index/index_user.png";
                        }}/>
                        <div className="text">
                            <div><a href={this.state.info.url} target="_blank" title={this.state.info.title}>{this.state.info.title}</a></div>
                            <div>
                                <span>单价:{this.state.info.unit_price}</span>
                                <span>商品ID:{this.props.extend.goods_id}</span>
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
                          onChange={(e)=>{
                              this.state.info[e.target.name]=e.target.value;
                          }}
                          save={window.hasPermission(module,1)}

                    >
                        <div className="item-title">订单编号 </div>
                        <div className="id-disable" >{this.state.info.order_id}</div>
                        <div className="item-title">开奖结果</div>
                        <div className="id-disable" >{this.status()}</div>
                        <div className="item-title">订单状态</div>
                        <div className="id-disable">{this.orderStatus()}</div>
                        <div className="item-title">发货类型</div>
                        <div className="id-disable">{this.paymentType()}</div>
                        <div className="item-title">购买人次</div>
                        <div className="id-disable" >{this.state.info.num}</div>
                        <div className="item-title">本期该ID购买总数</div>
                        <div className="id-disable">{this.state.info.num_sum}</div>
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
                        <div className="item-title">支付宝姓名</div>
                        <div className="id-disable" >{this.state.info.contact_name}</div>
                        <div className="item-title">支付宝账号</div>
                        <div className="id-disable" >{this.state.info.contact_id}</div>
                        <div className="item-title">打款支付宝</div>
                        <div className="id-disable" >{this.state.info.payment_channel}</div>
                        <div className="item-title">打款银行卡</div>
                        <div className="id-disable" >{this.state.info.payment_bank}</div>
                        <div className="item-title">流水号</div>
                        <div className="id-disable" >{this.state.info.payment_no}</div>
                        <div className="item-title">额外费用</div>
                        <div className="id-disable" >{this.state.info.payment_fee}</div>
                        <div className="item-title">备注</div>
                        <textarea name="remark" id="" cols="300" rows="5"/>
                    </Form>
                </div>
            </div>
        )

    }
}
export default connect(({orderExchangeInfo}) => ({orderExchangeInfo}))(OrderExchangeInfo);

