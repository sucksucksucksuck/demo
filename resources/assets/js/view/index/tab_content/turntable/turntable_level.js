/**
 * Created by lrx on 2017/7/21.
 */
import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import * as turntableLevelAction from '../../../../action/turntable/turntable_level'
import AbsTabContent from '../abs_tab_content';

const head = [
    {"text": "日期", "key": "date"},
    {"text": "1级转盘使用数", "key": "level_1"},
    {"text": "2级转盘使用数", "key": "level_2"},
    {"text": "3级转盘使用数", "key": "level_3"},
    {"text": "4级转盘使用数", "key": "level_4"},
    {"text": "5级转盘使用数", "key": "level_5"},
    {"text": "6级转盘使用数", "key": "level_6"},
    {"text": "7级转盘使用数", "key": "level_7"},
    {"text": "8级转盘使用数", "key": "level_8"},
];

const module = 904;

class TurntableLevel extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['turntableLevel'];
    }

    componentDidMount() {
        turntableLevelAction.getLogList(this.state.search);
    }

    componentWillReceiveProps(props) {
        this.state = props["turntableLevel"];
        this.forceUpdate();
    }

    onStatistics(date_type) {
        this.state.search.date_type = date_type;
        this.state.search.page = 1;
        turntableLevelAction.getLogList(this.state.search);
        this.forceUpdate();

    }

    render() {
        return (
            <div className="turntable-level">
                <div className="navigator">
                    <div className="status">
                        <span className={this.state.search.date_type === 1 ? "active" : null}
                              onClick={this.onStatistics.bind(this, 1)}>每日统计</span>
                        <span className={this.state.search.date_type === 2 ? "active" : null}
                              onClick={this.onStatistics.bind(this, 2)}>每月统计
                    </span>
                    </div>
                </div>
                <Search
                    defaultValue={this.state.search}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                    }}
                    onSubmit={() => {
                        this.state.search.page = 1;
                        turntableLevelAction.getLogList(this.state.search);
                    }}>
                    {this.state.search.date_type === 1 ? <div className="item">
                        <div>时间:</div>
                        <input ref='start_time' type="date" name="start_time"/>
                        -
                        <input ref='end_time' type="date" name="end_time"/>
                        <div className="date">{this.state.warn ? this.state.warnText : null}</div>
                    </div> : <div className="item">
                        <div>时间:</div>
                        <input ref='start_time' type="month" name="start_time"/>
                        -
                        <input ref='end_time' type="month" name="end_time"/>
                        <div className="date">{this.state.warn ? this.state.warnText : null}</div>
                    </div>}
                </Search>
                <SimpleTable
                    head={head}
                    checkbox={false}
                    rows={this.state.rows}
                    // getColumnStyle={this.getColumnStyle.bind(this)}
                >
                </SimpleTable>
                <Paging
                    total={this.state.total}
                    page={this.state.search.page}
                    onPaginate={(page, page_size) => {
                        this.state.search.page = page;
                        this.state.search.page_size = page_size;
                        turntableLevelAction.getLogList(this.state.search);
                    }}
                />
            </div>
        )
    }
}

export default connect(({turntableLevel}) => ({turntableLevel}))(TurntableLevel);