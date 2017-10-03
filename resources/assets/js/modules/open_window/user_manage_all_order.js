/**
 * Created by sucksuck on 2017/6/28.
 */
import React from 'react';
import ReactDOM from "react-dom";
import SimpleTable from '../../modules/simple_table';
import Paging from '../../modules/paging';
import Search from '../../modules/search';
import * as openAction from './index';
import Button from '../../modules/button';
import * as utilAction from '../../action/util';

//用户管理所有订单
export function userManageAllOrder(user_id) {
    let win = openAction.pop();
    var head = [];
    if (window.hasPermission(508, 3) && window.hasPermission(508, 4)) {
        head = [
            {"text": "订单编号", "key": "id"},
            {"text": "商品名字", "key": "title", className: "w400"},
            {"text": "商品ID", "key": "o_goods_id"},
            {"text": "商品期数", "key": "periods"},
            {"text": "期数ID", "key": "periods_id"},
            {"text": "购买次数", "key": "num"},
            {"text": "总需次数", "key": "total"},
            {"text": "商品原价", "key": "amount"},
            {"text": "购买时间", "key": "create_at", "type": "create_at"},
            {"text": "开奖时间", "key": "lottery_show_at", "type": "lottery_show_at"},
            {"text": "收货人信息", "key": "pcontact", "type": "pcontact"},
            {"text": "开奖结果", "key": "status", "type": "status"},
            {"text": "订单状态", "key": "order_status", "type": "order_status"}
        ];
    } else if (window.hasPermission(508, 3) && !window.hasPermission(508, 4)) {
        head = [
            {"text": "订单编号", "key": "id"},
            {"text": "商品名字", "key": "title", className: "w400"},
            {"text": "商品ID", "key": "o_goods_id"},
            {"text": "商品期数", "key": "periods"},
            {"text": "期数ID", "key": "periods_id"},
            {"text": "购买次数", "key": "num"},
            {"text": "总需次数", "key": "total"},
            {"text": "商品原价", "key": "amount"},
            {"text": "购买时间", "key": "create_at", "type": "create_at"},
            {"text": "开奖时间", "key": "lottery_show_at", "type": "lottery_show_at"},
            {"text": "开奖结果", "key": "status", "type": "status"},
            {"text": "订单状态", "key": "order_status", "type": "order_status"}
        ];
    } else if (!window.hasPermission(508, 3) && window.hasPermission(508, 4)) {
        head = [
            {"text": "订单编号", "key": "id"},
            {"text": "商品名字", "key": "title", className: "w400"},
            {"text": "商品ID", "key": "o_goods_id"},
            {"text": "商品期数", "key": "periods"},
            {"text": "期数ID", "key": "periods_id"},
            {"text": "购买次数", "key": "num"},
            {"text": "总需次数", "key": "total"},
            {"text": "商品原价", "key": "amount"},
            {"text": "购买时间", "key": "create_at", "type": "create_at"},
            {"text": "开奖时间", "key": "lottery_show_at", "type": "lottery_show_at"},
            {"text": "收货人信息", "key": "pcontact", "type": "pcontact"},
        ];
    } else {
        head = [
            {"text": "订单编号", "key": "id"},
            {"text": "商品名字", "key": "title", className: "w400"},
            {"text": "商品ID", "key": "o_goods_id"},
            {"text": "商品期数", "key": "periods"},
            {"text": "期数ID", "key": "periods_id"},
            {"text": "购买次数", "key": "num"},
            {"text": "总需次数", "key": "total"},
            {"text": "商品原价", "key": "amount"},
            {"text": "购买时间", "key": "create_at", "type": "create_at"},
            {"text": "开奖时间", "key": "lottery_show_at", "type": "lottery_show_at"},
        ];
    }
    const order_status = {
        1: "待确认",
        2: "订单确认",
        3: "已发货",
        4: "已签收",
        5: "夺宝完成"
    };
    const status = {
        1: "未开奖",
        2: "等待开奖",
        3: "已开奖",
        4: "已关闭",
    };

    function getUserAllOrder(form) {
        window.ajax.post(window.config.root + '/user_manage/user_order', form, function (ret) {
            if (ret.errcode) {
                utilAction.prompt(ret.msg);
                win.pop.close();
            } else {
                user_order.setState({
                    rows: ret.data.rows,
                    total: ret.data.total,
                    user_info: ret.data.user_info
                });
            }
        });
    }

    function getGoodsCategory() {
        window.ajax.post(window.config.root + '/goods/search/category', function (ret) {
            user_order.setState({
                category: ret.data
            });
        });
    }

    class UserOrderPage extends React.Component {
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
                user_info: {
                    consumer_amount: "",
                    id: "",
                    nickname: "",
                    probability: "",
                    recharge_amount: "",
                    residual_amount: "",
                    winning_amount: ""
                }
            };
        }

        onSubmit() {
            this.state.search.user_id = user_id;
            this.state.search.page = 1;
            getUserAllOrder(this.state.search);
            this.forceUpdate();
        }

        onFormChange(e) {
            this.state.search[e.target.name] = e.target.value;
            if (e.target.name === "order_status" && e.target.value != "") {
                this.refs['winning'].value = "1";
                this.state.search.winning = "1";
            }
            if (e.target.name === "winning" && e.target.value == "0") {
                this.refs['order_status'].value = "";
                this.state.search.order_status = "";
            }
            this.forceUpdate();
        }

        componentWillMount() {
            getUserAllOrder({user_id: user_id});
            getGoodsCategory();

        }

        getColumnStyle(val, head, item) {
            if (head.type === "order_status") {
                if (item.winning == 0) {
                    return "未中奖";
                } else if (item.winning == 1) {
                    return <div className="order-status">{order_status[val]}</div>;
                }
            }
            if (head.type == "pcontact") {
                if (item.winning == 0) {
                    return <div/>
                } else if (item.winning == 1) {
                    if (item.order_type == 1) {
                        return (<div>
                            <div>{item.contact_name}</div>
                            <div>{item.contact_id}</div>
                        </div>);
                    } else {
                        return (<div>
                            <div>{item.contact_name}</div>
                            <div>{item.contact_phone}</div>
                            <div>{item.contact_id}</div>
                        </div>)
                    }
                }
            }
            if (head.type == "status") {
                return status[val];
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
                                    <div>余额</div>
                                    <div className="money">{this.state.user_info.residual_amount}</div>
                                </div>
                                {
                                    window.hasPermission(508, 2) ? [<div key="1" className="sub-item">
                                        <div>总中奖额</div>
                                        <div className="money">{this.state.user_info.winning_amount}</div>
                                    </div>,
                                        <div key="2" className="sub-item">
                                            <div>总消费额</div>
                                            <div className="money">{this.state.user_info.consumer_amount}</div>
                                        </div>, <div key="3" className="sub-item">
                                            <div>中奖率</div>
                                            <div className="percent">  {this.state.user_info.probability}</div>
                                        </div>] : null
                                }
                            </div>
                        </div>
                        <div className="date">
                            <Button>
                                <button name="export" module="508" action="1" onClick={() => {
                                    openAction.post(window.config.root + '/user_manage/user_order/excel', {user_id: user_id}, function (ret) {

                                    });
                                }} type="button">导出
                                </button>
                            </Button>
                        </div>
                    </div>
                    <Search
                        onSubmit={this.onSubmit.bind(this)}
                        onChange={this.onFormChange.bind(this)}
                        defaultValue={this.state.search}
                    >
                        <div className="item">
                            <div>订单编号:</div>
                            <input type="text" name="order_id"/>
                        </div>
                        {window.hasPermission(508, 3) ? [
                            <div key="1" className="item">
                                <div>中奖状态</div>
                                <select name="winning" ref="winning">
                                    <option value="">全部</option>
                                    <option value="0">未中奖</option>
                                    <option value="1">已中奖</option>
                                </select>
                            </div>,
                            <div key="2" className="item">
                                <div>订单状态</div>
                                <select ref="order_status" name="order_status">
                                    <option value="">全部</option>
                                    <option value="1">待确认</option>
                                    <option value="2">订单确认</option>
                                    <option value="3">已发货</option>
                                    <option value="4">已签收</option>
                                    <option value="5">夺宝完成</option>
                                </select>
                            </div>,

                        ] : null}
                        {window.hasPermission(508, 4) ? <div className="item">
                            <div>收货人信息</div>
                            <input type="text" name="contact_name"/>
                        </div> : null}
                        <div className="item">
                            <div>商品名字</div>
                            <input type="text" name="title"/>
                        </div>
                        <div className="item">
                            <div>商品ID</div>
                            <input type="text" name="goods_id"/>
                        </div>
                        <div className="item">
                            <div>期数</div>
                            <input type="text" name="periods"/>
                        </div>
                        <div className="item">
                            <div>期数id</div>
                            <input type="text" name="periods_id"/>
                        </div>
                        <div className="item">
                            <div>商品分类</div>
                            <select name="category_id">
                                <option value="">全部</option>
                                {this.state.category.map(function (item, index) {
                                    return <option key={index} value={item.id}>{item.title}</option>
                                })}
                            </select>
                        </div>
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
                            this.state.search.user_id = user_id;
                            getUserAllOrder(this.state.search);
                        }}
                    />
                </div>
            );
        }
    }

    let user_order = ReactDOM.render(
        <UserOrderPage/>
        , win.root);
}

