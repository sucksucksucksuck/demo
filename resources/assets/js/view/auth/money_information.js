/**
 * Created by sucksuck on 2017/4/22.
 */

import React from 'react';
import {connect} from 'react-redux';
import * as authAction from './../../action/auth';
import * as platformAction from "../../action/platform"
import Form from '../..//modules/form';
import Input from '../../modules/input';
import * as utilAction from './../../action/util';


// MoneyInformation

class MoneyInformation extends React.Component {
    constructor(props) {
        super(props);
        this.state = props["moneyInfo"];
        //通过属性传递state过来
        this.state.alipay_input = "";
        this.state.bank_input = "";
    }


    componentWillMount() {
        // console.log(this.state.admin_info);
    }

    componentWillReceiveProps(props) {
        this.state = props["moneyInfo"];
        this.forceUpdate();
    }


    // componentWillUnmount() {
    //     platformAction.clear();
    // }

    addInfo(type) {
        if (type == "alipay") {
            if (this.state.alipay_input) {
                this.state.alipay.push(this.state.alipay_input);
                this.state.alipay_input = "";
                this.forceUpdate();
            } else {
                utilAction.prompt("请输入信息");
            }
        } else {
            if (this.state.bank_input) {
                this.state.bank.push(this.state.bank_input);
                this.state.bank_input = "";
                this.forceUpdate();
            } else {
                utilAction.prompt("请输入信息");
            }
        }
    }

    deleteInfo(type, e) {
        if (type == "alipay") {
            let id = e.target.parentNode.id;
            if (id == this.state.selected.alipay) {
                this.state.selected.alipay = 999;
            } else if (id < this.state.selected.alipay) {
                this.state.selected.alipay = this.state.selected.alipay - 1;
            }
            this.state.alipay.splice(id, 1);
            this.forceUpdate();
        } else {
            let id = e.target.parentNode.id;
            this.state.bank.splice(id, 1);
            if (id == this.state.selected.bank) {
                this.state.selected.bank = 999;
            } else if (id < this.state.selected.bank) {
                this.state.selected.bank = this.state.selected.bank - 1;
            }
            this.forceUpdate();
        }
    }

    setSelected(type, e) {
        if (type == "alipay") {
            this.state.selected.alipay = e.target.parentNode.id;
            this.forceUpdate();
        } else {
            this.state.selected.bank = e.target.parentNode.id;
            this.forceUpdate();
        }
    }


    render() {
        return (
            <div className="money-info">
                <div className="title">我的打款信息
                    <div className="close" onClick={authAction.closeMoneyInfo.bind(this)}/>
                </div>
                <div className="content">
                    <div>
                        <div className="title">支付宝信息</div>
                        <div className="input-group">
                            <input value={this.state.alipay_input} onChange={(e) => {
                                this.state.alipay_input = e.target.value;
                                this.forceUpdate();
                            }} type="text"/>
                            <button type="button" onClick={this.addInfo.bind(this, "alipay")}>+</button>
                            <div>已添加的支付宝</div>
                        </div>
                        <div className="items">
                            {this.state.alipay.map((item, index) => {
                                return (<div id={index} key={index} className="item">
                                    <span>{item}</span>
                                    <span key={index + 1}
                                          className={this.state.selected.alipay == index ? "active" : null}
                                          onClick={this.setSelected.bind(this, "alipay")}>
                                    {this.state.selected.alipay == index ? "【默认】" : "【设为默认】"}
                                    </span> <span
                                    onClick={this.deleteInfo.bind(this, "alipay")}>&times;</span></div>)
                            })} </div>
                    </div>
                    <div>
                        <div className="title">银行卡信息</div>
                        <div className="input-group">
                            <input value={this.state.bank_input} onChange={(e) => {
                                this.state.bank_input = e.target.value;
                                this.forceUpdate();
                            }} type="text"/>
                            <button type="button" onClick={this.addInfo.bind(this, "bank")}>+</button>
                            <div>已添加的银行卡</div>
                        </div>
                        <div className="items">
                            <div className="items">
                                {this.state.bank.map((item, index) => {
                                    return (<div id={index} key={index} className="item">
                                        <span>{item}</span>
                                        <span className={this.state.selected.bank == index ? "active" : null}
                                              onClick={this.setSelected.bind(this, "bank")}>
                                        {this.state.selected.bank == index ? "【默认】" : "【设为默认】"}
                                        </span>
                                        <span
                                            onClick={this.deleteInfo.bind(this, "bank")}>&times;
                                        </span></div>)
                                })}
                            </div>
                        </div>
                    </div>

                </div>

            </div>);
    }
}
export default connect(({moneyInfo}) => ({moneyInfo}))(MoneyInformation);

