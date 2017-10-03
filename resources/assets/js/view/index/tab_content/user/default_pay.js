/**
 * Created by lrx on 2017/6/2.
 */

import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging';
import Search from '../../../../modules/search';
import * as utilAction from '../../../../action/util';
import * as defaultPayAction from '../../../../action/user/default_pay'
import AbsTabContent from '../abs_tab_content';

const module = 503;
const status = {
    "1": "正常",
    "2": "默认"
};

class DefaultPay extends AbsTabContent {

    constructor(props) {
        super(props, module);
        this.state = props['defaultPay'];
    }

    componentDidMount() {
        defaultPayAction.userList(this.state.search);
    }

    componentWillReceiveProps(props) {
        this.state = props["defaultPay"];
        this.forceUpdate();
    }

    onItemButtonClick(item, name) {
        if (name === "unbundling") {
            if (!item.address) {
                utilAction.prompt("没有可解绑的支付宝账号", () => {
                    return true;
                })
            } else {
                utilAction.confirm("是否确定解绑用户" + item.user_id + "的支付宝账号，该操作不可恢复！", () => {
                    defaultPayAction.unbundling({id: item.id});
                    defaultPayAction.userList(this.state.search);
                    return true;
                });
            }
        }
    }

    onSale(type) {
        this.state.search.type = type;
        this.state.search.page = 1;
        defaultPayAction.userList(this.state.search);
        this.forceUpdate();
    }

    getColumnStyle(val, head, item) {
        if (head.type === "status") {
            return (<div>{status[val]}</div>)
        }
    }

    render() {
        const head1 = window.hasPermission(module, 2) ? [
            {"text": "用户UID", "key": "user_id", className: "w80"},
            {"text": "支付宝姓名", "key": "name",},
            {"text": "支付宝账号", "key": "address",},
            {"text": "联系电话", "key": "phone"},
            {"text": "总充值金额", "key": "recharge_amount"},
            {"text": "总中奖金额", "key": "winning_amount"},
            {"text": "总消费金额", "key": "consumer_amount"},
            {"text": "余额", "key": "residual_amount"},
        ] : [
            {"text": "用户UID", "key": "user_id"},
            {"text": "支付宝姓名", "key": "name",},
            {"text": "支付宝账号", "key": "address",},
            {"text": "联系电话", "key": "phone"},
            {"text": "余额", "key": "residual_amount"},
        ];
        const head2 = window.hasPermission(module, 2) ? [
            {"text": "用户UID", "key": "user_id", className: "w80"},
            {"text": "姓名", "key": "name",},
            {"text": "地址", "key": "address",},
            {"text": "联系电话", "key": "phone",},
            {"text": "总充值金额", "key": "recharge_amount"},
            {"text": "总中奖金额", "key": "winning_amount"},
            {"text": "总消费金额", "key": "consumer_amount"},
            {"text": "余额", "key": "residual_amount"},
            {"text": "状态", "key": "status", "type": "status"},
        ] : [
            {"text": "用户UID", "key": "user_id"},
            {"text": "支付宝姓名", "key": "name",},
            {"text": "支付宝账号", "key": "address",},
            {"text": "联系电话", "key": "phone"},
            {"text": "余额", "key": "residual_amount"},
            {"text": "状态", "key": "status", "type": "status"},
        ];
        return (
            <div className="default-pay">
                <div className="navigator">
                    <div className="status">
                        <span className={this.state.search.type === "ali" ? "active" : null}
                              onClick={this.onSale.bind(this, "ali")}>默认支付宝</span>
                        <span className={this.state.search.type === "matter" ? "active" : null}
                              onClick={this.onSale.bind(this, "matter")}>收货地址</span>
                    </div>
                </div>
                <Search
                    defaultValue={this.state.search}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                    }}
                    onSubmit={() => {
                        this.state.search.page = 1;
                        defaultPayAction.userList(this.state.search)
                    }}>
                    {this.state.search.type === "ali" ? [
                        <div key="1" className="item">
                            <div>用户UID:</div>
                            <input type="text" name="user_id"/>
                        </div>,
                        <div key="2" className="item">
                            <div>支付宝姓名:</div>
                            <input type="text" name="name"/>
                        </div>,
                        <div key="3" className="item">
                            <div>支付宝账号:</div>
                            <input type="text" name="address"/>
                        </div>,
                        <div key="4" className="item">
                            <div>电话:</div>
                            <input type="text" name="phone"/>
                        </div>] : [
                        <div key="1" className="item">
                            <div>用户UID:</div>
                            <input type="text" name="user_id"/>
                        </div>,
                        <div key="2" className="item">
                            <div>姓名:</div>
                            <input type="text" name="name"/>
                        </div>,
                        <div key="3" className="item">
                            <div>地址:</div>
                            <input type="text" name="address"/>
                        </div>,
                        <div key="4" className="item">
                            <div>电话:</div>
                            <input type="text" name="phone"/>
                        </div>]}

                </Search>
                <SimpleTable
                    head={this.state.search.type === "ali" ? head1 : head2}
                    checkbox={false}
                    rows={this.state.rows}
                    getColumnStyle={this.getColumnStyle.bind(this)}
                    onItemButtonClick={this.onItemButtonClick.bind(this)}
                >
                    {this.state.search.type == "ali" ?<button module="503" action="1" type="button" name="unbundling">解绑</button> : null}
                </SimpleTable>

                <Paging
                    total={this.state.total}
                    page={this.state.search.page}
                    onPaginate={(page, page_size) => {
                        this.state.search.page = page;
                        this.state.search.page_size = page_size;
                        defaultPayAction.userList(this.state.search)
                    }}
                />

            </div>
        )
    }
}
export default connect(({defaultPay}) => ({defaultPay}))(DefaultPay);