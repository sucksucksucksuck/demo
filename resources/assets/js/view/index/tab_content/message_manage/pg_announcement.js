/**
 * Created by sucksuck on 2017/8/9.
 */

import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging';
import Search from '../../../../modules/search';
import * as messageAction from '../../../../action/message_manage/pg_announcement';
import AbsTabContent from '../abs_tab_content';
import DateInput from '../../../../modules/date_input';
import Button from '../../../../modules/button';
import Select from '../../../../modules/select';

const head = [
    {"text": "标题", "key": "title", "type": "title",className:"w200"},
    {"text": "可见范围", "key": "visible", "type": "visible"},
    {"text": "发布时间", "key": "create_at",className:"date"},
    {"text": "操作人", "key": "truename"},
];

const module = 803;
const visible = {
    "1": "所有人",
    "2": "客服",
    "3": "测试",
};
class PgAnnouncement extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['pgAnnouncement'];
    }

    componentDidMount() {
        messageAction.getList(this.state.search);
    }

    componentWillReceiveProps(props) {
        this.state = props["pgAnnouncement"];
        this.forceUpdate();
    }

    componentWillUnmount() {
        // serviceManageAction.serviceManageClear();
    }

    getColumnStyle(val, head, item) {
        if (head.type == "visible") {
            return visible[val];
        }
    }

    onItemButtonClick(item, name) {
        if (name == "detail") {
            messageAction.createAnnouncement(item.id, this.state.search);
        }
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
                                    messageAction.createAnnouncement(null, this.state.search);
                                }}

                        >新增公告
                        </button>
                    </Button>
                </div>
                <Search
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                    }}
                    // defaultValue={this.state.search}
                    onSubmit={() => {
                        this.state.search.page = 1;
                        messageAction.getList(this.state.search);
                    }}>
                    <div className="item">
                        <div>标题:</div>
                        <input type="text" name="title"/>
                    </div>
                    <div className="item">
                        <div>可见范围:</div>
                        <Select name="visible" object={true} opts={visible} defaultText="全部"/>
                    </div>
                    <DateInput title="发布时间" name="12" start="start_time" end="end_time"/>
                </Search>
                <SimpleTable
                    head={head}
                    checkbox={false}
                    rows={this.state.rows}
                    getColumnStyle={this.getColumnStyle.bind(this)}
                    onItemButtonClick={this.onItemButtonClick.bind(this)}
                >
                    <button module={module} action="2" name="detail">详情</button>
                    <button module={module} action="3" name="delete">删除</button>
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

export default connect(({pgAnnouncement}) => ({pgAnnouncement}))(PgAnnouncement);