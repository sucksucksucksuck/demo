/**
 * Created by sucksuck on 2017/7/6.
 */

import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom';
import AbsTabContent from '../abs_tab_content';
import SimpleTable from '../../../../modules/simple_table';
import * as promotionAction from '../../../../action/promotion/promoters_rank';
const head = [
    {"text": "名次", "key": "admin_id", "type": "admin_id", className: "w50"},
    {"text": "部门", "key": "group_title"},
    {"text": "推广员", "key": "truename", "type": "truename", className: " "},
    {"text": "充值金额", "key": "recharge_amount", className: ""},
];

const module = 1603;
class PromotersRank extends AbsTabContent {
    constructor(props) {
        super(props, module);
        //通过属性传递state过来
        this.state = props['promotersRank'];
        this.initState(props)
    }

    componentDidMount() {  //render前执行一次 以后再也不执行
        promotionAction.getList({tab: this.state.search.tab});
        this.forceUpdate();
    }

    componentWillReceiveProps(props) {
        this.state = props["promotersRank"];
        this.initState(props);
        this.forceUpdate();
    }

    componentWillUnmount() {
        promotionAction.clear();
    }

    statusChange(tab) {
        this.state.search.tab = tab;
        promotionAction.getList(this.state.search);
        this.forceUpdate();
    }

    initState(props) {
        if (props.promotersRank.rank_list instanceof Array) {
            this.state.rank = {};
            for (let row in props.promotersRank.rank_list) {
                if (row > 0) {
                    if (props.promotersRank.rank_list[row].recharge_amount == props.promotersRank.rank_list[row - 1].recharge_amount) {
                        this.state.rank[`${props.promotersRank.rank_list[row].admin_id}`] = this.state.rank[`${props.promotersRank.rank_list[row - 1].admin_id}`];
                    } else {
                        this.state.rank[`${props.promotersRank.rank_list[row].admin_id}`] = this.state.rank[`${props.promotersRank.rank_list[row - 1].admin_id}`]+1;
                    }
                } else {
                    this.state.rank[`${props.promotersRank.rank_list[row].admin_id}`] = ++row;
                }

            }
        }
    }

    getColumnStyle(val, head, item) {
        if (head.type == "admin_id") {
            if (this.state.rank[val] > 3) {
                return this.state.rank[val];
            }
        }
        if(head.type == "truename") {
            return <div>
                <div>{val}</div>
                <div>{item.account}</div>
            </div>
        }


    }

    render() {
        return (
            <div className="promoters-list promoters-rank">
                <div className="information">
                    <div className="item">
                        <div className="icon day_best"/>
                        <div className="info">
                            <div>今日最佳</div>
                            <div>{this.state.day_rank_one}</div>
                        </div>
                    </div>
                    <div className="item">
                        <div className="icon week_best"/>
                        <div className="info">
                            <div>本周最佳</div>
                            <div>{this.state.week_rank_one}</div>
                        </div>
                    </div>
                    <div className="item">
                        <div className="icon month_best"/>
                        <div className="info">
                            <div>本月最佳</div>
                            <div>{this.state.month_rank_one}</div>
                        </div>
                    </div>
                </div>
                <div className="navigator">
                    <div className="status">
                        <span className={this.state.search.tab == "1" ? "active" : null}
                              onClick={this.statusChange.bind(this, 1)}>今日排名</span>
                        <span className={this.state.search.tab == "2" ? "active" : null}
                              onClick={this.statusChange.bind(this, 2)}>周排名</span>
                        <span className={this.state.search.tab == "3" ? "active" : null}
                              onClick={this.statusChange.bind(this, 3)}>月排名</span>
                    </div>
                </div>
                <SimpleTable
                    head={head}
                    rows={this.state.rank_list}
                    ref="table"
                    checkbox={false}
                    getColumnStyle={this.getColumnStyle.bind(this)}
                >
                </SimpleTable>
            </div>
        )
    }
}
export default connect(({promotersRank}) => ({promotersRank}))(PromotersRank);






