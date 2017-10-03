/**
 * Created by sucksuck on 2017/7/5.
 */
import React from 'react';
import ReactDOM from "react-dom";
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging';
import Search from '../../../../modules/search';
import Button from '../../../../modules/button';
import * as openAction from '../../../../modules/open_window/index';
import * as utilAction from '../../../../action/util';

//VIP管理 充值日志
export function vipRecharge(user_id) {
    let win = openAction.pop();
    const head = [
        {"text": "盘古币", "key": "amount"},
        {"text": "充值时间", "key": "create_at"},
    ];

    function getUserAllAmount(form) {
        window.ajax.post(window.config.root + '/vip_manage/user_pay', form, function (ret) {
            if (ret.errcode) {
                utilAction.prompt(ret.msg);
                win.pop.close();
            } else {
                user_Amount.setState({
                    rows: ret.data.rows,
                    total: ret.data.total,
                    user_info: ret.data.user_info
                });
            }
        });
    }

    function getStatistics(form) {
        window.ajax.post(window.config.root + '/vip_manage/user_pay/sum_amount', form, function (ret) {
            if (ret.errcode) {
                utilAction.prompt(ret.msg);
                win.pop.close();
            } else {
                user_Amount.setState({
                    statistics: ret.data
                });
            }

        });
    }

    class UserRechargePage extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                total: 0,
                category: [],
                rows: [],
                goods: {},
                search: {
                    page: 1,
                    pageSize: 20,
                    // user_type: "0"
                },
                statistics: '',
                user_info: {
                    day_recharge: "",
                    id: "",
                    month_recharge: "",
                    nickname: "",
                    recharge_amount: "",
                    week_recharge: ""
                }
            };
        }

        onSubmit() {
            this.state.search.id = user_id;
            this.state.search.page = 1;
            getUserAllAmount(this.state.search);
            this.forceUpdate();
        }

        onFormChange(e) {
            this.state.search[e.target.name] = e.target.value;
            this.forceUpdate();
        }

        componentWillMount() {
            getUserAllAmount({id: user_id});
        }

        getColumnStyle(val, head, item) {

        }

        render() {
            return (
                <div className="user-order">
                    <div className="user-consume">
                        <div className="details">
                            <div className="user-item">
                                <div className="sub-item">
                                    <div>用户UID</div>
                                    <div>{this.state.user_info.id}</div>
                                </div>
                                <div className="sub-item">
                                    <div>昵称</div>
                                    <div>{this.state.user_info.nickname}</div>
                                </div>
                                <div className="sub-item">
                                    <div>总充值</div>
                                    <div className="money">{this.state.user_info.recharge_amount}</div>
                                </div>
                                <div className="sub-item">
                                    <div>今日充值</div>
                                    <div className="money">{this.state.user_info.day_recharge}</div>
                                </div>
                                <div className="sub-item">
                                    <div>本周充值</div>
                                    <div className="money">{this.state.user_info.week_recharge}</div>
                                </div>
                                <div className="sub-item">
                                    <div>本月充值</div>
                                    <div className="money">{this.state.user_info.month_recharge}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Search
                        onSubmit={this.onSubmit.bind(this)}
                        onChange={this.onFormChange.bind(this)}
                        defaultValue={this.state.search}
                    >
                        <div className="item">
                            <div>充值时间</div>
                            <input type="date" className="date" name="start_time"/>-
                            <input type="date" className="date" name="end_time"/>
                        </div>

                        <div className="statistics">
                            <Button>
                                <button name="sum" type="button" module="1502" action="1" onClick={
                                    () => {
                                        this.state.search.id = user_id;
                                        getUserAllAmount(this.state.search);
                                        getStatistics(this.state.search)
                                    }
                                }>统计
                                </button>
                            </Button>

                            {this.state.statistics === '' ? '' : <span>盘古币总和:{this.state.statistics}</span>}
                        </div>
                    </Search>
                    <div className="user-order-table">
                        <SimpleTable
                            head={head}
                            rows={this.state.rows}
                            checkbox={false}
                            getColumnStyle={this.getColumnStyle.bind(this)}
                        />
                    </div>
                    <Paging
                        total={this.state.total}
                        page={this.state.search.page}
                        onPaginate={(page, page_size) => {
                            this.state.search.page = page;
                            this.state.search.page_size = page_size;
                            this.state.search.id = user_id;
                            getUserAllAmount(this.state.search);
                        }}
                    />
                </div>
            );
        }
    }

    let user_Amount = ReactDOM.render(
        <UserRechargePage/>
        , win.root);
}

