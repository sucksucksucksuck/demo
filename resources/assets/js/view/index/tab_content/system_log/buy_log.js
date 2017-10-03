import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import * as buyLogAction from '../../../../action/system_log/buy_log'
import AbsTabContent from '../abs_tab_content';
import DateInput from '../../../../modules/date_input';

const head = [
    {"text": "用户UID", "key": "user_id"},
    {"text": "日志分类", "key": "type", "type": "type"},
    {"text": "盘古币", "key": "amount", "type": "amount"},
    {"text": "支付单号", "key": "order_no", "type": "order_no"},
    {"text": "时间", "key": "create_at"},
];
const type = {
    1: "购买",
    2: "退还",
    3: "管理"
};
const module = 1401;
class BuyLog extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['systemLogBuyLog'];
    }

    componentDidMount() {
        buyLogAction.getLogList(this.state.search);
        this.state.statistics = '';
        this.forceUpdate();
    }

    componentWillReceiveProps(props) {
        this.state = props["systemLogBuyLog"];
        this.forceUpdate();

    }

    componentWillUnmount() {
        // buyLogAction.buyLogClear();
    }

    getColumnStyle(val, head, item) {
        //判断列改样式
        if (head.type === "type") {
            // console.log(val);
            return (<div className={`type_${val}`}>{type[val]}</div>)
        }
        if (head.type === "amount") {
            //console.log(val);
            return (<div className={val >= 0 ? "green" : "red"}>{val}</div>)
        }
    }


    render() {
        return (
            <div className="amount-log">
                <Search
                    defaultValue={this.state.search}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                    }}
                    onSubmit={() => {
                        this.state.search.page = 1;
                        buyLogAction.getLogList(this.state.search);
                    }}>
                    <div className="item">
                        <div >日志分类:</div>
                        <select type="text" name="type">
                            <option value="">全部</option>
                            <option value="1">购买</option>
                            <option value="2">退还</option>
                            <option value="3">管理</option>
                        </select>
                    </div>
                    <div className="item">
                        <div>用户UID:</div>
                        <input type="text" name="user_id"/>
                    </div>
                    <div className="item">
                        <div>支付单号:</div>
                        <input type="text" name="order_no"/>
                    </div>
                    <DateInput start="start_time" end="end_time"/>
                    <div className="statistics">
                        {window.hasPermission(module, 1) ?
                            <button type="button" onClick={
                                () => {
                                    buyLogAction.getLogList(this.state.search);
                                    buyLogAction.onStatistics(this.state.search)
                                }
                            }>统计</button> : null}
                        {this.state.statistics == '' ? '' : <span>盘古币总和:{this.state.statistics}</span>}
                    </div>
                </Search>
                <SimpleTable
                    head={head}
                    checkbox={false}
                    rows={this.state.rows}
                    getColumnStyle={this.getColumnStyle.bind(this)}
                >
                </SimpleTable>
                <Paging
                    total={this.state.total}
                    page={this.state.search.page}
                    onPaginate={(page, page_size) => {
                        this.state.search.page = page;
                        this.state.search.page_size = page_size;
                        buyLogAction.getLogList(this.state.search);
                    }}
                />
            </div>
        )
    }
}
export default connect(({systemLogBuyLog}) => ({systemLogBuyLog}))(BuyLog);