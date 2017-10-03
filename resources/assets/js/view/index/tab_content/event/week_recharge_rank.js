/**
 * Created by sucksuck on 2017/7/28.
 */
import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Search from '../../../../modules/search';
import Select from '../../../../modules/select';
import * as rankAction from '../../../../action/event/week_recharge_rank';
import AbsTabContent from '../abs_tab_content';

const head = [
    {"text": "排名", "key": "user_id", "type": "rank"},
    {"text": "UID", "key": "user_id"},
    {"text": "昵称", "key": "nickname"},
    {"text": "充值金额", "key": "amount"},
    {"text": "用户类型", "key": "type", "type": "type"},
    {"text": "注册时间", "key": "create_at"},
    {"text": "奖励", "key": "prize"},
];

const user_type = {
    "0": "普通用户",
    "1": "机器人",
    "2": "特殊用户",
    "3": "特殊用户",
    "4": "客服"
};
const module = 710;
class WeekRechargeRank extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['weekRechargeRank'];
        this.initState(props);
    }

    componentWillMount() {
        rankAction.getPeriodsList();
        rankAction.getRankList();
    }

    initState(props) {
        this.state.rank = {};
        for (let i = 0; i < props.weekRechargeRank.rows.length; i++) {
            this.state.rank[`${props.weekRechargeRank.rows[i].user_id}`] = i + 1;
        }
    }

    componentWillReceiveProps(props) {
        this.state = props["weekRechargeRank"];
        this.initState(props);
        this.forceUpdate();
    }

    getColumnStyle(val, head, item) {
        if (head.type == "rank") {
            return this.state.rank[val];
        }
        if (head.type == "type") {
            return user_type[val];
        }
    }

    render() {
        return (
            <div className="turntable-log">
                <Search
                    defaultValue={this.state.search}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                    }}
                    onSubmit={() => {
                        this.state.search.page = 1;
                        rankAction.getRankList(this.state.search);
                    }}>
                    <div key="4" className="item periods">
                        <div>周期</div>
                        <Select name="periods" opts={this.state.rank_list} value="id" text="title" defaultText="全部"/>
                    </div>
                </Search>
                <SimpleTable
                    head={head}
                    checkbox={false}
                    rows={this.state.rows}
                    getColumnStyle={this.getColumnStyle.bind(this)}
                >
                </SimpleTable>
            </div>
        )
    }
}

export default connect(({weekRechargeRank}) => ({weekRechargeRank}))(WeekRechargeRank);