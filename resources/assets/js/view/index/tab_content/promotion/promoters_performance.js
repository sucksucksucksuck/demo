/**
 * Created by sucksuck on 2017/7/6.
 */

import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom';
import AbsTabContent from '../abs_tab_content';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import Select from '../../../../modules/select';
import Button from '../../../../modules/button';
import * as promotionAction from '../../../../action/promotion/promoters_performance';
import * as vipAction from '../../../../action/vip_manage/vip_manage';
import DateInput from '../../../../modules/date_input';
import SelectSearch from '../../../../modules/select_search';

const head = [
    {"text": "推广员", "key": "truename", "type": "truename"},
    {"text": "部门", "key": "group_title"},
    {"text": "主管", "key": "director_name", "type": "director_name"},
    {"text": "充值金额", "key": "recharge_amount", order: "asc "},
    {"text": "今日充值", "key": "day_recharge", order: "asc "},
    {"text": "昨日充值", "key": "last_day_recharge", order: "asc "},
    {"text": "本周充值", "key": "week_recharge", order: "asc "},
    {"text": "本月充值", "key": "month_recharge", order: "asc "},
    {"text": "维护客户数", "key": "user_count", order: "asc "}
];
const module = 1602;

const admin_status = {
    "1": "正常",
    "2": "禁用"
};

class PromotersPerformance extends AbsTabContent {
    constructor(props) {
        super(props, module);
        //通过属性传递state过来
        this.state = props['promotersPerformance'];
    }

    componentDidMount() {  //render前执行一次 以后再也不执行
        if (this.props.extend !== "[]") {
            this.state.search.group_id = this.props.extend;
            // this.state.search.director_id = this.props.extend;
            this.state.search.page = 1;

            promotionAction.getList(this.state.search);
            promotionAction.getInfo(this.state.search);
        } else {
            this.state.search.group_id = "";
            promotionAction.getList(this.state.search);
            promotionAction.getInfo();
        }
        this.initState(this.state.promoter_list);
        vipAction.getPromoters({type: 1, style: 2});
        vipAction.getPromoters({type: 3});
    }

    componentWillReceiveProps(props) {
        this.state = props["promotersPerformance"];
        this.initState(this.state.promoter_list);
        this.sort(this.state.search.order);
        this.forceUpdate();
    }

    initState(obj) {
        this.state.list = [];
        for (let c in obj) {
            let temp = {};
            temp[c] = obj[c];
            this.state.list.push(temp);
        }
    }

    getColumnStyle(val, head, item) {
        if (head.type == "truename") {
            return <div>
                <div>{val}</div>
                <div>{item.account}</div>
            </div>
        }
        if (head.type == "director_name") {
            return <div>
                <div>{val}</div>
                <div>{item.director_account}</div>
            </div>
        }
    }

    onHandleChange(hover) {
        this.state.search.option = hover;
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
            <div className="promoters-list promoters-performance" onClick={(e) => {
                if (e.target.id !== "select" && e.target.id !== "span") {
                    this.state.show = false;
                    this.forceUpdate();
                }
            }}>
                <div className="information">
                    <div className="item">
                        <div className="icon promoters_num"/>
                        <div className="info">
                            <div>推广员总数</div>
                            <div>{this.state.info ? this.state.info.admin_count : null}</div>
                        </div>
                    </div>
                    <div className="item">
                        <div className="icon user_num"/>
                        <div className="info">
                            <div>客户总数</div>
                            <div>{this.state.info ? this.state.info.user_count : null}</div>
                        </div>
                    </div>
                    <div className="item">
                        <div className="icon day_r"/>
                        <div className="info">
                            <div>今日充值</div>
                            <div>{this.state.info ? this.state.info.day_recharge : null}</div>
                        </div>
                    </div>
                    <div className="item">
                        <div className="icon yesterday_r"/>
                        <div className="info">
                            <div>昨日充值</div>
                            <div>{this.state.info ? this.state.info.last_day_recharge : null}</div>
                        </div>
                    </div>
                    <div className="item">
                        <div className="icon month_r"/>
                        <div className="info">
                            <div>本月充值</div>
                            <div>{this.state.info ? this.state.info.month_recharge : null}</div>
                        </div>
                    </div>
                    <div className="item">
                        <div className="icon last_month_r"/>
                        <div className="info">
                            <div>上月充值</div>
                            <div>{this.state.info ? this.state.info.last_month_recharge : null}</div>
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
                        if (this.state.search.option) {
                            if (this.state.search.option == "全部") {
                                this.state.search.admin_id = "";
                            } else {
                                this.state.search.admin_id = this.state.promoter_list[this.state.search.option];
                            }
                        } else {
                            this.state.search.admin_id = "";
                        }
                        promotionAction.getList(this.state.search);
                    }}

                >
                    <div className="item">
                        <div>推广员</div>
                        <SelectSearch list={this.state.list} defaultValue={this.state.search.option}
                                      promoter_list={this.state.promoter_list}
                                      onHandleChange={this.onHandleChange.bind(this)}/>
                    </div>
                    <div className="item">
                        <div>主管</div>
                        <Select name="director_id" opts={this.state.director_list} value="id" text="truename"
                                defaultText="全部"/>
                    </div>
                    <div className="item">
                        <div>状态</div>
                        <Select name="admin_status" object={true} opts={admin_status} defaultText="全部"/>
                    </div>
                    <DateInput name="12" start="start_time" end="end_time"/>
                    <div className="statistics">
                        <Button>
                            <button
                                module={module} action="1"
                                name="sum"
                                onClick={
                                    () => {
                                        this.state.search.id = this.state.search.admin_id;
                                        promotionAction.getList(this.state.search);
                                        promotionAction.getSumAmount(this.state.search);
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
                    head={head}
                    checkbox={false}
                    order={this.state.search.order}
                    rows={this.state.rows}
                    ref="table"
                    onOrderChange={this.sort.bind(this)}
                    getColumnStyle={this.getColumnStyle.bind(this)}

                >
                    <NavLink to={"/vip_manage/${admin_id},${status}"} name="list">客户列表</NavLink>
                </SimpleTable>
                <Paging
                    total={this.state.total}
                    page={this.state.search.page}
                    noButton={true}
                    page_size={this.state.search.page_size}
                    onPaginate={(page, page_size) => {
                        this.state.search.page = page;
                        this.state.search.page_size = page_size;
                        promotionAction.getList(this.state.search);
                    }}
                />
            </div>
        )
    }
}

export default connect(({promotersPerformance}) => ({promotersPerformance}))(PromotersPerformance);






