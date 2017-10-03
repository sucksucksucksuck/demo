/**
 * Created by sucksuck on 2017/7/6.
 */

import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom';
import AbsTabContent from '../abs_tab_content';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging';
import Search from '../../../../modules/search';
import * as promotionAction from '../../../../action/promotion/consumer_recharge';
import DateInput from '../../../../modules/date_input';

const head = [
    {"text": "UID", "key": "user_id", className: ""},
    {"text": "昵称", "key": "nickname", "type": "nickname"},
    {"text": "手机号", "key": "phone"},
    {"text": "总充值", "key": "all_recharge_amount"},
    {"text": "充值金额", "key": "recharge_amount"},
    {"text": "消费金额", "key": "consumer_amount"},
    {"text": "微信号", "key": "wechat"},
    {"text": "备注", "key": "user_remake", className: "w400"},
];
const module = 1601;

class ConsumerRecharge extends AbsTabContent {
    constructor(props) {
        super(props, module);
        //通过属性传递state过来
        this.state = props['consumerRecharge'];
    }

    componentDidMount() {  //render前执行一次 以后再也不执行
        promotionAction.getList(this.state.search);
        promotionAction.getInfo();
    }

    componentWillReceiveProps(props) {
        this.state = props["consumerRecharge"];
        this.forceUpdate();
    }

    statusChange(admin_ststus) {
        this.state.search.admin_status = admin_ststus;
        this.state.search.page = 1;
        promotionAction.getList(this.state.search);
        this.forceUpdate();
    }

    getColumnStyle() {

    }


    render() {
        return (
            <div className="promoters-list consumer-recharge">
                <div className="information">
                    <div className="item">
                        <div className="icon user_num"/>
                        <div className="info">
                            <div>客户总数</div>
                            <div>{this.state.info ? this.state.info.count : null}</div>
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
                    <div className="item">
                        <div className="icon yesterday_r"/>
                        <div className="info">
                            <div>昨日充值</div>
                            <div>{this.state.info ? this.state.info.last_day_recharge : null}</div>
                        </div>
                    </div>
                </div>
                <div className="navigator">
                    <div className="status">
                        <span className={this.state.search.admin_status == "1" ? "active" : null}
                              onClick={this.statusChange.bind(this, 1)}>正常客户</span>
                        <span className={this.state.search.admin_status == "2" ? "active" : null}
                              onClick={this.statusChange.bind(this, 2)}>公共客户</span>
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
                        <div>用户UID</div>
                        <input type="text" name="user_id"/>
                    </div>
                    <DateInput noWarn={true} name="12" start="start_time" end="end_time"/>
                </Search>
                <SimpleTable
                    head={head}
                    checkbox={false}
                    rows={this.state.rows}
                    ref="table"
                    getColumnStyle={this.getColumnStyle.bind(this)}
                >
                </SimpleTable>
                <Paging
                    total={this.state.total}
                    page={this.state.search.page}
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

export default connect(({consumerRecharge}) => ({consumerRecharge}))(ConsumerRecharge);






