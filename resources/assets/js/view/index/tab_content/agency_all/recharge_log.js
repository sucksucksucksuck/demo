/**
 * Created by sucksuck on 2017/9/30 17:53.
 */
import React from 'react'
import {connect} from 'react-redux'
import SimpleTable from '../../../../modules/simple_table'
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search'
import * as agencyAction from '../../../../action/agency_all/recharge_log'
import * as utilAction from '../../../../action/util'
import * as openWindow from '../../../../modules/open_window'
import {NavLink} from 'react-router-dom'
import AbsTabContent from '../abs_tab_content'
import Button from '../../../../modules/button'
import Input from '../../../../modules/input'
import {Select, Popconfirm, message} from 'antd'

const Option = Select.Option
const children = []
const select = [{id: 0, text: '代用户充值'}, {id: 1, text: '向平台充值'}]
for (let i = 0; i < select.length; i++) {
    children.push(<Option key={i} value={select[i].id}>{select[i].text}</Option>)
}
const head = [
    // {"text": "记录时间", "key": "id", className: "w80"},
    {"text": "银商账号", "key": "bus_account", className: "w100"},
    {"text": "银商ID", "key": "bus_id", className: "w100"},
    {"text": "类型", "key": "type", className: " w100"},
    {"text": "金币记录", "key": "coin_synumber", className: "w150"},
    {"text": "剩余金币", "key": "coin_number", className: "w100"},
    {"text": "充值用户", "key": "recharge_user", className: "w100"},
    {"text": "用户游戏ID", "key": "game_id", className: "w100"},
]
const module = 100
class RechargeLog extends AbsTabContent {
    constructor(props) {
        super(props, module)
        //通过属性传递state过来
        this.state = props['rechargeLog']
    }

    componentDidMount() {  //render前执行一次 以后再也不执行
        agencyAction.getList(this.state.search)
    }

    componentWillReceiveProps(props) {
        this.state = props["rechargeLog"]
        this.forceUpdate()

    }

    onSale(status) {
        this.state.search.status = status
        this.state.search.page = 1
        this.forceUpdate()
    }


    sort(order) {
        this.state.search.sort_field = order.split(" ")[0]
        this.state.search.sort = order.split(" ")[1]
        this.state.search.order = order

    }

    onItemButtonClick(item, name) {
        if (name == 'detail') {
            this.openAgencyRechaarge()
        } else if (name == "unenable" || name == "enable") {
            this.state.curId = item.id
        }
    }

    render() {
        return (
            <div className="recharge-log">
                <Search defaultValue={this.state.search}
                        category={this.state.category}
                        onSubmit={() => {
                            /*每次搜索的时候,把当前页码换为1*/
                            this.state.search.page = 1
                            /*把搜索的语句传到action给后台处理*/
                            agencyAction.getList(this.state.search)
                        }}
                        onChange={(e) => {
                            this.state.search[e.target.name] = e.target.value
                        }}>
                    <div className="item">
                        <div>银商</div>
                        <input type="text" name="title"/></div>
                    <div className="item">
                        <div>记录时间</div>
                        <input ref="start_time" className="date" type="date" name="start_time"/>-
                        <input ref="end_time"
                               type="date" className="date"
                               name="end_time"/></div>
                    <div className="item">
                        <div>类型</div>
                        <Select
                            mode="multiple"
                            size="large"
                            style={{width: '220px', height: '30px', marginLeft: '8px'}}
                            onChange={this.handleChange}
                        >
                            {children}
                        </Select></div>
                    <div className="group">
                        <button type="button" onClick={() => {
                            let end = new Date().format("yyyy-MM-dd")
                            this.state.search.start_time = end
                            this.state.search.end_time = end
                            this.refs.start_time.value = end
                            this.refs.end_time.value = end
                            this.forceUpdate()
                            agencyAction.getList(this.state.search)
                        }}>今日充值
                        </button>
                        <button type="button" onClick={() => {
                            let end = (new Date() - 1000 * 60 * 60 * 24 * 6)
                            let today = new Date().format("yyyy-MM-dd")
                            end = new Date(end).format("yyyy-MM-dd")
                            this.state.search.start_time = end
                            this.state.search.end_time = today
                            this.refs.start_time.value = end
                            this.refs.end_time.value = today
                            this.forceUpdate()
                            agencyAction.getList(this.state.search)
                        }}>7天内充值
                        </button>
                        <button type='button' onClick={() => {
                            let firstDate = new Date()
                            firstDate = firstDate.setDate(1)
                            let start = new Date(firstDate).format("yyyy-MM-dd")
                            let today = new Date().format("yyyy-MM-dd")
                            this.state.search.start_time = start
                            this.state.search.end_time = today
                            this.refs.start_time.value = start
                            this.refs.end_time.value = today
                            this.forceUpdate()
                            agencyAction.getList(this.state.search)
                        }}>本月充值
                        </button>
                    </div>
                </Search>
                <SimpleTable
                    head={head}
                    rows={this.state.rows}
                    order={this.state.search.order}
                    ref="table"
                    checkbox={false}
                    onItemButtonClick={this.onItemButtonClick.bind(this)}
                    onOrderChange={this.sort.bind(this)}>
                </SimpleTable>
                <Paging total={this.state.total}
                        page={this.state.search.page}
                        onPaginate={(page, page_size) => {
                            this.state.search.page = page
                            this.state.search.page_size = page_size
                            agencyAction.getList(this.state.search)
                        }}/>
            </div>
        )
    }
}
export default connect(({rechargeLog}) => ({rechargeLog}))(RechargeLog)