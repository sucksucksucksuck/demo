/**
 * Created by sucksuck on 2017/7/4.
 */

import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import Select from '../../../../modules/select';
import * as vipAction from '../../../../action/vip_manage/operation_log';
import AbsTabContent from '../abs_tab_content';
const head = [
    {"text": "UID", "key": "user_id"},
    {"text": "操作人", "key": "truename"},
    {"text": "操作", "key": "msg"},
    {"text": "时间", "key": "create_at"},
];
const type = {
    1: "未处理",
    2: "已处理"
};
const operation_type = {
    "6": "添加客户",
    "7": "修改客户",
    "8": "删除客户",
    "9": "修改备注",
    "12": "冲突日志"
};

const module = 1505;
class OperationLog extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['operationLog'];
    }

    componentDidMount() {
        vipAction.getLogList(this.state.search);
    }


    componentWillReceiveProps(props) {
        this.state = props["operationLog"];
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
                        vipAction.getLogList(this.state.search);
                    }}>
                    <div className="item">
                        <div>用户UID:</div>
                        <input type="text" name="user_id"/>
                    </div>
                    <div className="item">
                        <div>操作人:</div>
                        <input type="text" name="operation"/>
                    </div>
                    <div className="item">
                        <div>操作:</div>
                        <Select name="type" object={true} opts={operation_type} defaultText="请选择"/>
                    </div>
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
                        vipAction.getLogList(this.state.search);
                    }}
                />
            </div>
        )
    }
}
export default connect(({operationLog}) => ({operationLog}))(OperationLog);