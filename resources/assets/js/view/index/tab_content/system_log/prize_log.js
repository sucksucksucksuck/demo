/**
 * Created by sucksuck on 2017/6/8.
 */
import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import * as prizeLogAction from '../../../../action/system_log/prize_log'
import AbsTabContent from '../abs_tab_content';
import * as eventAction from '../../../../action/event';
import DateInput from '../../../../modules/date_input';

const head = [
    {"text": "用户UID", "key": "user_id"},
    {"text": "奖品标题", "key": "title", "type": "title"},
    {"text": "类型", "key": "type", "type": "type"},
    {"text": "活动", "key": "event_title"},
    {"text": "时间", "key": "create_at","type":"create_at"},
    {"text": "备注", "key": "remark",className:"w400"},

];
const type = {
    1: "实物商品",
    2: "虚拟商品",
    3: "红包",
    4: "盘古币",
    5: "积分"
};
const option = [
    {id:"1",title:"实物商品"},
    {id:"2",title:"虚拟商品"},
    {id:"3",title:"红包"},
    {id:"4",title:"盘古币"},
    {id:"5",title:"积分"}
];


const module = 1402;
class PrizeLog extends AbsTabContent {
    constructor(props) {
        super(props,module);
        this.state = props['systemLogPrizeLog'];
    }
    componentWillMount() {
        prizeLogAction.getLogList(this.state.search);
        eventAction.getEventList();
        this.state.statistics = '';
        this.forceUpdate();
    }
    componentWillUnmount(){
        // prizeLogAction.payLogClear();
    }
    componentWillReceiveProps(props) {
        this.state = props["systemLogPrizeLog"];
        this.forceUpdate();

    }

    getColumnStyle(val, head, item) {
        if (head.type === "type") {
            return (<div>{type[val]}</div>)
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
                        prizeLogAction.getLogList(this.state.search);
                    }}>
                    <div className="item">
                        <div >活动</div>
                        <select type="text" name="event_id">
                            <option value="">全部</option>
                            {this.state.event_list.map(function (item, index) {
                                return (<option key={index} value={item.id}>{item.title}</option>);
                            })}
                        </select>
                    </div>
                    <div className="item">
                        <div>用户UID:</div>
                        <input type="text" name="user_id"/>
                    </div>
                    <div className="item">
                        <div>类型:</div>
                        <select type="text" name="type">
                            <option value="">全部</option>
                            {option.map(function (item, index) {
                                return (<option key={index} value={item.id}>{item.title}</option>);
                            })}
                        </select>
                    </div>
                    <div className="item">
                        <div >备注:</div>
                        <input type="text" name="remark"/>
                    </div>
                    <DateInput start="start_time" end="end_time"/>

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
                        prizeLogAction.getLogList(this.state.search);
                    }}
                />
            </div>
        )
    }
}
export default connect(({systemLogPrizeLog}) => ({systemLogPrizeLog}))(PrizeLog);