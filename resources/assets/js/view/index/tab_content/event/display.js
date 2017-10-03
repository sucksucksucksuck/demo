/**
 * Created by sucksuck on 2017/5/25.
 */

import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom'
import * as utilAction from '../../../../action/util';
import SimpleTable from '../../../../modules/simple_table';
import * as eventAction from '../../../../action/event/display';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import AbsTabContent from '../abs_tab_content';
import Button from '../../../../modules/button';
import DateInput from '../../../../modules/date_input';
import Select from '../../../../modules/select';

const head = [
    {"text": "ID", "key": "id", className: "w50"},
    {"text": "活动图", "key": "icon", "type": "img", className: "img"},
    {"text": "活动主标题", "key": "title", "type": "title", className: "w200"},
    {"text": "副标题", "key": "describe", "type": "describe", className: "w100"},
    {"text": "展示时间", "key": "time", "type": "time", className: "w150"},
    {"text": "栏目", "key": "type", "type": "type", className: "w150"},
    {"text": "优先级", "key": "sort", order: "desc-asc", "type": "sort", className: "w80"},
    {"text": "可见范围", "key": "visible", "type": "visible", className: "w80"},
    {"text": "状态", "key": "status", "type": "status", className: "w80"},
    {"text": "点击次数", "key": "clicks", order: "desc-asc", "type": "clicks", className: "w100"},

];
const type = {
    "1": "banner",
    "2": "最新活动",
    "3": "banner+最新活动",
};
const visible = {
    "1": "所有人",
    "2": "客服",
    "3": "测试",
};
const status = {
    "1": "正常",
    "2": "已下线",
};

const module = 701;
class EventDisplay extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['eventDisplay'];
    }

    sort(order) {
        this.state.search.sort_field = order.split(" ")[0];
        this.state.search.sort = order.split(" ")[1];
        this.state.search.order = order;
        eventAction.getEventDisplayList(this.state.search);
    }

    componentWillMount() {
        eventAction.getEventDisplayList(this.state.search);
    }

    componentWillReceiveProps(props) {
        this.state = props["eventDisplay"];
        this.forceUpdate();
    }

    getColumnStyle(val, head, item) {
        if (head.type == "time") {
            return (<div>
                {item.begin_at}
                <div>至</div>
                {item.end_at}
            </div>)
        }
        if (head.type == "type") {
            return type[val];
        }
        if (head.type == "visible") {
            return visible[val];
        }
        if (head.type == "status") {
            return status[val];
        }
    }

    onItemButtonClick(search, item, name) {
        if (name == "up") {
            eventAction.changeStatus({id: item.id, status: 1}, search);
        }
        if (name == "down") {
            eventAction.changeStatus({id: item.id, status: 2}, search);
        }
        if (name == "setting") {
            switch (item.action) {
                case 1:
                    eventAction.associateUrl(item.id, search);
                    break;
                case 2:
                    eventAction.associateEventId(item.id, search);
                    break;
                case 3:
                    eventAction.associateGoods(item.id, search);
                    break;
                case 4:
                    eventAction.associateContent(item.id, search);
                default:
                    return null;
            }
        }
    }

    render() {
        return (
            <div className="event-list">
                <div className="navigator">
                    <Button>
                        <NavLink module="703" action="1" to="/event/display/info/create" name="review"> 新增活动</NavLink>
                    </Button>
                </div>
                <Search
                    defaultValue={this.state.search}
                    onSubmit={() => {
                        this.state.search.page = 1;
                        eventAction.getEventDisplayList(this.state.search);
                    }}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                        this.forceUpdate();
                    }}
                >
                    <div className="item">
                        <div>状态</div>
                        <Select name="status" object={true} opts={status} defaultText="全部"/>
                    </div>
                    <div className="item">
                        <div>活动标题</div>
                        <input type="text" name="title"/></div>
                    <div className="item">
                        <div>栏目</div>
                        <Select name="type" object={true} opts={type} defaultText="全部"/>
                    </div>
                    <div className="item">
                        <div>ID</div>
                        <input type="text" name="id"/></div>
                    <div className="item">
                        <div>可见范围</div>
                        <Select name="visible" object={true} opts={visible} defaultText="全部"/>
                    </div>
                    <DateInput title="展示时间" name="12" start="create_start_time" end="create_end_time"/>
                </Search>
                <SimpleTable
                    head={head}
                    rows={this.state.rows}
                    checkbox={false}
                    ref="table"
                    order={this.state.search.order}
                    getColumnStyle={this.getColumnStyle.bind(this)}
                    onItemButtonClick={this.onItemButtonClick.bind(this, this.state.search)}
                    onOrderChange={this.sort.bind(this)}>
                    <NavLink module="703" action="0" key="1" to="/event/display/info/${id}" name="config">
                        活动设置</NavLink>
                    <button module="703" action="2" key="2" name="setting">修改</button>
                    <button module={module} action="1" key="3" name="down" compare="${status}==1">下线</button>
                    <button module={module} action="1" key="3" name="up" compare="${status}==2">上线</button>
                    <a name="1" href={"/app_event/${id}"} target="_blank">浏览视图</a>
                    {/*<button key="4" name="review">预览</button>*/}
                </SimpleTable>
                <Paging
                    total={this.state.total}
                    page={this.state.search.page}
                    onPaginate={(page, page_size) => {
                        this.state.search.page = page;
                        this.state.search.page_size = page_size;
                        eventAction.getEventDisplayList(this.state.search);
                    }}
                />
            </div>
        );
    }
}
export default connect(({eventDisplay}) => ({eventDisplay}))(EventDisplay);