//用户管理 金额日志
export function userAmount(user_id) {
    let win = openAction.pop();
    const head = [
        {"text": "日志分类", "key": "type", "type": "type"},
        {"text": "盘古币", "key": "amount"},
        {"text": "支付单号", "key": "order_no"},
        {"text": "时间", "key": "create_at"},
    ];
    const type = {
        1: "购买",
        2: "退还",
        3: "管理"
    };

    function getUserAllAmount(form) {
        window.ajax.post(window.config.root + '/user_manage/user_amount', form, function (ret) {
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

    function onStatistics(form) {
        window.ajax.post(window.config.root + '/user_manage/user_amount/sum_amount', form, function (ret) {
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
                statistics: '',
                user_info: {
                    consumer_amount: "",
                    id: "",
                    nickname: "",
                    probability: "",
                    recharge_amount: "",
                    residual_amount: "",
                    winning_amount: ""
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
                                    <div>余额</div>
                                    <div className="money">{this.state.user_info.residual_amount}</div>
                                </div>
                                {window.hasPermission(506, 2) ? [<div key="1" className="sub-item">
                                    <div>总中奖额</div>
                                    <div className="money">{this.state.user_info.winning_amount}</div>
                                </div>,
                                    <div key="2" className="sub-item">
                                        <div>总消费额</div>
                                        <div className="money">{this.state.user_info.consumer_amount}</div>
                                    </div>,
                                    <div key="3" className="sub-item">
                                        <div>中奖率</div>
                                        <div className="percent">{this.state.user_info.probability}</div>
                                    </div>] : null}
                            </div>
                        </div>
                    </div>
                    <Search
                        onSubmit={this.onSubmit.bind(this)}
                        onChange={this.onFormChange.bind(this)}
                        defaultValue={this.state.search}
                    >
                        <div className="item">
                            <div>日志类型</div>
                            <select name="type">
                                <option value="">全部</option>
                                <option value="1">购买</option>
                                <option value="2">退还</option>
                                <option value="3">管理</option>
                            </select>
                        </div>
                        <div className="item">
                            <div>支付单号:</div>
                            <input type="text" name="order_no"/>
                        </div>
                        <div className="item">
                            <div>时间</div>
                            <input type="date" className="date" name="start_time"/>-
                            <input type="date" className="date" name="end_time"/>
                        </div>
                        <div className="statistics">
                            {window.hasPermission(506, 1) ?
                                <button type="button" onClick={
                                    () => {
                                        this.state.search.id = user_id;
                                        getUserAllAmount(this.state.search);
                                        onStatistics(this.state.search)
                                    }
                                }>统计</button> : null}
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
        <UserAmountPage/>
        , win.root);
}

//用户管理 充值日志
export function userRecharge(user_id) {
    let win = openAction.pop();
    const head = [
        {"text": "日志分类", "key": "type", "type": "type"},
        {"text": "盘古币", "key": "amount"},
        {"text": "时间", "key": "create_at"},
        {"text": "流水号", "key": "order_no"},
        {"text": "充值单号", "key": "pay_no"},
    ];
    const type = {
        3: "汇付宝",
        4: "融脉",
        6: "付钱拉"
    };

    function getUserAllAmount(form) {
        window.ajax.post(window.config.root + '/user_manage/user_pay', form, function (ret) {
            if (ret.errcode) {
                utilAction.prompt(ret.msg);
                win.pop.close();
            }else {
                user_Amount.setState({
                    rows: ret.data.rows,
                    total: ret.data.total,
                    user_info: ret.data.user_info
                });
            }
        });
    }

    function getStatistics(form) {
        window.ajax.post(window.config.root + '/user_manage/user_pay/sum_amount', form, function (ret) {
            if (ret.errcode) {
                utilAction.prompt(ret.msg);
                win.pop.close();
            }else {
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
                    consumer_amount: "",
                    id: "",
                    nickname: "",
                    probability: "",
                    recharge_amount: "",
                    residual_amount: "",
                    winning_amount: ""
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
                                    <div>余额</div>
                                    <div className="money">{this.state.user_info.residual_amount}</div>
                                </div>
                                {window.hasPermission(507, 2) ? [<div key="1" className="sub-item">
                                    <div>总中奖额</div>
                                    <div className="money">{this.state.user_info.winning_amount}</div>
                                </div>,
                                    <div key="2" className="sub-item">
                                        <div>总消费额</div>
                                        <div className="money">{this.state.user_info.consumer_amount}</div>
                                    </div>,
                                    <div key="3" className="sub-item">
                                        <div>中奖率</div>
                                        <div className="percent">{this.state.user_info.probability}</div>
                                    </div>] : null}
                            </div>
                        </div>
                    </div>
                    <Search
                        onSubmit={this.onSubmit.bind(this)}
                        onChange={this.onFormChange.bind(this)}
                        defaultValue={this.state.search}
                    >
                        <div className="item">
                            <div>充值渠道</div>
                            <select name="type">
                                <option value="">全部</option>
                                <option value="3">汇付宝</option>
                                <option value="4">融脉</option>
                                <option value="6">付钱拉</option>
                            </select>
                        </div>
                        <div className="item">
                            <div>支付单号</div>
                            <input type="text" name="pay_no"/>
                        </div>
                        <div className="item">
                            <div>流水号:</div>
                            <input type="text" name="order_no"/>
                        </div>
                        <div className="item">
                            <div>时间</div>
                            <input type="date" className="date" name="start_time"/>-
                            <input type="date" className="date" name="end_time"/>
                        </div>

                        <div className="statistics">
                            {window.hasPermission(507, 1) ?
                                <button type="button" onClick={
                                    () => {
                                        this.state.search.id = user_id;
                                        getUserAllAmount(this.state.search);
                                        getStatistics(this.state.search)
                                    }
                                }>统计</button> : null}
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

//客服管理所有订单
export function serviceManageAllOrder(user_id) {
    let win = openAction.pop();
    var head = [];
    if (window.hasPermission(509, 3) && window.hasPermission(509, 4)) {
        head = [
            {"text": "订单编号", "key": "id"},
            {"text": "商品名字", "key": "title", className: "w400"},
            {"text": "商品ID", "key": "o_goods_id"},
            {"text": "商品期数", "key": "periods"},
            {"text": "期数ID", "key": "periods_id"},
            {"text": "购买次数", "key": "num"},
            {"text": "总需次数", "key": "total"},
            {"text": "商品原价", "key": "amount"},
            {"text": "购买时间", "key": "create_at", "type": "create_at"},
            {"text": "开奖时间", "key": "lottery_show_at", "type": "lottery_show_at"},
            {"text": "收货人信息", "key": "pcontact", "type": "pcontact"},
            {"text": "开奖结果", "key": "status", "type": "status"},
            {"text": "订单状态", "key": "order_status", "type": "order_status"}
        ];
    } else if (window.hasPermission(509, 3) && !window.hasPermission(509, 4)) {
        head = [
            {"text": "订单编号", "key": "id"},
            {"text": "商品名字", "key": "title", className: "w400"},
            {"text": "商品ID", "key": "o_goods_id"},
            {"text": "商品期数", "key": "periods"},
            {"text": "期数ID", "key": "periods_id"},
            {"text": "购买次数", "key": "num"},
            {"text": "总需次数", "key": "total"},
            {"text": "商品原价", "key": "amount"},
            {"text": "购买时间", "key": "create_at", "type": "create_at"},
            {"text": "开奖时间", "key": "lottery_show_at", "type": "lottery_show_at"},
            {"text": "开奖结果", "key": "status", "type": "status"},
            {"text": "订单状态", "key": "order_status", "type": "order_status"}
        ];
    } else if (!window.hasPermission(509, 3) && window.hasPermission(509, 4)) {
        head = [
            {"text": "订单编号", "key": "id"},
            {"text": "商品名字", "key": "title", className: "w400"},
            {"text": "商品ID", "key": "o_goods_id"},
            {"text": "商品期数", "key": "periods"},
            {"text": "期数ID", "key": "periods_id"},
            {"text": "购买次数", "key": "num"},
            {"text": "总需次数", "key": "total"},
            {"text": "商品原价", "key": "amount"},
            {"text": "购买时间", "key": "create_at", "type": "create_at"},
            {"text": "开奖时间", "key": "lottery_show_at", "type": "lottery_show_at"},
            {"text": "收货人信息", "key": "pcontact", "type": "pcontact"},
        ];
    } else {
        head = [
            {"text": "订单编号", "key": "id"},
            {"text": "商品名字", "key": "title", className: "w400"},
            {"text": "商品ID", "key": "o_goods_id"},
            {"text": "商品期数", "key": "periods"},
            {"text": "期数ID", "key": "periods_id"},
            {"text": "购买次数", "key": "num"},
            {"text": "总需次数", "key": "total"},
            {"text": "商品原价", "key": "amount"},
            {"text": "购买时间", "key": "create_at", "type": "create_at"},
            {"text": "开奖时间", "key": "lottery_show_at", "type": "lottery_show_at"},
        ];
    }
    const order_status = {
        1: "待确认",
        2: "订单确认",
        3: "已发货",
        4: "已签收",
        5: "夺宝完成"
    };
    const status = {
        1: "未开奖",
        2: "等待开奖",
        3: "已开奖",
        4: "已关闭",
    };

    function getServiceAllOrder(form) {
        window.ajax.post(window.config.root + '/user_manage/customer_service_order', form, function (ret) {
            if (ret.errcode) {
                utilAction.prompt(ret.msg);
                win.pop.close();
            }else {
                service_order.setState({
                    rows: ret.data.rows,
                    total: ret.data.total,
                    user_info: ret.data.user_info
                });
            }
        });
    }

    function getGoodsCategory() {
        window.ajax.post(window.config.root + '/goods/search/category', function (ret) {
            service_order.setState({
                category: ret.data
            });
        });
    }

    class ServiceOrderPage extends React.Component {
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
                user_info: {
                    consumer_amount: "",
                    id: "",
                    nickname: "",
                    probability: "",
                    recharge_amount: "",
                    residual_amount: "",
                    winning_amount: ""
                }
            };
        }

        onSubmit() {
            this.state.search.user_id = user_id;
            this.state.search.page = 1;
            getServiceAllOrder(this.state.search);
            this.forceUpdate();
        }

        onFormChange(e) {
            this.state.search[e.target.name] = e.target.value;
            if (e.target.name === "order_status" && e.target.value != "") {
                this.refs['winning'].value = "1";
                this.state.search.winning = "1";
            }
            if (e.target.name === "winning" && e.target.value == "0") {
                this.refs['order_status'].value = "";
                this.state.search.order_status = "";
            }
            this.forceUpdate();
        }

        componentWillMount() {
            getServiceAllOrder({user_id: user_id});
            getGoodsCategory();

        }

        getColumnStyle(val, head, item) {
            if (head.type === "order_status") {
                if (item.winning == 0) {
                    return "未中奖";
                } else if (item.winning == 1) {
                    return <div className="order-status">{order_status[val]}</div>;
                }
            }
            if (head.type == "pcontact") {
                if (item.winning == 0) {
                    return <div/>
                } else if (item.winning == 1) {
                    if (item.order_type == 1) {
                        return (<div>
                            <div>{item.contact_name}</div>
                            <div>{item.contact_id}</div>
                        </div>);
                    } else {
                        return (<div>
                            <div>{item.contact_name}</div>
                            <div>{item.contact_phone}</div>
                            <div>{item.contact_id}</div>
                        </div>)
                    }
                }
            }
            if (head.type == "status") {
                return status[val];
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
                                    <div>余额</div>
                                    <div className="money">{this.state.user_info.residual_amount}</div>
                                </div>
                                {
                                    window.hasPermission(509, 2) ? [<div key="1" className="sub-item">
                                        <div>总中奖额</div>
                                        <div className="money">{this.state.user_info.winning_amount}</div>
                                    </div>,
                                        <div key="2" className="sub-item">
                                            <div>总消费额</div>
                                            <div className="money">{this.state.user_info.consumer_amount}</div>
                                        </div>, <div key="3" className="sub-item">
                                            <div>中奖率</div>
                                            <div className="percent">  {this.state.user_info.probability}</div>
                                        </div>] : null
                                }
                            </div>
                        </div>
                        <div className="date">
                            <Button>
                                <button name="export" module="509" action="1" onClick={() => {
                                    openAction.post(window.config.root + '/user_manage/customer_service_order/excel', {user_id: user_id}, function (ret) {

                                    });
                                }} type="button">导出
                                </button>
                            </Button>
                        </div>
                    </div>
                    <Search
                        onSubmit={this.onSubmit.bind(this)}
                        onChange={this.onFormChange.bind(this)}
                        defaultValue={this.state.search}
                    >
                        <div className="item">
                            <div>订单编号:</div>
                            <input type="text" name="order_id"/>
                        </div>
                        {window.hasPermission(509, 3) ? [
                            <div key="1" className="item">
                                <div>中奖状态</div>
                                <select name="winning" ref="winning">
                                    <option value="">全部</option>
                                    <option value="0">未中奖</option>
                                    <option value="1">已中奖</option>
                                </select>
                            </div>,
                            <div key="2" className="item">
                                <div>订单状态</div>
                                <select ref="order_status" name="order_status">
                                    <option value="">全部</option>
                                    <option value="1">待确认</option>
                                    <option value="2">订单确认</option>
                                    <option value="3">已发货</option>
                                    <option value="4">已签收</option>
                                    <option value="5">夺宝完成</option>
                                </select>
                            </div>

                        ] : null}
                        {window.hasPermission(509, 4) ?
                            <div className="item">
                                <div>收货人信息</div>
                                <input type="text" name="contact_name"/>
                            </div> : null}
                        <div className="item">
                            <div>商品名字</div>
                            <input type="text" name="title"/>
                        </div>
                        <div className="item">
                            <div>商品ID</div>
                            <input type="text" name="goods_id"/>
                        </div>
                        <div className="item">
                            <div>期数</div>
                            <input type="text" name="periods"/>
                        </div>
                        <div className="item">
                            <div>期数id</div>
                            <input type="text" name="periods_id"/>
                        </div>
                        <div className="item">
                            <div>商品分类</div>
                            <select name="category_id">
                                <option value="">全部</option>
                                {this.state.category.map(function (item, index) {
                                    return <option key={index} value={item.id}>{item.title}</option>
                                })}
                            </select>
                        </div>


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
                            this.state.search.user_id = user_id;
                            getServiceAllOrder(this.state.search);
                        }}
                    />
                </div>
            );
        }
    }

    let service_order = ReactDOM.render(
        <ServiceOrderPage/>
        , win.root);
}

//客户管理 金额日志
export function serviceAmount(user_id) {
    let win = openAction.pop();
    const head = [
        {"text": "日志分类", "key": "type", "type": "type"},
        {"text": "盘古币", "key": "amount"},
        {"text": "支付单号", "key": "order_no"},
        {"text": "时间", "key": "create_at"},
    ];
    const type = {
        1: "购买",
        2: "退还",
        3: "管理"
    };

    function getServiceAllAmount(form) {
        window.ajax.post(window.config.root + '/user_manage/customer_service_amount', form, function (ret) {
            if (ret.errcode) {
                utilAction.prompt(ret.msg);
                win.pop.close();
            }else {
                service_Amount.setState({
                    rows: ret.data.rows,
                    total: ret.data.total,
                    user_info: ret.data.user_info
                });
            }
        });
    }

    function onStatistics(form) {
        window.ajax.post(window.config.root + '/user_manage/customer_service_amount/sum_amount', form, function (ret) {
            if (ret.errcode) {
                utilAction.prompt(ret.msg);
                win.pop.close();
            }else {
                service_Amount.setState({
                    statistics: ret.data
                });
            }
        });
    }

    class ServiceAmountPage extends React.Component {
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
                statistics: '',
                user_info: {
                    consumer_amount: "",
                    id: "",
                    nickname: "",
                    probability: "",
                    recharge_amount: "",
                    residual_amount: "",
                    winning_amount: ""
                }
            };
        }

        onSubmit() {
            this.state.search.id = user_id;
            this.state.search.page = 1;
            getServiceAllAmount(this.state.search);
            this.forceUpdate();
        }

        onFormChange(e) {
            this.state.search[e.target.name] = e.target.value;
            this.forceUpdate();
        }

        componentWillMount() {
            getServiceAllAmount({id: user_id});
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
                                    <div>余额</div>
                                    <div className="money">{this.state.user_info.residual_amount}</div>
                                </div>
                                {window.hasPermission(511, 2) ? [<div key="1" className="sub-item">
                                    <div>总中奖额</div>
                                    <div className="money">{this.state.user_info.winning_amount}</div>
                                </div>,
                                    <div key="2" className="sub-item">
                                        <div>总消费额</div>
                                        <div className="money">{this.state.user_info.consumer_amount}</div>
                                    </div>,
                                    <div key="3" className="sub-item">
                                        <div>中奖率</div>
                                        <div className="percent">{this.state.user_info.probability}</div>
                                    </div>] : null}
                            </div>
                        </div>
                    </div>
                    <Search
                        onSubmit={this.onSubmit.bind(this)}
                        onChange={this.onFormChange.bind(this)}
                        defaultValue={this.state.search}
                    >
                        <div className="item">
                            <div>日志类型</div>
                            <select name="type">
                                <option value="">全部</option>
                                <option value="1">购买</option>
                                <option value="2">退还</option>
                                <option value="3">管理</option>
                            </select>
                        </div>
                        <div className="item">
                            <div>支付单号:</div>
                            <input type="text" name="order_no"/>
                        </div>
                        <div className="item">
                            <div>时间</div>
                            <input type="date" className="date" name="start_time"/>-
                            <input type="date" className="date" name="end_time"/>
                        </div>
                        <div className="statistics">
                            {window.hasPermission(511, 1) ?
                                <button type="button" onClick={
                                    () => {
                                        this.state.search.id = user_id;
                                        getServiceAllAmount(this.state.search);
                                        onStatistics(this.state.search)
                                    }
                                }>统计</button> : null}
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
                            getServiceAllAmount(this.state.search);
                        }}
                    />
                </div>
            );
        }
    }

    let service_Amount = ReactDOM.render(
        <ServiceAmountPage/>
        , win.root);
}