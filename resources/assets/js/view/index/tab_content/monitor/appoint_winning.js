/**
 * Created by sucksuck on 2017/5/5.
 */
import AbsTabContent from '../abs_tab_content';
import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import * as winningAction from '../../../../action/monitor/appoint_winning'
import DateInput from '../../../../modules/date_input';

const head = [
    {"text": "管理员账号", "key": "account", },
    {"text": "类型", "key": "operation","type":"type" },
    {"text": "操作时间", "key": "create_at", },
    {"text": "指定中奖UID", "key": "user_id", },
    {"text": "期数ID", "key": "periods_id",},
];
const type = {
    2: "指定中奖",
    1: "取消指定",
};
const module = 1304;
class AppointWinning extends AbsTabContent{
    constructor(props){
        super(props,module);
        this.state = props['monitorAppointWinning'];
    }
    componentDidMount(){
        winningAction.getRecordsList()
    }
    componentWillReceiveProps(props) {
        this.state = props["monitorAppointWinning"];
        this.forceUpdate();
    }
    getColumnStyle(val, head, item) {
        if(head.type === "type") {
            return (<div className={`type_${val}`}>{type[val]}</div>)
        }

    }

    render(){
        return(
            <div className="appoint-winning">
                <Search
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                    }}
                        onSubmit={() => {
                            this.state.search.page = 1;
                            winningAction.getRecordsList(this.state.search);
                        }}
                >
                    <div className="item">
                        <div >类型:</div>
                        <select type="text" name="operation">
                            <option value="">全部</option>
                            <option value="1">指定中奖</option>
                            <option value="2">取消指定</option>
                        </select>
                    </div>
                    <div className="item">
                        <div id="account">管理员账号:</div>
                        <input type="text" name="admin_account"/></div>
                    <div className="item">
                        <div>期数ID:</div>
                        <input type="text" name="periods_id"/>
                    </div>

                    <div className="item">
                        <div id="uid">中奖者UID:</div>
                        <input type="text" name="user_id"/>
                    </div>
                    <DateInput title="操作时间" noWarn={true} name="12" start="start_time" end="end_time"/>
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
                        winningAction.getRecordsList(this.state.search);
                    }}
                />
            </div>
        )
    }
}
export default connect(({monitorAppointWinning}) => ({monitorAppointWinning}))(AppointWinning);