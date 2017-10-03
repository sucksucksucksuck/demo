/**
 * Created by sucksuck on 2017/9/30 17:53.
 */
import React from 'react'
import {connect} from 'react-redux'
import SimpleTable from '../../../../modules/simple_table'
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search'
import * as userAction from '../../../../action/user_manage/list'
import * as utilAction from '../../../../action/util'
import * as openWindow from '../../../../modules/open_window'
import {NavLink} from 'react-router-dom'
import {Select, Popconfirm, message} from 'antd'
import AbsTabContent from '../abs_tab_content'
import Button from '../../../../modules/button'
const head = [
    {"text": "用户游戏ID", "key": "id"},
    {"text": "用户昵称", "key": "title"},
    {"text": "状态", "key": "category"},
    {"text": "绑定支付宝", "key": "amount", className: "amount w100"},
    {"text": "总充值金额", "key": "unit_price", order: "desc-asc", className: "w150"},
    {"text": "总充值次数", "key": "total", order: "desc-asc", className: "w100"},
    {"text": "最后一次充值时间", "key": "out", order: "desc-asc"},
    {"text": "总提现额", "key": "fee", order: "desc-asc"},
    {"text": "总提现熟", "key": "asual"},
    {"text": "最后一次提现时间", "key": "status", className: "w100"},
]
const module = 100
class UserList extends AbsTabContent {
    constructor(props) {
        super(props, module)
        //通过属性传递state过来
        this.state = props['userList']
    }

    componentDidMount() {  //render前执行一次 以后再也不执行
        // goodsAction.getGoodsList(this.state.search)
        // goodsAction.getGoodsCategory()
        userAction.getList(this.state.search)
    }

    componentWillReceiveProps(props) {
        this.state = props["userList"]
        this.forceUpdate()
    }


    sort(order) {
        this.state.search.sort_field = order.split(" ")[0]
        this.state.search.sort = order.split(" ")[1]
        this.state.search.order = order
        userAction.getList(this.state.search)

    }

    onItemButtonClick(item, name) {
        if (name == 'detail') {
            this.openAgencyRechaarge()
        }

    }

    openAgencyRechaarge() {
        let call = function () {
            // this.state.width = '100%'
            // this.forceUpdate()
        }.bind(this)
        // window.store.dispatch({
        //     type: "DIALOG_OPEN",
        //     payload: {
        //         key: "agencyDetails",
        //         slide: true,
        //         fade: true,
        //         close: true,
        //         view: <AgencyDetails close={call}/>
        //     }
        // })
    }

    render() {
        return (
            <div className="goods-list">
                <Search defaultValue={this.state.search}
                        category={this.state.category}
                        onSubmit={() => {
                            this.state.search.page = 1
                            goodsAction.getGoodsList(this.state.search)
                        }}
                        onChange={(e) => {
                            this.state.search[e.target.name] = e.target.value
                        }}>
                    <div className="item">
                        <div>用户</div>
                        <input type="text" name="keyword"/></div>
                    <div className="item">
                        <div>支付宝</div>
                        <input type="text" name="alipay"/></div>
                </Search>
                <SimpleTable
                    head={head}
                    rows={this.state.rows}
                    // order={this.state.search.order}
                    ref="table"
                    checkbox={false}
                    onItemButtonClick={this.onItemButtonClick.bind(this)}
                    onOrderChange={this.sort.bind(this)}>
                    <NavLink to={"/userManage/rechargeList/${id}"} className="iconfont" name="list">&#xe738;</NavLink>
                </SimpleTable>
                <Paging total={this.state.total}
                        page={this.state.search.page}
                        onPaginate={(page, page_size) => {
                            this.state.search.page = page
                            this.state.search.page_size = page_size
                            goodsAction.getGoodsList(this.state.search)
                        }}/>
            </div>
        )
    }
}
export default connect(({userList}) => ({userList}))(UserList)