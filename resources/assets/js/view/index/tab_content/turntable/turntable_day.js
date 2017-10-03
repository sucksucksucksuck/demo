/**
 * Created by lrx on 2017/7/21.
 */
import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import * as turntableLogAction from '../../../../action/turntable/turntable_day'
import AbsTabContent from '../abs_tab_content';
import DateInput from '../../../../modules/date_input';

const head = [
    {"text": "日期", "key": "date"},
    {"text": "大转盘参与次数", "key": "count"},
    {"text": "领取红包次数", "key": "real_red_count"},
    {"text": "领取红包金额", "key": "real_red_amount"},
    {"text": "发放盘古币金额", "key": "real_amount"},
];
const module = 903;

class TurntableDay extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['turntableDay'];
    }

    componentDidMount() {
        turntableLogAction.getLogList(this.state.search);
    }

    componentWillReceiveProps(props) {
        this.state = props["turntableDay"];
        this.forceUpdate();
    }

    render() {
        return (
            <div className="turntable-day">
                <Search
                    defaultValue={this.state.search}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                    }}
                    onSubmit={() => {
                        this.state.search.page = 1;
                        turntableLogAction.getLogList(this.state.search);
                    }}>
                    <div className="item">
                        <div>时间:</div>
                        <input ref='start_time' type="date" name="start_time"/>
                        -
                        <input ref='end_time' type="date" name="end_time"/>
                        <div className="date">{this.state.warn ? this.state.warnText : null}</div>
                    </div>

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
                        turntableLogAction.getLogList(this.state.search);
                    }}
                />
            </div>
        )
    }
}
export default connect(({turntableDay}) => ({turntableDay}))(TurntableDay);