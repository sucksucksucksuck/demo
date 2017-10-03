/**
 * Created by lrx on 2017/7/21.
 */
import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import DateInput from '../../../../modules/date_input';
import * as turntableLogAction from '../../../../action/turntable/turntable_log'
import AbsTabContent from '../abs_tab_content';

const head = [
    {"text": "用户UID", "key": "user_id"},
    {"text": "转盘等级", "key": "level"},
    {"text": "转盘名字", "key": "level", "type": "level"},
    {"text": "抽中奖励", "key": "title"},
    {"text": "时间", "key": "create_at"},
];
const level = {
    "1": "幸运大转盘",
    "2": "豪华大转盘",
    "3": "至尊大转盘",
    "4": "荣耀大转盘",
    "5": "铂金大转盘",
    "6": "钻石大转盘",
    "7": "王者大转盘",
    "8": "财神大转盘",
};
const module = 902;

class TurntableLog extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['turntableLog'];

    }

    componentDidMount() {
        turntableLogAction.getLogList();
    }

    componentWillReceiveProps(props) {
        this.state = props["turntableLog"];
        this.forceUpdate();
    }

    getColumnStyle(val, head, item) {
        if (head.type === "level") {
            return level[val];
        }
    }

    componentWillUnmount() {
        turntableLogAction.clear();
    }

    render() {
        return (
            <div className="turntable-log">
                <Search
                    defaultValue={this.state.search}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                    }}
                    onSubmit={() => {
                        this.state.search.page = 1;
                        turntableLogAction.getLogList(this.state.search);
                        if (this.state.search.user_id) {
                            turntableLogAction.statistics(this.state.search);
                        }else {
                            this.state.statistics = false;
                        }
                    }}>
                    <div className="item">
                        <div>用户UID:</div>
                        <input type="text" name="user_id"/>
                    </div>
                    <DateInput noWarn={true} start="start_time" end="end_time"/>
                    {this.state.statistics && window.hasPermission(module, 1) ? <div className="item cumulative">
                        <span>累计红包金额:{this.state.red_amount}</span>
                        <span>盘古币总和:{this.state.pan_amount}</span>
                        <div className="date">{this.state.warn ? this.state.warnText : null}</div>
                    </div> : null}
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
                        turntableLogAction.getLogList(this.state.search);
                    }}
                />
            </div>
        )
    }
}

export default connect(({turntableLog}) => ({turntableLog}))(TurntableLog);