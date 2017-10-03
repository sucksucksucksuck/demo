/**
 * Created by sucksuck on 2017/9/30 17:53.
 */
import React from 'react'
import {connect} from 'react-redux'
import SimpleTable from '../../../../modules/simple_table'
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search'
import * as agencyAction from '../../../../action/user_manage/rechargeList'
import * as utilAction from '../../../../action/util'
import * as openWindow from '../../../../modules/open_window'
import {NavLink} from 'react-router-dom'
import AbsTabContent from '../abs_tab_content'
import Button from '../../../../modules/button'
import {Select, Popconfirm, message} from 'antd'

const head = [
    {"text": "订单号", "key": "id", className: "w80"},
    {"text": "类型", "key": "title", className: "w100"},
    {"text": "充值渠道", "key": "category", className: "w100"},
    {"text": "付款/提现时间", "key": "amount", order: "desc-asc", className: "amount w100"},
    {"text": "充值用户", "key": "unit_price", className: "w150"},
    {"text": "充值/体现前金币", "key": "total", order: "desc-asc", className: "w100"},
    {"text": "充值/提现金额", "key": "periods", order: "desc-asc", className: "date"},
    {"text": "充值/提现金币", "key": "periods", order: "desc-asc", className: "date"},
    {"text": "充值/提现后金币", "key": "periods", order: "desc-asc", className: "date"},
]
const Option = Select.Option
const children = []
const children2 = []
const select = [{id: 0, text: '支付宝'}, {id: 1, text: '微信'}, {id: 2, text: '银联'}]
for (let i = 0; i < select.length; i++) {
    children.push(<Option key={i} value={select[i].id}>{select[i].text}</Option>)
}
const select2 = [{id: 0, text: '直充'}, {id: 1, text: '代充'}, {id: 2, text: '提现'}]
for (let i = 0; i < select2.length; i++) {
    children2.push(<Option key={i} value={select2[i].id}>{select2[i].text}</Option>)
}
const module = 100
class UserRechargeList extends AbsTabContent {
    constructor(props) {
        super(props, module)
        //通过属性传递state过来
        this.state = props['userRechargeList']
    }

    componentDidMount() {  //render前执行一次 以后再也不执行
        // goodsAction.getGoodsList(this.state.search)
        // goodsAction.getGoodsCategory()
    }

    componentWillReceiveProps(props) {
        this.state = props["userRechargeList"]
        this.forceUpdate()

    }

    sort(order) {
        this.state.search.sort_field = order.split(" ")[0]
        this.state.search.sort = order.split(" ")[1]
        this.state.search.order = order
        // agencyAction.getGoodsList(this.state.search)

    }

    closeExport() {
        this.state.export = this.state.export ? false : null
        this.state.exportAll = this.state.exportAll ? false : null
        this.forceUpdate()
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
                            // goodsAction.getGoodsList(this.state.search)
                        }}
                        onChange={(e) => {
                            this.state.search[e.target.name] = e.target.value
                        }}>
                    <div className="item">
                        <div>用户</div>
                        <input type="text" name="title"/></div>
                    <div className="item">
                        <div>付款时间</div>
                        <input ref="start_time" className="date" type="date" name="start_time"/>-
                        <input ref="end_time"
                               type="date" className="date"
                               name="end_time"/></div>
                    <div className="item">
                        <div>充值渠道</div>
                        <Select
                            mode="multiple"
                            size="large"
                            style={{width: '220px', height: '30px', marginLeft: '8px'}}
                            onChange={this.handleChange}
                        >
                            {children}
                        </Select></div>
                    <div className="item">
                        <div>类型</div>
                        <Select
                            mode="multiple"
                            size="large"
                            style={{width: '220px', height: '30px', marginLeft: '8px'}}
                            onChange={this.handleChange}
                        >
                            {children2}
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
                    onItemButtonClick={agencyAction.getList.bind(null, this.state.category)}
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
export default connect(({userRechargeList}) => ({userRechargeList}))(UserRechargeList)