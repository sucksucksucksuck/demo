/**
 * Created by sucksuck on 2017/4/24.
 */


import React from 'react';
import Form from'../../../../modules/form';
import Input from '../../../../modules/input';
import {connect} from 'react-redux';
import * as orderAction from '../../../../action/order';
import * as utilAction from '../../../../action/util';
import CountDown from '../../../../modules/count_down';
import Button from '../../../../modules/button';

const payment_channel = ["京东快递", "顺丰速运", "EMS", "申通E物流", "圆通速递", "中通快递", "百世快递", "韵达快递", "天天快递", "宅急送", "德邦快递", "全峰快递", "苏宁快递", "其它"];

class EntityDelivery extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['orderEntityInfo'];
        this.state.search = props.search;
        this.state.get_code_second = 300;
    }

    componentDidMount() {  //render前
        orderAction.getEntityInfo({id: this.props.item.id, operation: 1});
        // this.setIntervalId = window.setInterval(this.countDown.bind(this), 1000);
    }


    componentWillMount() {  //render前

    }

    componentWillUpdate() {

    }

    componentWillUnmount() {
        orderAction.getEntity(this.state.search);
        orderAction.entityUnlock({id: this.props.item.id});
        orderAction.clear();
    }

    componentWillReceiveProps(props) {
        this.state = props['orderEntityInfo'];
        if (!this.state.info.real_amount) {
            this.state.info.real_amount = this.state.info.amount;
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
        if (this.state.info.conversion == true) {
            if (this.state.info.order_status == 2) {
                orderAction.entityDelivery({
                    id: this.state.info.id,
                    contact_name: this.state.info.contact_name,
                    contact_phone: this.state.info.contact_phone,
                    contact_id: this.state.info.contact_id,
                    remark: this.state.info.remark,
                });
            } else {
                orderAction.entityDelivery({
                    id: this.state.info.id,
                    contact_name: this.state.info.contact_name,
                    contact_phone: this.state.info.contact_phone,
                    contact_id: this.state.info.contact_id,
                    payment_channel: this.state.info.payment_channel,
                    payment_fee: this.state.info.payment_fee,
                    payment_no: this.state.info.payment_no,
                    real_amount: this.state.info.real_amount,
                    remark: this.state.info.remark,
                });
            }

        } else {
            orderAction.entityConversion({
                id: this.state.info.id,
                contact_name: this.state.info.contact_name,
                contact_id: this.state.info.contact_id,
                remark: this.state.info.remark,
            });
        }
    }

    delivery() {
        orderAction.entityDelivery({
            id: this.state.info.id,
            contact_name: this.state.info.contact_name,
            contact_phone: this.state.info.contact_phone,
            contact_id: this.state.info.contact_id,
            payment_channel: this.state.info.payment_channel,
            payment_fee: this.state.info.payment_fee,
            payment_no: this.state.info.payment_no,
            real_amount: this.state.info.real_amount,
            remark: this.state.info.remark,
            order_status: 3,
            payment_type: 4
        });
    }

    refuse() {
        orderAction.entityDelivery({
            id: this.state.info.id,
            contact_name: this.state.info.contact_name,
            contact_phone: this.state.info.contact_phone,
            contact_id: this.state.info.contact_id,
            payment_channel: this.state.info.payment_channel,
            payment_fee: this.state.info.payment_fee,
            payment_no: this.state.info.payment_no,
            real_amount: this.state.info.real_amount,
            remark: this.state.info.remark,
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
        this.state.info.contact_id = this.state.info.contact_phone;
        console.log(this.state.info);
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
                        }}>
                        <table>
                            {this.state.info.conversion ? <tbody>
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
                                <td>快递公司:</td>
                                <td><select name="payment_channel">
                                    <option value="">请选择</option>
                                    {payment_channel.map((item, index) => {
                                        return ( <option key={index} value={item}>{item}</option>)
                                    })}
                                </select>
                                </td>
                            </tr>
                            <tr>
                                <td>快递单号:</td>
                                <td><Input allowZero={true} verify="" name="payment_no"/>
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
                                    </td>
                                    }
                                </tr>
                                <tr>
                                    <td>备注:</td>
                                    <td><textarea name="remark" id="" cols="300"/>
                                    </td>
                                </tr>
                                </tbody>}
                        </table>
                        <div className="count">
                            <div>锁定订单剩余时间:</div>
                            <CountDown second={this.state.get_code_second}/>
                            <button type="button" onClick={() => {
                                orderAction.getEntityInfo({id: this.props.item.id, operation: 1});
                                this.state.get_code_second = 300;
                                this.forceUpdate();
                            }}>重新获取
                            </button>
                        </div>
                    </Form>
                </div>
                <Button item={this.state.info}>
                    <button compare="${order_status}==2&&${conversion}==true" name="1" type="button"
                            onClick={this.delivery.bind(this)}>成功发货
                    </button>
                    <button name="2" type="button" onClick={this.onSubmit.bind(this)}>保存</button>
                    <button compare="${order_status}==2&&${conversion}==true" module="211" action="3" name="3"
                            type="button" onClick={this.conversion.bind(this)}>转为虚拟
                    </button>
                    <button compare="${order_status}==2&&${conversion}==true" name="4" type="button"
                            onClick={this.refuse.bind(this)}>拒绝发货
                    </button>
                    <button name="5" type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </Button>
            </div>
        )

    }
}
export default connect(({orderEntityInfo}) => ({orderEntityInfo}))(EntityDelivery);
