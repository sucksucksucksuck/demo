/**
 * Created by sucksuck on 2017/6/6.
 */


import React from 'react';
import Form from'../../../../modules/form';
import Input from '../../../../modules/input';
import {connect} from 'react-redux';
import * as orderAction from '../../../../action/order';
import * as utilAction from '../../../../action/util';
import CountDown from '../../../../modules/count_down';
import Button from '../../../../modules/button';


class FictitiousLowDelivery extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['orderFictitiousLowInfo'];
        this.state.search = props.search;
        this.state.info.conversion = true;
        this.state.get_code_second = 300;
    }

    componentDidMount() {  //render前
        orderAction.getFictitiousLowInfo({id: this.props.item.id, operation: 1});
    }


    componentWillMount() {  //render前

    }

    componentWillUpdate() {

    }

    componentWillUnmount() {
        orderAction.getFictitiousLow(this.state.search);
        orderAction.fictitiousLowUnlock({id: this.props.item.id});
        orderAction.clear();
    }

    componentWillReceiveProps(props) {
        this.state = props['orderFictitiousLowInfo'];
        if (!this.state.info.real_amount) {
            this.state.info.real_amount = this.state.info.amount;
        }
        if (this.state.info.payment_channel) {
            this.state.info.payment_channel = this.state.info.payment_channel;
        } else {
            if (this.state.info.order_status == 3) {
                this.state.info.payment_channel = this.state.info.payment_channel;
            } else {
                props.moneyInfo.alipay.map((item, index) => {
                    if (index == props.moneyInfo.selected.alipay) {
                        this.state.info.payment_channel = item;
                    }
                });
            }
        }
        if (this.state.info.payment_bank) {
            this.state.info.payment_bank = this.state.info.payment_bank;
        } else {
            if (this.state.info.order_status == 3) {
                this.state.info.payment_bank = this.state.info.payment_bank;
            } else {
                props.moneyInfo.bank.map((item, index) => {
                    if (index == props.moneyInfo.selected.bank) {
                        this.state.info.payment_bank = item;
                    }
                });
            }
        }
        this.forceUpdate();
    }

    onSubmit() {
        if (this.state.info.payment_fee == "") {
            this.state.info.payment_fee = 0;
        }
        if (this.state.info.real_amount == "") {
            this.state.info.real_amount = 0;
        }
        if (this.state.info.payment_fee / 10000 > 10) {
            utilAction.prompt("额外费用请输入正确格式!");
        } else {
            if (this.state.info.conversion == true) {
                if (this.state.info.order_status == 2) {
                    orderAction.fictitiousLowDelivery({
                        id: this.state.info.id,
                        contact_name: this.state.info.contact_name,
                        contact_id: this.state.info.contact_id,
                        payment_fee: this.state.info.payment_fee,
                        payment_no: this.state.info.payment_no,
                        remark: this.state.info.remark,
                    });
                } else {
                    orderAction.fictitiousLowDelivery({
                        id: this.state.info.id,
                        contact_name: this.state.info.contact_name,
                        contact_id: this.state.info.contact_id,
                        payment_channel: this.state.info.payment_channel,
                        payment_bank: this.state.info.payment_bank,
                        payment_fee: this.state.info.payment_fee,
                        payment_no: this.state.info.payment_no,
                        real_amount: this.state.info.real_amount,
                        remark: this.state.info.remark,
                    });
                }
            } else {
                orderAction.fictitiousLowConversion({
                    id: this.state.info.id,
                    contact_name: this.state.info.contact_name,
                    contact_phone: this.state.info.contact_phone,
                    contact_id: this.state.info.contact_id,
                    real_amount: this.state.info.real_amount,
                    remark: this.state.info.remark,
                });
            }
        }
    }

    delivery() {
        orderAction.fictitiousLowDelivery({
            id: this.state.info.id,
            contact_name: this.state.info.contact_name,
            contact_id: this.state.info.contact_id,
            payment_channel: this.state.info.payment_channel,
            payment_bank: this.state.info.payment_bank,
            payment_fee: this.state.info.payment_fee,
            payment_no: this.state.info.payment_no,
            real_amount: this.state.info.real_amount,
            remark: this.state.info.remark,
            order_status: 3,
            payment_type: 4
        });
    }

    refuse() {
        orderAction.fictitiousLowDelivery({
            id: this.state.info.id,
            contact_name: this.state.info.contact_name,
            contact_id: this.state.info.contact_id,
            payment_channel: this.state.info.payment_channel,
            payment_bank: this.state.info.payment_bank,
            payment_fee: this.state.info.payment_fee,
            payment_no: this.state.info.payment_no,
            remark: this.state.info.remark,
            real_amount: this.state.info.real_amount,
            order_status: 3,
            payment_type: 3
        });
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    conversion() {
        this.state.info.conversion = false;
        this.state.info.contact_phone = this.state.info.contact_id;
        this.state.info.contact_id = "";
        this.forceUpdate();
    }

    render() {
        return (
            <div className="dialog-form">
                <div className="title">发货信息
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="info">
                    <div>订单编号：{this.state.info.order_id}</div>
                    <div>成交时间：{this.state.info.o_create_at}</div>
                    <div>揭晓时间：{this.state.info.lottery_show_at}</div>
                    <div>商品名字：
                        {this.state.info.goods_type == 1 ? this.state.info.title :
                            <a href={this.state.info.url}
                               title={this.state.info.title} target="_blank">
                                {this.state.info.title}</a>}
                    </div>
                    <div>商品ID：{this.state.info.goods_id}</div>
                    <div>期数：{this.state.info.periods}</div>
                    <div>用户UID：{this.state.info.user_id}</div>
                </div>
                <div className="wrap">
                    <Form
                        defaultValue={this.state.info}
                        onChange={(e) => {
                            this.state.info[e.target.name] = e.target.value;
                            this.forceUpdate();
                        }}>
                        <table>
                            {this.state.info.conversion ?
                                <tbody>
                                <tr>
                                    <td>支付宝姓名:</td>
                                    {this.state.info.order_status == 2 ? <td>
                                        <Input verify="" name="contact_name"/>
                                    </td> : <td className="disable">{this.state.info.contact_name}
                                    </td>}
                                </tr>
                                <tr>
                                    <td>支付宝账号:</td>
                                    {this.state.info.order_status == 2 ? <td><Input verify="" name="contact_id"/>
                                    </td> : <td className="disable">{this.state.info.contact_id}
                                    </td>}
                                </tr>
                                <tr>
                                    <td>商品原价:</td>
                                    <td className="disable">{this.state.info.amount}
                                    </td>
                                </tr>
                                <tr>
                                    <td>商品实际发货金额:</td>
                                    <td><Input allowZero={true} verify="" maxLength="12" name="real_amount"/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>额外费用:</td>
                                    <td><Input allowZero={true} verify="" maxLength="12" name="payment_fee"/>

                                    </td>
                                </tr>
                                <tr>
                                    <td>打款支付宝:</td>
                                    {this.state.info.order_status == 2 ? <td><select name="payment_channel">
                                        <option value="">请选择</option>
                                        {this.props.moneyInfo.alipay.map((item, index) => {
                                            return ( <option key={index} value={item}>{item}</option>)
                                        })}
                                    </select></td> : <td>
                                        <Input verify="" name="payment_channel"/>
                                    </td> }
                                </tr>
                                <tr>
                                    <td>打款银行卡:</td>
                                    {this.state.info.order_status == 2 ? <td><select name="payment_bank">
                                        <option value="">请选择</option>
                                        {this.props.moneyInfo.bank.map((item, index) => {
                                            return ( <option key={index} value={item}>{item}</option>)
                                        })}
                                    </select></td> : <td>
                                        <Input verify="" name="payment_bank"/>
                                    </td>}
                                </tr>

                                <tr>
                                    <td>流水号:</td>
                                    <td><Input allowNull={false} verify="" name="payment_no"/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>备注:</td>
                                    <td><textarea name="remark" id="" cols="300" rows="5"/>
                                    </td>
                                </tr>
                                </tbody> :
                                <tbody>
                                <tr>
                                    <td>收货人姓名:</td>
                                    {this.state.info.order_status == 2 ? <td>
                                        <Input verify="" name="contact_name"/>
                                    </td> : <td className="disable">{this.state.info.contact_name}
                                    </td>}

                                </tr>
                                <tr>
                                    <td>收货人联系方式:</td>
                                    {this.state.info.order_status == 2 ? <td><Input verify="" name="contact_phone"/>
                                    </td> : <td className="disable">{this.state.info.contact_phone}
                                    </td>}
                                </tr>
                                <tr>
                                    <td>收货人地址:</td>
                                    {this.state.info.order_status == 2 ? <td><Input verify="" name="contact_id"/>
                                    </td> : <td className="disable">{this.state.info.contact_id}
                                    </td>}
                                </tr>
                                <tr>
                                    <td>备注:</td>
                                    <td><textarea name="remark" id="" cols="300" rows="5"/>
                                    </td>
                                </tr>
                                </tbody> }

                        </table>
                        <div className="count">
                            <div>锁定订单剩余时间:</div>
                            <CountDown second={this.state.get_code_second}/>
                            <button type="button" onClick={() => {
                                orderAction.getFictitiousLowInfo({id: this.props.item.id, operation: 1});
                                this.state.get_code_second = 300;
                                this.forceUpdate();
                            }}>重新获取
                            </button>
                        </div>
                    </Form>
                </div>
                <Button item={this.state.info}>
                    <button compare="${order_status}==2&&${conversion}==true"
                            name="1"
                            type="button"
                            onClick={this.delivery.bind(this)}>成功打款
                    </button>
                    <button name="2"
                            type="button"
                            onClick={this.onSubmit.bind(this)}>保存
                    </button>
                    <button compare="${order_status}==2&&${conversion}==true"
                            module="219" action="3" name="3"
                            type="button"
                            onClick={this.conversion.bind(this)}>转为实物
                    </button>
                    <button compare="${order_status}==2&&${conversion}==true" module="219" action="4" name="6"
                            type="button" onClick={() => {
                        orderAction.fictitiousLowDelivery({
                            id: this.state.info.id,
                            contact_name: this.state.info.contact_name,
                            contact_id: this.state.info.contact_id,
                            payment_channel: this.state.info.payment_channel,
                            payment_bank: this.state.info.payment_bank,
                            payment_fee: this.state.info.payment_fee,
                            payment_no: this.state.info.payment_no,
                            real_amount: this.state.info.real_amount,
                            remark: this.state.info.remark,
                            order_status: 2
                        });

                    }}>支付宝打款
                    </button>
                    <button compare="${order_status}==2&&${conversion}==true"
                            name="4"
                            type="button"
                            onClick={this.refuse.bind(this)}>拒绝打款
                    </button>
                    <button compare="${order_status}==2&&${conversion}==true" name="5" type="button"   module="219" action="5"
                            onClick={() => {
                                orderAction.fictitiousLowDelivery({
                                    id: this.state.info.id,
                                    contact_name: this.state.info.contact_name,
                                    contact_id: this.state.info.contact_id,
                                    payment_channel: this.state.info.payment_channel,
                                    payment_bank: this.state.info.payment_bank,
                                    payment_fee: this.state.info.payment_fee,
                                    payment_no: this.state.info.payment_no,
                                    remark: this.state.info.remark,
                                    real_amount: this.state.info.real_amount,
                                    order_status: 6,
                                });
                            }}>打款失败
                    </button>
                    <button name="7"
                            type="button"
                            onClick={this.onClick.bind(this, 'cancel')}>取消
                    </button>
                </Button>
            </div>
        )

    }
}
export default connect(({orderFictitiousLowInfo, moneyInfo}) => ({
    orderFictitiousLowInfo,
    moneyInfo
}))(FictitiousLowDelivery);
