/**
 * Created by sucksuck on 2017/8/9.
 */

import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging';
import Search from '../../../../modules/search';
import * as messageAction from '../../../../action/message_manage/station_message';
import * as utilAction from '../../../../action/util';
import AbsTabContent from '../abs_tab_content';
import DateInput from '../../../../modules/date_input';
import Button from '../../../../modules/button';
import Select from '../../../../modules/select';

const head = [
    {"text": "标题", "key": "title",className: "w100"},
    {"text": "内容", "key": "content", className: "w400"},
    {"text": "对象", "key": "user_id","type":"user_id"},
    {"text": "系统公告", "key": "type", "type": "push"},
    {"text": "发送时间", "key": "create_at",className:"date"},
    {"text": "操作人", "key": "truename"},
];
const push = {
    "2": "否",
    "3": "是"
};

const module = 802;

class StationMessage extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['stationMessage'];
    }

    componentDidMount() {
        messageAction.getList(this.state.search);
    }

    componentWillReceiveProps(props) {
        this.state = props["stationMessage"];
        this.forceUpdate();
    }

    componentWillUnmount() {
    }

    getColumnStyle(val, head, item) {
        if (head.type == "push") {
            return push[val]
        }
        if(head.type == "user_id"){
            if(!val){
                return "全体";
            }
        }
    }

    onItemButtonClick(item, name) {
        if (name == "delete") {
            messageAction.delMessage({id: item.id}, this.state.search)
        }
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
                                    messageAction.createstationMsg(this.state.search);
                                }}
                        >新增站内信消息
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
                    <div className="item">
                        <div>系统公告:</div>
                        <Select name="type" object={true} opts={push} defaultText="全部"/>

                    </div>
                    <DateInput title="发送时间" name="12" start="create_start_time" end="create_end_time"/>
                    <div className="error">{this.state.uid_type}</div>
                </Search>
                <SimpleTable
                    head={head}
                    checkbox={false}
                    rows={this.state.rows}
                    getColumnStyle={this.getColumnStyle.bind(this)}
                    onItemButtonClick={this.onItemButtonClick.bind(this)}
                >
                    <button module={module} action="2" name="delete">删除</button>
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

export default connect(({stationMessage}) => ({stationMessage}))(StationMessage);