/**
 * Created by sucksuck on 2017/7/6.
 */

import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom';
import AbsTabContent from '../abs_tab_content';
import SimpleTable from '../../../../modules/simple_table';
import Search from '../../../../modules/search';
import Button from '../../../../modules/button';
import * as promotionAction from '../../../../action/promotion/group_rank';
import DateInput from '../../../../modules/date_input';

const head = [
    {"text": "主管", "key": "truename","type":"truename", className: ""},
    {"text": "部门", "key": "group_title"},
    {"text": "推广员数", "key": "promotion_count", "type": "nickname", className: ""},
    {"text": "客户数", "key": "user_count", className: ""},
    {"text": "今日充值", "key": "day_recharge", order: "asc ", className: ""},
    {"text": "昨日充值", "key": "last_day_recharge", order: "asc ", className: " "},
    {"text": "周充值", "key": "week_recharge", order: "asc", className: ""},
    {"text": "月充值", "key": "month_recharge", order: "asc", className: ""},
    {"text": "上月充值", "key": "last_month_recharge", order: "asc", className: ""},
    {"text": "充值金额", "key": "recharge_amount", order: "asc",},
];
const module = 1604;
class GroupRank extends AbsTabContent {
    constructor(props) {
        super(props, module);
        //通过属性传递state过来
        this.state = props['groupRank'];
    }

    componentDidMount() {
        promotionAction.getList();
    }

    componentWillReceiveProps(props) {
        this.state = props["groupRank"];
        this.sort(this.state.search.order);
        this.forceUpdate();
    }

    statusChange(admin_ststus) {
        // this.state.search.admin_status = admin_ststus;
        // vipAction.getVipManage(this.state.search);
        // this.forceUpdate();
    }

    getColumnStyle(val, head, item) {
        if(head.type == "truename") {
            return <div>
                <div>{val}</div>
                <div>{item.account}</div>
            </div>
        }


    }


    sort(order) {
        this.state.search.sort_field = order.split(" ")[0];
        this.state.search.sort = order.split(" ")[1];
        this.state.search.order = order;
        this.forceUpdate();
        for (let i = 0; i < this.state.rows.length ; i++) {
            this.state.rows[i][order]=parseInt(this.state.rows[i][order])
        }
            for (let i = 0; i < this.state.rows.length - 1; i++) {
            for (let j = 0; j < this.state.rows.length - i - 1; j++) {
                if (this.state.rows[j][order] < this.state.rows[j + 1][order]) {
                    var ele = this.state.rows[j];
                    this.state.rows[j] = this.state.rows[j + 1];
                    this.state.rows[j + 1] = ele;
                }
            }
        }
    }

    render() {
        return (
            <div className="promoters-list consumer-recharge">
                <div className="information">
                    <div className="item">
                        <div className="icon day_best"/>
                        <div className="info">
                            <div>今日最佳</div>
                            <div>{this.state.day_rank_one||""}</div>
                        </div>
                    </div>
                    <div className="item">
                        <div className="icon week_best"/>
                        <div className="info">
                            <div>本周最佳</div>
                            <div>{this.state.week_rank_one||""}</div>
                        </div>
                    </div>
                    <div className="item">
                        <div className="icon month_best"/>
                        <div className="info">
                            <div>本月最佳</div>
                            <div>{this.state.month_rank_one||""}</div>
                        </div>
                    </div>
                </div>
                <Search
                    defaultValue={this.state.search}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                    }}
                    onSubmit={() => {
                        this.state.search.page = 1;
                        promotionAction.getList(this.state.search);
                    }}
                >
                    <div className="item">
                        <div>主管</div>
                        <input type="text" name="admin_id"/>
                    </div>
                    <DateInput noWarn={true} name="12" start="start_time" end="end_time"/>
                    <div className="statistics">
                        <Button>
                            <button module={module} action="1"
                                    name="sum" onClick={
                                () => {
                                    promotionAction.getsumAmount(this.state.search);
                                    promotionAction.getList(this.state.search);
                                }
                            }>
                                统计
                            </button>
                        </Button>
                        {this.state.sumAmount ? <span>总充值：{this.state.statistics}</span> : null}
                    </div>
                    <Button>
                        <button name="export" module={module} action="2" className="export" onClick={() => {
                            promotionAction.excel(this.state.search);
                        }}>
                            导出
                        </button>
                    </Button>
                </Search>
                <SimpleTable
                    checkbox={false}
                    order={this.state.search.order}
                    head={head}
                    rows={this.state.rows}
                    ref="table"
                    onOrderChange={this.sort.bind(this)}
                    getColumnStyle={this.getColumnStyle.bind(this)}

                >
                    <NavLink to={"/performance/promoters_performance/${group_id}"} name="list">推广员业绩</NavLink>
                </SimpleTable>

            </div>
        )
    }
}
export default connect(({groupRank}) => ({groupRank}))(GroupRank);






