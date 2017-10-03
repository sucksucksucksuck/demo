/**
 * Created by sun_3211 on 2017/4/6.
 */

import React from 'react';
import connect from '../../../../modules/connect';
import Canvas from '../../../../modules/canvas'
import goodsProgress from '../../../../modules/chart/goods_progress'
import * as monitorAction from '../../../../action/monitor';
import * as utilAction from '../../../../action/util';
import * as openWindow from '../../../../modules/open_window/user_order';
import AbsTabContent from '../abs_tab_content';

const module = 1301;

class Goods extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['monitorGoods'];
        this.state.slide = false;
    }

    onButtonClick() {
        monitorAction.getGoods();
    }

    componentWillMount() {
        monitorAction.dataUpdate();
    }

    componentDidMount() {
        monitorAction.initPage(this.props);
    }

    componentWillReceiveProps(props) {
        this.state = props["monitorGoods"];
        this.forceUpdate();

    }

    selectedSort(n1, n2) {
        if (!this.props.monitorGoodsSetting.selected[n1] || !this.props.monitorGoodsSetting.selected[n2]) {
            return 0;
        }
        return this.props.monitorGoodsSetting.selected[n1].index - this.props.monitorGoodsSetting.selected[n2].index;
    }

    totalGoodsSort(n1, n2) {
        return n2.now - n1.now;
    }

    onUserClick(periods_id, user_id) {
        if (this.state.appoint && this.state.appoint[`id_${periods_id}`] === user_id) {
            monitorAction.cancel({periods_id: periods_id});
        } else {
            monitorAction.appoint({periods_id: periods_id, user_id: user_id});
        }
    }

    onPeriodsClick(item) {
        if (item.lottery_type === 1) {
            monitorAction.robot(item.id, item.goods_id);
        } else {
            monitorAction.all(item.id, item.goods_id);
        }
    }

    onSlideClick() {
        this.state.slide = !this.state.slide;
        this.forceUpdate()
    }

    render() {
        return (
            <div className="monitor-goods">
                <div className="head">
                    <div className="setting" onClick={this.onButtonClick.bind(this)}/>
                    {window.hasPermission(1301, 4) ? <div className="data-update">
                        <div>
                            <span>今日充值额：{this.state.data_update[0].recharge_amount}</span>
                            <span>昨日充值额：{this.state.data_update[1].recharge_amount}</span>
                            <span>前天充值额：{this.state.data_update[2].recharge_amount}</span>
                        </div>
                        <div>
                            <span>消费额：{this.state.data_update[0].consumer_amount}</span>
                            <span>消费额：{this.state.data_update[1].consumer_amount}</span>
                            <span>消费额：{this.state.data_update[2].consumer_amount}</span>
                        </div>
                        <div>
                            <span>总发放奖励：{this.state.data_update[0].winning_amount}</span>
                            <span>总发放奖励：{this.state.data_update[1].winning_amount}</span>
                            <span>总发放奖励：{this.state.data_update[2].winning_amount}</span>
                        </div>
                        <div>
                            <span>注册：{this.state.data_update[0].register}</span>
                            <span>注册：{this.state.data_update[1].register}</span>
                            <span>注册：{this.state.data_update[2].register}</span>
                        </div>
                        <div>
                            <span>登录：{this.state.data_update[0].login}</span>
                            <span>登录：{this.state.data_update[1].login}</span>
                            <span>登录：{this.state.data_update[2].login}</span>
                        </div>
                        <div className="update-img" onClick={monitorAction.dataUpdate.bind(this)}/>
                    </div> : null}
                    {window.hasPermission(1301, 5) ? <div className="buy-all">
                        <div className="buy-button" onClick={() => {
                            let ids = [];
                            let obj = store.getState().monitorQuickPurchaseSetting.selected;
                            for (let c in obj) {
                                ids.push(obj[c].id);
                            }
                            monitorAction.quickPurchase({goods_id: ids})

                        }}>一键购买
                        </div>
                        <div className="buy-setting" onClick={monitorAction.getQuickSetting}/>
                    </div> : null}

                </div>
                <div className={this.state.slide ? "slide active" : "slide"} onClick={this.onSlideClick.bind(this)}/>
                <div className={this.state.slide ? "wrap hidden-wrap" : "wrap"}>
                    <div>
                        <div className="single-goods">
                            {Object.keys(this.state.single_goods).sort(this.selectedSort.bind(this)).map(function (key, index) {
                                let goods = this.props.monitorGoodsSetting.selected[key];
                                if (!goods) {
                                    delete this.state.single_goods[key];
                                    return null;
                                }
                                let item = this.state.single_goods[key];
                                return (
                                    <div className="item" key={index}>
                                        <div className="title">[{item.periods}] {goods.title}</div>
                                        <div className="progress">
                                            <Canvas
                                                onDrawing={goodsProgress.bind(this, item.buy * 100 / item.total, item.periods, '期数')}
                                                onClick={this.setState.bind(this, {single_goods_tip: index + 1}, null)}
                                            />
                                            <div>
                                                <div>已购买人次 : {item.buy}</div>
                                                <div>剩余人次 : {item.total - item.buy}</div>
                                                {window.hasPermission(module, 1) || window.hasPermission(module, 2) ?
                                                    <button
                                                        className={item.lottery_type === 1 ? null : "active"}
                                                        onClick={this.onPeriodsClick.bind(this, item)}/> : null}
                                                {window.hasPermission(1301, 5) ?
                                                    <button className="quick-buy" onClick={() => {
                                                        let ids = [];
                                                        ids.push(item.goods_id);
                                                        monitorAction.quickPurchase({goods_id: ids});
                                                    }}>快速购买
                                                    </button> : null}

                                            </div>
                                        </div>
                                        <div className="data">
                                            <table>
                                                <thead>
                                                <tr>
                                                    <td>用户UID</td>
                                                    <td>昵称</td>
                                                    <td>购买数量</td>
                                                    <td>操作</td>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {item.user.map(function (user_item, user_index) {
                                                    let className = [];
                                                    if (user_item.user_type === 4 || user_item.user_type === 2) {
                                                        className.push('green');
                                                    } else if (user_item.user_type === 3) {
                                                        className.push('orange');
                                                    }
                                                    return (
                                                        <tr key={user_index} className={className.join(' ')}>
                                                            <td onClick={() => {
                                                                if (window.hasPermission(1303, 1)) {
                                                                    openWindow.userOrder(user_item.user_id);
                                                                }
                                                            }}>{user_item.user_id}</td>
                                                            <td>{user_item.nickname}</td>
                                                            <td>{user_item.num}</td>
                                                            <td>
                                                                {window.hasPermission(module, 1) || window.hasPermission(module, 2) ?
                                                                    <button
                                                                        className={this.state.appoint[`id_${item.id}`] === user_item.user_id ? "active" : null}
                                                                        onClick={this.onUserClick.bind(this, item.id, user_item.user_id)}/> : null}
                                                            </td>
                                                        </tr>
                                                    )
                                                }, this)}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )
                            }, this)}
                            {/*{this.state.single_goods_tip > 0 ? (*/}
                            {/*<div className="other-tip" style={{left: (this.state.single_goods_tip - 1) * 366 + 19}}>*/}
                            {/*<table>*/}
                            {/*<thead>*/}
                            {/*<tr>*/}
                            {/*<td>期数</td>*/}
                            {/*<td>状态</td>*/}
                            {/*<td onClick={this.setState.bind(this, {single_goods_tip: 0}, null)}>&times;</td>*/}
                            {/*</tr>*/}
                            {/*</thead>*/}
                            {/*<tbody>*/}
                            {/*<tr>*/}
                            {/*<td>2012</td>*/}
                            {/*<td colSpan="2">进行中</td>*/}
                            {/*</tr>*/}
                            {/*<tr>*/}
                            {/*<td>2012</td>*/}
                            {/*<td colSpan="2">进行中</td>*/}
                            {/*</tr>*/}
                            {/*<tr>*/}
                            {/*<td>2012</td>*/}
                            {/*<td colSpan="2">进行中</td>*/}
                            {/*</tr>*/}
                            {/*<tr>*/}
                            {/*<td>2012</td>*/}
                            {/*<td colSpan="2">进行中</td>*/}
                            {/*</tr>*/}
                            {/*<tr>*/}
                            {/*<td>2012</td>*/}
                            {/*<td colSpan="2">进行中</td>*/}
                            {/*</tr>*/}
                            {/*<tr>*/}
                            {/*<td>2012</td>*/}
                            {/*<td colSpan="2">进行中</td>*/}
                            {/*</tr>*/}
                            {/*<tr>*/}
                            {/*<td>2012</td>*/}
                            {/*<td colSpan="2">进行中</td>*/}
                            {/*</tr>*/}
                            {/*</tbody>*/}
                            {/*</table>*/}
                            {/*</div>*/}
                            {/*) : null}*/}
                        </div>
                        <div className={"total-goods" + (this.state.show_total ? " active" : "")}>
                            <table>
                                <thead>
                                <tr>
                                    <td>产品ID</td>
                                    <td>产品名称</td>
                                    <td>产品实际金额</td>
                                    <td>1小时内订单</td>
                                    <td>{((22 + this.state.now_hour) % 24) + 1}点的订单</td>
                                    <td>{((21 + this.state.now_hour) % 24) + 1}点的订单</td>
                                    <td>{((20 + this.state.now_hour) % 24) + 1}点的订单</td>
                                </tr>
                                </thead>
                                <tbody>
                                {this.state.total_goods.sort(this.totalGoodsSort.bind(this)).map(function (item, index) {
                                    return (
                                        <tr key={index}>
                                            <td>{item.goods_id}</td>
                                            <td>{item.title}</td>
                                            <td>{item.amount}</td>
                                            <td>{item.now}</td>
                                            <td>{item.up_1_hour}</td>
                                            <td>{item.up_2_hour}</td>
                                            <td>{item.up_3_hour}</td>
                                        </tr>);
                                }, this)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className={"switch" + (this.state.show_total ? " active" : "")}
                         onClick={monitorAction.switchPanel}/>
                </div>
                <div className="goods-list">
                    <div>
                        <table>
                            <thead>
                            <tr>
                                <th colSpan="9">实时购买数量商品订单</th>
                            </tr>
                            <tr>
                                <td>UID</td>
                                <td>姓名</td>
                                <td>商品ID</td>
                                <td className="w150">商品名字</td>
                                <td>期数</td>
                                <td>人次</td>
                                <td>
                                    <div>总中奖额 / 总消费额</div>
                                    <div>总中奖率 ( % )</div>
                                </td>
                                <td>
                                    <div>今天中奖额/今天消费额</div>
                                    <div>总中奖率 ( % )</div>
                                </td>
                                <td>操作</td>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.goods_list.map(function (item) {
                                let className = [];
                                if (item.user_type === 4 || item.user_type === 2 ) {
                                    className.push('green');
                                } else if (item.user_type === 3) {
                                    className.push('orange');
                                } else if (item.user_type === 0) {
                                    if (item.total_winning * 100 / item.total_buy < 20) {
                                        className.push('red');
                                    } else if (item.total_winning * 100 / item.total_buy > 80) {
                                        className.push('blue');
                                    }
                                }
                                if (className.length > 0) {
                                    className = className.join(' ');
                                } else {
                                    className = null;
                                }
                                return (
                                    <tr key={item.id} className={className}>
                                        <td onClick={() => {
                                            if (window.hasPermission(1303, 1)) {
                                                openWindow.userOrder(item.user_id);
                                            }
                                        }}>{item.user_id}</td>
                                        <td>{item.nickname}</td>
                                        <td>{item.goods_id}</td>
                                        <td>{item.title}</td>
                                        <td>{item.periods}</td>
                                        <td>{item.num}</td>
                                        <td>
                                            <div>{item.total_winning} / {item.total_buy}</div>
                                            <div>{(item.total_winning * 100 / item.total_buy).toFixed(2)}%</div>
                                        </td>
                                        <td>
                                            <div>{item.today_winning} / {item.today_buy}</div>
                                            <div>{(item.today_winning * 100 / item.today_buy).toFixed(2)}%</div>
                                        </td>
                                        <td>
                                            {window.hasPermission(module, 1) || window.hasPermission(module, 2) ?
                                                <button
                                                    className={this.state.appoint[`id_${item.periods_id}`] === item.user_id ? "active" : null}
                                                    onClick={this.onUserClick.bind(this, item.periods_id, item.user_id)}/> : null}
                                        </td>
                                    </tr>
                                )
                            }, this)}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <table>
                            <thead>
                            <tr>
                                <th colSpan="9">实时购买数量超过商品金额的50%以上的订单</th>
                            </tr>
                            <tr>
                                <td>UID</td>
                                <td>姓名</td>
                                <td>商品ID</td>
                                <td className="w150">商品名字</td>
                                <td>期数</td>
                                <td>人次</td>
                                <td>
                                    <div>总中奖额 / 总消费额</div>
                                    <div>总中奖率 ( % )</div>
                                </td>
                                <td>
                                    <div>今天中奖额/今天消费额</div>
                                    <div>总中奖率 ( % )</div>
                                </td>
                                <td>操作</td>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.goods_list_50.map(function (item, index) {
                                let className = [];
                                if (item.user_type === 4 || item.user_type === 2) {
                                    className.push('green');
                                } else if (item.user_type === 3) {
                                    className.push('orange');
                                } else if (item.user_type === 0) {
                                    if (item.total_winning * 100 / item.total_buy < 20) {
                                        className.push('red');
                                    } else if (item.total_winning * 100 / item.total_buy > 80) {
                                        className.push('blue');
                                    }
                                }
                                if (className.length > 0) {
                                    className = className.join(' ');
                                } else {
                                    className = null;
                                }
                                return (
                                    <tr key={index} className={className}>
                                        <td onClick={() => {
                                            if (window.hasPermission(1303, 1)) {
                                                openWindow.userOrder(item.user_id);
                                            }
                                        }}>{item.user_id}</td>
                                        <td>{item.nickname}</td>
                                        <td>{item.goods_id}</td>
                                        <td>{item.title}</td>
                                        <td>{item.periods}</td>
                                        <td>{item.num}</td>
                                        <td>
                                            <div>{item.total_winning} / {item.total_buy}</div>
                                            <div>{(item.total_winning * 100 / item.total_buy).toFixed(2)}%</div>
                                        </td>
                                        <td>
                                            <div>{item.today_winning} / {item.today_buy}</div>
                                            <div>{(item.today_winning * 100 / item.today_buy).toFixed(2)}%</div>
                                        </td>
                                        <td>
                                            <button
                                                className={this.state.appoint[`id_${item.periods_id}`] === item.user_id ? "active" : null}
                                                onClick={this.onUserClick.bind(this, item.periods_id, item.user_id)}/>
                                        </td>
                                    </tr>
                                )
                            }, this)}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>);
    }
}

export default connect(({monitorGoods, monitorGoodsSetting}) => ({monitorGoods, monitorGoodsSetting}))(Goods);
