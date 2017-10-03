/**
 * Created by sucksuck on 2017/9/30 17:53.
 */
import React from 'react'
import {connect} from 'react-redux'
import SimpleTable from '../../../../modules/simple_table'
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search'
import * as agencyAction from '../../../../action/user_withdrawal/list'
import * as utilAction from '../../../../action/util'
import * as openWindow from '../../../../modules/open_window'
import {NavLink} from 'react-router-dom'
import {Select, Popconfirm, message} from 'antd'
import AbsTabContent from '../abs_tab_content'
import Button from '../../../../modules/button'
const head = [
    {"text": "用户游戏ID", "key": "id"},
    {"text": "用户昵称", "key": "title"},
    {"text": "用户状态", "key": "category"},
    {"text": "申请时间", "key": "amount", order: "desc-asc", className: "amount w100"},
    {"text": "提现到", "key": "unit_price", className: "w150"},
    {"text": "账号", "key": "total", className: "w100"},
    {"text": "累充金额", "key": "total_amout", order: "desc-asc"},
    {"text": "可提现金额", "key": "out_amount", order: "desc-asc"},
    {"text": "提现金额", "key": "out", order: "desc-asc"},
    {"text": "手续费", "key": "fee", order: "desc-asc"},
    {"text": "实际金额", "key": "asual"},
    {"text": "状态", "key": "status", className: "w100"},
]
const module = 100
class UserWithdrawalList extends AbsTabContent {
    constructor(props) {
        super(props, module)
        //通过属性传递state过来
        this.state = props['userwithdrawalList']
    }

    componentDidMount() {  //render前执行一次 以后再也不执行
        // agencyAction.getList(this.state.search)
        // agencyAction.getGoodsCategory()
    }

    componentWillReceiveProps(props) {
        this.state = props["userwithdrawalList"]
        this.forceUpdate()
    }

    sort(order) {
        this.state.search.sort_field = order.split(" ")[0]
        this.state.search.sort = order.split(" ")[1]
        this.state.search.order = order
        agencyAction.getList(this.state.search)
    }

    onItemButtonClick(item, name) {
        if (name == 'detail') {
        }

    }

    render() {
        return (
            <div className="goods-list">
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
                        <div>用户</div>
                        <input type="text" name="user"/></div>
                    <div className="item">
                        <div>支付宝</div>
                        <input type="text" name="zfb"/></div>
                    <div className="item">
                        <div>申请时间</div>
                        <input ref="start_time" className="date" type="date" name="start_time"/>-
                        <input ref="end_time"
                               type="date" className="date"
                               name="end_time"/></div>
                </Search>
                <SimpleTable
                    head={head}
                    rows={this.state.rows}
                    // order={this.state.search.order}
                    ref="table"
                    checkbox={false}
                    onItemButtonClick={this.onItemButtonClick.bind(this)}
                    onOrderChange={this.sort.bind(this)}>
                    <button name="enable" className="iconfont" title="启用"><Popconfirm placement="bottomLeft"
                                                                                      title="确定要紧用该管理员吗?"
                                                                                      onConfirm={confirm} okText="Yes"
                                                                                      cancelText="No">
                        &#xe603;
                    </Popconfirm></button>
                    <button name="unenable" className="iconfont" title="禁用"><Popconfirm placement="bottomLeft"
                                                                                        title="确定要紧用该管理员吗?"
                                                                                        onConfirm={confirm} okText="Yes"
                                                                                        cancelText="No">
                        &#xe6ca;
                    </Popconfirm></button>

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
export default connect(({userwithdrawalList}) => ({userwithdrawalList}))(UserWithdrawalList)