/**
 * Created by sucksuck on 2017/5/25.
 */

import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom'
import * as utilAction from '../../../../action/util';
import SimpleTable from '../../../../modules/simple_table';
import * as eventAction from '../../../../action/event/manage';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import AbsTabContent from '../abs_tab_content';
import Button from '../../../../modules/button';
import DateInput from '../../../../modules/date_input';

const head = [
    {"text": "活动ID", "key": "id"},
    {"text": "活动名字", "key": "title"},
    {"text": "活动时间", "key": "time", "type": "time", className: " w400"}

];
const module = 702;
class EventManage extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['eventManage'];
    }

    getColumnStyle(val, head, item) {
        if (head.type == "time") {
            return (<div>
                {item.begin_at} - {item.end_at}
            </div>);
        }
    }

    componentWillReceiveProps(props) {
        this.state = props["eventManage"];
        this.forceUpdate();
    }

    componentWillMount() {
        eventAction.getEventManageList(this.state.search);
    }

    render() {
        return (
            <div className="event-list">
                <div className="navigator">
                    <Button>
                        <NavLink module={module} action="1" key="2" name="setting" to="/event/manage/data/export/[]">导出活动数据</NavLink>
                    </Button>
                </div>
                <Search
                    defaultValue={this.state.search}
                    onSubmit={() => {
                        this.state.search.page = 1;
                        eventAction.getEventManageList(this.state.search);
                    }}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                        this.forceUpdate();
                    }}
                >
                    <div className="item">
                        <div>活动名字</div>
                        <input type="text" name="title"/></div>
                    <div className="item">
                        <div>活动ID</div>
                        <input type="text" name="id"/></div>
                    <DateInput title="活动时间" key="11" name="12" start="start_time" end="end_time"/>
                </Search>
                <SimpleTable
                    head={head}
                    rows={this.state.rows}
                    checkbox={false}
                    ref="table"
                    getColumnStyle={this.getColumnStyle.bind(this)}>
                    <NavLink  module="704" action="0 " name="setting"
                             to="/event/manage/prize/setting/${id}">奖品信息</NavLink>
                    <a name="a"  href={"/event/view/${id}"} target="_blank" >浏览视图</a>
                </SimpleTable>
                <Paging
                    total={this.state.total}
                    page={this.state.search.page}
                    onPaginate={(page, page_size) => {
                        this.state.search.page = page;
                        this.state.search.page_size = page_size;
                        eventAction.getEventManageList(this.state.search);

                    }}
                />
            </div>
        );
    }
}
export default connect(({eventManage}) => ({eventManage}))(EventManage);
