/*
 * Created by lrx on 2017/6/3.
 */

import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import * as rechargeManageAction from '../../../../action/user/recharge_manage'
import AbsTabContent from '../abs_tab_content';
import * as utilAction from '../../../../action/util';
import Button from '../../../../modules/button';

const head1 = [
    {"text": "UID", "key": "id"},
    {"text": "昵称", "key": "nickname",},
    {"text": "手机", "key": "phone",},
    {"text": "注册时间", "key": "create_at"},
    {"text": "余额", "key": "residual_amount"},
    {"text": "总中奖", "key": "winning_amount"},
    {"text": "总消费", "key": "consumer_amount"},
    {"text": "总充值", "key": "recharge_amount"},
    {"text": "中奖率(%)", "key": "probability", "type": "win"},
    {"text": "类型", "key": "type", "type": "type"},
    {"text": "备注", "key": "remark"},
];
const head2 = [
    {"text": "UID", "key": "id"},
    {"text": "昵称", "key": "nickname",},
    {"text": "手机", "key": "phone",},
    {"text": "注册时间", "key": "create_at"},
    {"text": "余额", "key": "residual_amount"},
    {"text": "类型", "key": "type", "type": "type"},
    {"text": "备注", "key": "remark"},
];
const type = {
    0: "普通用户",
    1: "机器人",
    2: "测试号",
    3: "特殊用户",
    4: "客服号",
};
const module = 504;

class RechargeManage extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['rechargeManage'];
        this.state.amount = '';
        this.state.remark = ''
    }

    componentDidMount() {
        // rechargeManageAction.getList(this.state.search);
    }

    componentWillReceiveProps(props) {
        this.state = props["rechargeManage"];
        this.forceUpdate();
    }

    componentWillUnmount() {
        // rechargeManageAction.clearData();
    }

    getColumnStyle(val, head, item) {
        if (head.type === "type") {
            return (<div>{type[val]}</div>)
        }
        if (head.type === "win") {
            return (<div>{val + "%"}</div>)
        }
    }

    render() {
        return (
            <div className="recharge-manage">
                <Search
                    defaultValue={this.state.search}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                        this.forceUpdate()
                    }}
                    onSubmit={() => {
                        if (this.state.search.id) {
                            rechargeManageAction.getList(this.state.search);
                            this.state.search.page = 1;
                        } else {
                            utilAction.prompt("请先输入用户id");
                        }
                    }}>
                    <div className="item">
                        <div>用户UID:</div>
                        <input type="text" name="id"/>
                    </div>
                </Search>
                <div className="recharge">
                    <div className="item">
                        <div>充值数量:</div>
                        <input maxLength="9" type="text" name="amount" value={this.state.amount} onChange={(e) => {
                            this.state[e.target.name] = e.target.value;
                            this.forceUpdate()
                        }}/>
                    </div>
                    <div className="item">
                        <div>备注:</div>
                        <input type="text" name="remark" value={this.state.remark} onChange={(e) => {
                            this.state[e.target.name] = e.target.value;
                            this.forceUpdate()
                        }}/>
                    </div>
                    <Button>
                        <button
                            name="amount"
                            module={module}
                            action="1"
                            onClick={
                                () => {
                                    if (this.state.rows.length === 1) {
                                        rechargeManageAction.onRechargeAmountClick({
                                            id: this.state.search.id,
                                            amount: this.state.amount,
                                            remark: this.state.remark
                                        })
                                    } else {
                                        utilAction.prompt("充值前需要搜索并核对信息")
                                    }
                                }
                            }>充值金额
                        </button>
                        <button
                            name="intergral"
                            module={module}
                            action="2"
                            onClick={
                                () => {
                                    if (this.state.rows.length === 1) {
                                        rechargeManageAction.onRechargeIntegralClick({
                                            id: this.state.search.id,
                                            integral: this.state.amount,
                                            remark: this.state.remark
                                        })
                                    } else {
                                        utilAction.prompt("充值前需要搜索并核对信息")
                                    }
                                }

                            }>充值积分
                        </button>
                    </Button>

                </div>
                <SimpleTable
                    head={window.hasPermission(module, 3) ? head1 : head2}
                    checkbox={false}
                    rows={this.state.rows}
                    getColumnStyle={this.getColumnStyle.bind(this)}
                >
                </SimpleTable>
                <Paging
                    total={this.state.total}
                    page={this.state.search.page}
                    onPaginate={(page, page_size) => {
                        this.state.search.page = page;
                        this.state.search.page_size = page_size;
                        rechargeManageAction.getList(this.state.search);
                    }}
                />

            </div>
        )
    }
}

export default connect(({rechargeManage}) => ({rechargeManage}))(RechargeManage);