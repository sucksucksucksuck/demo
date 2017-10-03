/**
 * Created by sucksuck on 2017/4/11.
 */

import React from 'react';
import * as orderAction from '../../../../action/order';
import {connect} from 'react-redux';
import Form from '../../../../modules/form';
import * as utilAction from '../../../../action/util';

const order_status = {
    1: "待确认",
    2: "订单确认",
    3: "已发货",
    4: "已签收",
    5: "夺宝完成"
};
const entity = {
    1: "手动发货",
    2: "",
    3: "拒绝发货",
    4: "成功发货"
};
const fictitious = {
    1: "手动打款",
    2: "兑吧审核",
    3: "拒绝打款",
    4: "成功打款"
};
const status = {
    1: "未开奖",
    2: "等待开奖",
    3: "已开奖",
    4: "已关闭",
};

const module = 212;

class OrderWinningInfo extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['orderWinningInfo'];
        // this.state = this.props.extend;
    }

    componentDidMount() {  //render前

    }

    componentWillMount() {  //render前
        orderAction.getWinningInfo({id: this.props.extend});
    }

    componentWillUnmount() {
        orderAction.clear();
    }

    componentWillUpdate() {

    }

    componentWillReceiveProps(props) {
        this.state = props['orderWinningInfo'];
        this.forceUpdate();


    }

    onCancel() {
        window.history.back();
    }

    luckyCode() {
        let p = [];
        for (let x in this.props.orderWinningInfo.lucky_codes) {
            if (this.state.info.lucky_code === this.props.orderWinningInfo.lucky_codes[x].lucky_code) {
                p.push(<span key={x} className="red">{this.props.orderWinningInfo.lucky_codes[x].lucky_code}</span>);

            } else {
                p.push(<span key={x}>{this.props.orderWinningInfo.lucky_codes[x].lucky_code}</span>);

            }
        }
        return p;
    }

    status() {
        if (this.state.info.status) {
            return status[this.state.info.status];
        }
    }

    orderStatus() {
        if (this.state.info.order_status) {
            return order_status[this.state.info.order_status];
        }
    }

    paymentType() {
        if (this.props.extend.goods_type == 0) {    //虚拟
            return fictitious[this.state.info.payment_type];

        } else {             //实物
            if (this.state.info.payment_type) {
                return entity[this.state.info.payment_type];
            }
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
        for (let x in this.state.info.pay_order_id) {
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
                            <div><a href={this.state.info.url} target="_blank"
                                    title={this.state.info.title}>{this.state.info.title}</a></div>
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
                        <div>确认时间:{this.state.info.confirm_at}</div>
                        <div>发货时间:{this.state.info.deliver_at}</div>
                    </div>
                </div>
                <div className="wrap">
                    <Form ref="form"
                          defaultValue={this.state.info}
                          onSubmit={this.onSubmit.bind(this)}
                          onChange={(e) => {
                              this.state.info[e.target.name] = e.target.value;
                          }}
                          save={window.hasPermission(module, 1)}
                    >
                        <div className="item-title">订单编号</div>
                        <div className="id-disable">{this.state.info.order_id}</div>
                        <div className="item-title">开奖结果</div>
                        <div className="id-disable">{this.status()}</div>
                        <div className="item-title">订单状态</div>
                        <div className="id-disable">{this.orderStatus()}</div>
                        <div className="item-title">发货类型</div>
                        <div className="id-disable">{this.paymentType()}</div>
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
                        {this.state.info.order_status == 3 && this.state.info.order_type == 0 ? (<div>
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
                            <div className="id-disable">{this.state.info.payment_fee}</div>

                        </div>) : null}
                        {this.state.info.order_status == 3 && this.state.info.order_type == 1 ? (<div>
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
                            <div className="item-title">支付宝流水号</div>
                            <div className="id-disable">{this.state.info.payment_no}</div>
                        </div>) : null}
                        <div className="item-title">商品实际金额</div>
                        <div className="id-disable">{this.state.info.amount}</div>
                        {this.state.info.order_status == 3 ? <div>
                            <div className="item-title">商品实际发货金额</div>
                            <div className="id-disable">{this.state.info.real_amount}</div>
                        </div> : null}
                        <div className="item-title">商品购买链接</div>
                        <div className="id-disable">{this.state.info.url}</div>
                        <div className="item-title">错误信息</div>
                        <div className="id-disable">{this.state.info.error}</div>
                        <div className="item-title">备注</div>
                        <textarea name="remark" cols="300" rows="5"/>
                    </Form>
                </div>
            </div>
        )

    }
}

export default connect(({orderWinningInfo}) => ({orderWinningInfo}))(OrderWinningInfo);
