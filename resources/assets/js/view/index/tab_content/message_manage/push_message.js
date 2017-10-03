/**
 * Created by sucksuck on 2017/8/9.
 */

import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging';
import Search from '../../../../modules/search';
import * as utilAction from '../../../../action/util';
import AbsTabContent from '../abs_tab_content';
import DateInput from '../../../../modules/date_input';
import Button from '../../../../modules/button';
import * as messageAction from '../../../../action/message_manage/push_message';

const head = [
    {"text": "标题", "key": "title"},
    {"text": "推送内容", "key": "content", className: "w400"},
    {"text": "关联活动", "key": "event_title", "type": "event_title"},
    {"text": "对象", "key": "user_id","type":"user_id"},
    {"text": "推送时间", "key": "create_at", className: "date"},
    {"text": "操作人", "key": "truename", "type": "truename"},
];

const module = 801;

class PushMessage extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['pushMessage'];
    }

    componentDidMount() {
        messageAction.getList(this.state.search);
    }

    componentWillReceiveProps(props) {
        this.state = props["pushMessage"];
        this.forceUpdate();
    }

    componentWillUnmount() {
        // serviceManageAction.serviceManageClear();
    }

    getColumnStyle(val, head, item) {
        if (head.type == "event_title") {
            if (!item.event_id) {
                return "无";
            }
        }
        if(head.type == "user_id"){
            if(!val){
               return "全体";
            }
        }
    }

    onItemButtonClick(item, name) {


    }


    render() {
        return (
            <div className="share-list">
                <div className="navigator">
                    <Button>
                        <button key="1"
                                name="change"
                                module={module}
                                action="1"
                                onClick={() => {
                                    messageAction.createPushMsg(this.state.search);
                                }}
                        >新增推送消息
                        </button>
                    </Button>
                </div>
                <Search
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                    }}
                    defaultValue={this.state.search}
                    onSubmit={() => {
                        this.state.search.page = 1;
                        messageAction.getList(this.state.search);
                    }}>
                    <div className="item">
                        <div>内容:</div>
                        <input type="text" name="content"/>
                    </div>
                    <div className="item">
                        <div>对象:</div>
                        <input type="text" name="user_id"/>
                    </div>
                    <DateInput title="推送时间" name="12" start="start_time" end="end_time"/>
                </Search>
                <SimpleTable
                    head={head}
                    checkbox={false}
                    rows={this.state.rows}
                    getColumnStyle={this.getColumnStyle.bind(this)}
                    onItemButtonClick={this.onItemButtonClick.bind(this)}
                >
                </SimpleTable>
                <Paging
                    total={this.state.total}
                    page={this.state.search.page}
                    onPaginate={(page, page_size) => {
                        this.state.search.page = page;
                        this.state.search.page_size = page_size;
                        messageAction.getList(this.state.search);
                    }}
                />

            </div>
        )
    }
}

export default connect(({pushMessage}) => ({pushMessage}))(PushMessage);