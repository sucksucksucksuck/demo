/*
 * Created by lrx on 2017/6/5.
 */

import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging'
import * as serviceRechargeAction from '../../../../action/user/service_recharge'
import AbsTabContent from '../abs_tab_content';
import Button from '../../../../modules/button';
import Form from '../../../../modules/form';

const head = [
    {"text": "UID", "key": "user_id"},
    {"text": "昵称", "key": "nickname",},
    {"text": "金额", "key": "amount",},
    {"text": "神壕榜", "key": "type", "type": "type"},
    {"text": "时间", "key": "create_at"},
];
const type = {
    1: "是",
    2: "否"
};
const module = 505;

class ServiceRecharge extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['serviceRecharge'];
        this.state.id = '';
        this.state.amount = '';
        this.state.rank = 2
    }

    componentDidMount() {
        serviceRechargeAction.getList()
    }

    componentWillReceiveProps(props) {
        this.state = props["serviceRecharge"];
        this.forceUpdate();
    }

    componentWillUnmount() {
        // serviceRechargeAction.clearData();
    }

    getColumnStyle(val, head, item) {
        if (head.type === 'type') {
            return (<div>{type[val]}</div>)
        }

    }

    onSwitchClick() {
        if (this.state.rank === 2) {
            this.state.rank = 1
        } else if (this.state.rank === 1) {
            this.state.rank = 2
        }
        this.forceUpdate()
    }

    render() {
        return (
            <div className="service-recharge">
                <Form
                    cancel={true}
                    defaultValue={this.state}
                    onChange={
                        (e) => {
                            this.state[e.target.name] = e.target.value;
                        }
                    }
                >
                    <div className="item">
                        <div>用户UID:</div>
                        <input type="text" name="id"/>
                    </div>
                    <div className="item">
                        <div>充值金额：</div>
                        <input maxLength="9" type="text" name="amount"/>
                    </div>
                    <div className="item">
                        <div>神壕榜：</div>
                        <div className={this.state.rank === 1 ? "open" : "close"}
                             onClick={this.onSwitchClick.bind(this)}
                        >
                            <div className="switch"/>
                        </div>
                    </div>
                    <Button>
                        <button
                            name="recharge"
                            module={module}
                            action="1"
                            onClick={(e) => {
                                e.preventDefault();
                                this.state.search.page = 1;
                                serviceRechargeAction.onRechargeAmountClick({
                                    id: this.state.id,
                                    rank: this.state.rank,
                                    amount: this.state.amount
                                })
                            }}>充值金额
                        </button>
                    </Button>
                    {this.state.uid_type ? <div className="error">{this.state.uid_type}</div> : null}
                </Form>
                <SimpleTable
                    head={head}
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
                        serviceRechargeAction.getList(this.state.search)
                    }}
                />

            </div>
        )
    }
}

export default connect(({serviceRecharge}) => ({serviceRecharge}))(ServiceRecharge);