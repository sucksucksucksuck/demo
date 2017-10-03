/**
 * Created by sucksuck on 2017/6/28.
 */
//点击期数id 显示本期所有订单
import React from 'react';
import ReactDOM from "react-dom";
import SimpleTable from '../../modules/simple_table';
import Paging from '../../modules/paging';
import Search from '../../modules/search';
import * as openAction from './index';
import Button from '../../modules/button';
import * as utilAction from '../../action/util';
export function allOrder(periods) {
    let win = openAction.pop();
    const head = [
        {"text": "订单编号", "key": "order_id"},
        {"text": "用户UID", "key": "user_id"},
        {"text": "用户昵称", "key": "nickname", className: "w400"},
        {"text": "购买次数", "key": "num", className: "w100"},
        {"text": "购买时间", "key": "o_create_at", "type": "o_create_at"},
        {"text": "收货人信息", "key": "pcontact", "type": "pcontact"},
        {"text": "订单状态", "key": "winning", "type": "winning"}
    ];

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

    function getAllOrder(form) {
        window.ajax.post(window.config.root + '/order/current_order', form, function (ret) {
            if (ret.errcode) {
                utilAction.prompt(ret.msg);
                win.pop.close();
            }else {
                order.setState({
                    rows: ret.data.rows,
                    total: ret.data.total,
                    goods: ret.data.goods
                });
            }
        });
    }

    class OrderPage extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                total: 0,
                rows: [],
                goods: {},
                search: {
                    page: 1,
                    pageSize: 20,
                    user_type: "0"
                }
            };
        }

        onSubmit() {
            this.state.search.periods_id = periods;
            getAllOrder(this.state.search);
            this.forceUpdate();
        }

        onFormChange(e) {
            this.state.search[e.target.name] = e.target.value;
            this.forceUpdate();
        }

        componentDidMount() {
            getAllOrder({periods_id: periods, user_type: 0})

        }

        getColumnStyle(val, head, item) {
            if (head.type === "winning") {
                if (val == 0) {
                    return "未中奖";
                } else if (val == 1) {
                    return <div className="order-status">{order_status[item.order_status]}</div>;
                }
            }
            if (head.type == "pcontact") {
                if (item.winning == 0) {
                    return <div />
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
        }

        render() {
            return (
                <div className="user-order">
                    <div className="navigator">
                        <div className="detail">
                            <img src={this.state.goods.icon} onError={(e) => {
                                e.target.src = window.config.root + "/image/index/index_user.png";
                            }}/>
                            <div className="text">
                                <div>{this.state.goods.title}</div>
                                <div>
                                    <span>单价:{this.state.goods.unit_price}</span>
                                    <span>商品ID:{this.state.goods.goods_id}</span>
                                    <span>期数:{this.state.goods.periods}</span>
                                    <span>期数ID:{this.state.goods.periods_id}</span>
                                    <span>开奖结果:{status[this.state.goods.status]}</span>
                                    <span>开奖时间:{this.state.goods.lottery_show_at}</span>
                                </div>
                            </div>
                        </div>
                        <div className="date">
                            <Button>
                                <button name="export" module="216" action="1" onClick={() => {
                                    openAction.post(window.config.root + '/order/current_order/excel',
                                        {periods_id: periods}, function (ret) {
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
                            <div>用户UID:</div>
                            <input type="text" name="user_id"/>
                        </div>
                        <div className="item">
                            <div>订单编号:</div>
                            <input type="text" name="order_id"/>
                        </div>
                        <div className="item">
                            <div>用户类型</div>
                            <select name="user_type">
                                <option value="">全部</option>
                                <option value="0">普通用户</option>
                                <option value="1">机器人</option>
                                <option value="4">客服</option>
                            </select>
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
                            this.state.search.periods_id = periods;
                            getAllOrder(this.state.search);
                        }}
                    />
                </div>
            );
        }
    }
    let order = ReactDOM.render(
        <OrderPage/>
        , win.root);
}