import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import * as payLogAction from '../../../../action/system_log/pay_log';
import * as utilAction from '../../../../action/util';
import AbsTabContent from '../abs_tab_content';
import DateInput from '../../../../modules/date_input';

const head = [
    {"text": "用户UID", "key": "user_id"},
    {"text": "日志分类", "key": "type", "type": "type"},
    {"text": "盘古币", "key": "amount", "type": "amount"},
    {"text": "流水号", "key": "order_no", "type": "order_no"},
    {"text": "充值单号", "key": "pay_no"},
    {"text": "时间", "key": "create_at"},
];
const type = {
    3: "汇付宝",
    4: "融脉",
    6: "付钱拉",
};
const module = 1402;
class PayLog extends AbsTabContent {
    constructor(props) {
        super(props,module);
        this.state = props['systemLogPayLog'];
    }
    componentDidMount() {
        payLogAction.getLogList(this.state.search);
        this.state.statistics = '';
        this.forceUpdate();
    }
    componentWillUnmount(){
        // payLogAction.payLogClear();
    }
    componentWillReceiveProps(props) {
        this.state = props["systemLogPayLog"];
        this.forceUpdate();

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
                        payLogAction.getLogList(this.state.search);
                    }}>
                    <div className="item">
                        <div >充值渠道:</div>
                        <select type="text" name="type">
                            <option value="">全部</option>
                            <option value="3">汇付宝</option>
                            <option value="4">融脉</option>
                            <option value="6">付钱拉</option>
                        </select>
                    </div>
                    <div className="item">
                        <div>用户UID:</div>
                        <input type="text" name="user_id"/>
                    </div>
                    <div className="item">
                        <div >充值单号:</div>
                        <input type="text" name="pay_no"/>
                    </div>
                    <div className="item">
                        <div>流水号:</div>
                        <input type="text" name="order_no"/>
                    </div>
                    <DateInput name="12" start="start_time" end="end_time"/>
                    <div className="statistics">
                        {window.hasPermission(module, 1) ?
                            <button type="button" onClick={
                                ()=>{
                                    payLogAction.onStatistics(this.state.search);
                                    payLogAction.getLogList(this.state.search);
                                }
                            }>
                                统计</button> : null}
                        <button type="button" onClick={
                            ()=>{
                                if(this.state.search.order_no){
                                    utilAction.prompt('查询不到流水号'+this.state.search.order_no+'，请确认是否有充值或稍后再试',()=>{
                                        return 'cancel';
                                    },"确定")
                                }
                            }
                        }>
                            查询流水号</button>
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
                        payLogAction.getLogList(this.state.search);
                    }}
                />
            </div>
        )
    }
}
export default connect(({systemLogPayLog}) => ({systemLogPayLog}))(PayLog);