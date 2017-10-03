/**
 * Created by sucksuck on 2017/7/4.
 */

import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import Select from '../../../../modules/select';
import * as vipAction from '../../../../action/vip_manage/conflict_log';
import * as utilAction from '../../../../action/util';
import AbsTabContent from '../abs_tab_content';
const head = [
    {"text": "UID", "key": "user_id"},
    {"text": "操作人", "key": "truename"},
    {"text": "推广员", "key": "promoters_truename"},
    {"text": "创建时间", "key": "create_at"},
    {"text": "更新时间", "key": "update_at"},
    {"text": "状态", "key": "status", "type": "type"},
];
const type = {
    1: "无争议",
    2: "争议",
    3: "已解决"
};


const module = 1504;
class ConflictLog extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['conflictLog'];
    }

    componentWillMount() {
        vipAction.getLogList(this.state.search);
    }

    componentWillUnmount() {

    }

    componentWillReceiveProps(props) {
        this.state = props["conflictLog"];
        this.forceUpdate();

    }

    getColumnStyle(val, head, item) {
        if (head.type === "type") {
            return (<div>{type[val]}</div>)
        }
    }

    onItemButtonClick(item, name) {
        if (name == "settle") {
            utilAction.confirm("是否确定更新该冲突日志状态，此操作不可恢复！", () => {
                vipAction.settle({id: item.id}, this.state.search);
                return true;
            });
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
                        vipAction.getLogList(this.state.search);
                    }}>
                    <div className="item">
                        <div>用户UID:</div>
                        <input type="text" name="user_id"/>
                    </div>
                    <div className="item">
                        <div>操作人:</div>
                        <input type="text" name="operator"/>
                    </div>
                    <div className="item">
                        <div>状态:</div>
                        <Select name="type" object={true} opts={type} defaultText="请选择"/>
                    </div>
                </Search>
                <SimpleTable
                    head={head}
                    checkbox={false}
                    rows={this.state.rows}
                    getColumnStyle={this.getColumnStyle.bind(this)}
                    onItemButtonClick={this.onItemButtonClick.bind(this)}
                >
                    <button module={module} action="1" name="settle" compare="${status}==2">解决争议</button>
                </SimpleTable>
                <Paging
                    total={this.state.total}
                    page={this.state.search.page}
                    onPaginate={(page, page_size) => {
                        this.state.search.page = page;
                        this.state.search.page_size = page_size;
                        vipAction.getLogList(this.state.search);
                    }}
                />
            </div>
        )
    }
}
export default connect(({conflictLog}) => ({conflictLog}))(ConflictLog);