//VIP管理 购买日志
export function vipAmount(user_id) {
    let win = openAction.pop();
    const head = [
        {"text": "订单编号", "key": "id"},
        {"text": "商品名字", "key": "title"},
        {"text": "商品期数", "key": "periods"},
        {"text": "购买次数", "key": "num"},
        {"text": "总需次数", "key": "total"},
        {"text": "购买时间", "key": "create_at"},
        {"text": "开奖时间", "key": "lottery_show_at"},
    ];
    const type = {
        1: "购买",
        2: "退还",
        3: "管理"
    };

    function getUserAllAmount(form) {
        window.ajax.post(window.config.root + '/vip_manage/user_purchase', form, function (ret) {
            if (ret.errcode) {
                utilAction.prompt(ret.msg);
                win.pop.close();
            } else {
                user_Amount.setState({
                    rows: ret.data.rows,
                    total: ret.data.total,
                    user_info: ret.data.user_info
                });
            }
        });
    }


    class UserAmountPage extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                total: 0,
                category: [],
                rows: [],
                goods: {},
                search: {
                    id: '',
                    type: "",
                    start_time: "",
                    end_time: "",
                    page: 1,
                    pageSize: 20,
                    // user_type: "0"
                },
                user_info: {
                    day_recharge: "",
                    id: "",
                    month_recharge: "",
                    nickname: "",
                    recharge_amount: "",
                    week_recharge: ""
                }
            };
        }

        onSubmit() {
            this.state.search.id = user_id;
            this.state.search.page = 1;
            getUserAllAmount(this.state.search);
            this.forceUpdate();
        }

        onFormChange(e) {
            this.state.search[e.target.name] = e.target.value;
            this.forceUpdate();
        }

        componentWillMount() {
            getUserAllAmount({id: user_id});
        }

        getColumnStyle(val, head, item) {
            if (head.type === "type") {
                return (<div className={`type_${val}`}>{type[val]}</div>)
            }
        }

        render() {
            return (
                <div className="user-order">
                    <div className="user-consume">
                        <div className="details">
                            <div className="user-item">
                                <div className="sub-item">
                                    <div>用户UID</div>
                                    <div>{this.state.user_info.id}</div>
                                </div>
                                <div className="sub-item">
                                    <div>昵称</div>
                                    <div>{this.state.user_info.nickname}</div>
                                </div>
                                <div className="sub-item">
                                    <div>总充值</div>
                                    <div className="money">{this.state.user_info.recharge_amount}</div>
                                </div>
                                <div className="sub-item">
                                    <div>今日充值</div>
                                    <div className="money">{this.state.user_info.day_recharge}</div>
                                </div>
                                <div className="sub-item">
                                    <div>本周充值</div>
                                    <div className="money">{this.state.user_info.week_recharge}</div>
                                </div>
                                <div className="sub-item">
                                    <div>本月充值</div>
                                    <div className="money">{this.state.user_info.month_recharge}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Search
                        onSubmit={this.onSubmit.bind(this)}
                        onChange={this.onFormChange.bind(this)}
                        defaultValue={this.state.search}
                    >
                        <div className="item">
                            <div>购买时间</div>
                            <input type="date" className="date" name="start_time"/>-
                            <input type="date" className="date" name="end_time"/>
                        </div>
                    </Search>
                    <div className="user-order-table">
                        <SimpleTable
                            head={head}
                            rows={this.state.rows}
                            checkbox={false}
                            getColumnStyle={this.getColumnStyle.bind(this)}
                        />
                    </div>
                    <Paging
                        total={this.state.total}
                        page={this.state.search.page}
                        onPaginate={(page, page_size) => {
                            this.state.search.page = page;
                            this.state.search.page_size = page_size;
                            this.state.search.id = user_id;
                            getUserAllAmount(this.state.search);
                        }}
                    />
                </div>
            );
        }
    }

    let user_Amount = ReactDOM.render(
        <UserAmountPage/>
        , win.root);
}

