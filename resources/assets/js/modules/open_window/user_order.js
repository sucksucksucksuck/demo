/**
 * Created by sucksuck on 2017/6/28.
 */
import React from 'react';
import ReactDOM from "react-dom";
import SimpleTable from '../../modules/simple_table';
import Paging from '../../modules/paging';
import echarts from 'echarts';
import * as openAction from './index';
import Button from '../../modules/button';
import * as utilAction from '../../action/util';

//监控里面 该id的消费情况
export function userOrder(id) {
    // const winning = userData.winning_amount;
    // const consumer = userData.consumer_amount;
    let win = openAction.popOne();
    const head = [
        {"text": "订单编号", "key": "id"},
        {"text": "商品ID", "key": "goods_id"},
        {"text": "商品名字", "key": "title", className: "w200"},
        {"text": "商品期数", "key": "periods", className: "w100"},
        {"text": "购买次数", "key": "num", "type": "num", className: "w80"},
        {"text": "总需次数", "key": "total", "type": "total"},
        {"text": "购买时间", "key": "create_at", "type": "create_at"},
        {"text": "开奖时间", "key": "lottery_show_at"},
        {"text": "收货人信息", "key": "contact", "type": "contact"},
        {"text": "订单状态", "key": "order_status", "type": "order_status"}
    ];

    function getDay(day) {
        let today = new Date();
        let targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
        today.setTime(targetday_milliseconds);
        let tMonth = today.getMonth();
        let tDate = today.getDate();
        tMonth = doHandleMonth(tMonth + 1);
        tDate = doHandleMonth(tDate);
        return tMonth + tDate;
    }

    function doHandleMonth(month) {
        var m = month;
        if (month.toString().length == 1) {
            m = "0" + month;
        }
        return m;
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

    const option = {
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999'
                }
            }
        },
        legend: {
            data: ['中奖额', '消费额', '中奖趋势', '消费趋势']
        },
        xAxis: [
            {
                type: 'category',
                data: [getDay(-6), getDay(-5), getDay(-4), getDay(-3), getDay(-2), getDay(-1), getDay(0)],
                axisPointer: {
                    type: 'shadow'
                }
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {
                    formatter: '{value} '
                }
            }

        ],
        series: [
            {
                name: '中奖额',
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: '#22b7e5'
                    }
                }
            },
            {
                name: '消费额',
                type: 'bar',
                barGap: "1%",
                itemStyle: {
                    normal: {
                        color: '#BAE4F1'
                    }
                }
            },
            {
                name: '中奖趋势',
                type: 'line',
                yAxisIndex: 0,
                smooth: true,
                itemStyle: {
                    normal: {
                        color: '#EC3E27'
                    }
                }
            },
            {
                name: '消费趋势',
                type: 'line',
                yAxisIndex: 0,
                smooth: true,
                itemStyle: {
                    normal: {
                        color: '#FEB62A'
                    }
                }
            }
        ]
    };

    function userOrder(form) {
        window.ajax.post(window.config.root + '/monitor/user_info/user_order', form, function (ret) {
            if (ret.errcode) {
                utilAction.prompt(ret.msg);
                win.pop.close();
            } else {
                user.setState({rows: ret.data.rows, total: ret.data.total});
            }
        });
    }

    function userInfo(form) {
        window.ajax.post(window.config.root + '/monitor/user_info', form, function (ret) {
            if (ret.errcode) {
                utilAction.prompt(ret.msg);
                win.pop.close();
            } else {
                user.setState({
                    consumer_amount: ret.data.user_data.consumer_amount.reverse(),
                    probability: ret.data.user_data.probability,
                    winning_amount: ret.data.user_data.winning_amount.reverse(),
                    user_info: ret.data.user_info,
                });
            }
        });
    }

    class UserPage extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                total: "",
                rows: [],
                consumer_amount: [],
                probability: [],
                winning_amount: [],
                user_info: {},
                max: "",
                interval: "",
                winning_data: [],
                consumer_data: [],
                search: {
                    page: 1,
                    pageSize: 20
                }
            };
            this.resize = function () {
                if (this.chart) {
                    this.chart.resize();
                }
            }.bind(this);
        }

        componentWillMount() {
            userInfo({user_id: id});
            userOrder({user_id: id});

        }

        componentDidMount() {
            this.chart = echarts.init(this.refs['cartogram']);
            window.addEventListener('resize', this.resize, false);
            // console.log(this.refs['cartogram'].children[0].children)

        }

        componentDidUpdate() {
            let option1 = cloneObject(option);
            option1.series[0].data = this.state.winning_amount;
            option1.series[1].data = this.state.consumer_amount;
            option1.series[2].data = this.state.winning_amount;
            option1.series[3].data = this.state.consumer_amount;
            window.onresize = this.chart.resize;
            this.chart.setOption(option1);

        }

        getColumnStyle(val, head, item) {
            if (head.type === "order_status") {
                if (item.winning == 0) {
                    return "未中奖";
                } else {
                    return <div className="order-status">{order_status[val]}</div>;
                }
            } else if (head.type === "contact") {
                if (item.winning === 0) {
                    return null;
                } else {
                    return (<div>
                        <div>{item.contact_name}</div>
                        <div>{item.contact_phone}</div>
                        <div>{item.contact_id}</div>
                    </div>);
                }
            }
        }


        componentWillUnmount() {
            try {
                this.chart.dispose();
            } catch (e) {
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
                                <div className="sub-item">
                                    <div>总中奖额</div>
                                    <div className="money">{this.state.user_info.winning_amount}</div>
                                </div>
                                <div className="sub-item">
                                    <div>总消费额</div>
                                    <div className="money">{this.state.user_info.consumer_amount}</div>
                                </div>
                                <div className="sub-item">
                                    <div>中奖率</div>
                                    <div className="percent">{this.state.user_info.probability}</div>
                                </div>
                            </div>
                            <div className="user-table">
                                <table cellSpacing="0">
                                    <thead>
                                    <tr>
                                        <td/>
                                        <td>今天</td>
                                        <td>昨天</td>
                                        <td>前天</td>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr className="money">
                                        <td>中奖额</td>
                                        <td>{this.state.winning_amount[6]}</td>
                                        <td>{this.state.winning_amount[5]}</td>
                                        <td>{this.state.winning_amount[4]}</td>
                                    </tr>
                                    <tr className="money">
                                        <td>消费额</td>
                                        <td>{this.state.consumer_amount[6]}</td>
                                        <td>{this.state.consumer_amount[5]}</td>
                                        <td>{this.state.consumer_amount[4]}</td>
                                    </tr>
                                    <tr className="percent">
                                        <td>中奖率</td>
                                        <td>{this.state.probability[0]}</td>
                                        <td>{this.state.probability[1]}</td>
                                        <td>{this.state.probability[2]}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="cartogram">
                            <div ref="cartogram" style={{width: 650, height: 300}}/>
                        </div>
                    </div>
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
                            this.state.search.user_id = id;
                            userOrder(this.state.search);
                        }}
                    />
                </div>
            );
        }
    }

    let user = ReactDOM.render(
        <UserPage/>
        , win.root);
}