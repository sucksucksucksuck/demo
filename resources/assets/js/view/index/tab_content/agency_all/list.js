/**
 * Created by sucksuck on 2017/9/30 17:53.
 */
import React from 'react'
import {connect} from 'react-redux'
import SimpleTable from '../../../../modules/simple_table'
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search'
import * as agencyAction from '../../../../action/agency_all/list'
import * as utilAction from '../../../../action/util'
import * as openWindow from '../../../../modules/open_window'
import {NavLink} from 'react-router-dom'
import {Select, Popconfirm, message} from 'antd'
import AbsTabContent from '../abs_tab_content'
import AgencyDetails from './agency_details'

const head = [
    {"text": "银商ID", "key": "bus_id", className: "w80"},
    {"text": "银商账号", "key": "bus_account", className: "w100"},
    {"text": "金币余额", "key": "coins", className: "w100"},
    {"text": "累计平台总充值", "key": "amount", order: "desc-asc", className: "amount w100"},
    {"text": "累计用户总充值", "key": "unit_price", order: "desc-asc", className: "w150"},
    {"text": "状态", "key": "status", order: "desc-asc", className: "w100"},
]
const module = 100
class AgencyAllList extends AbsTabContent {
    constructor(props) {
        super(props, module)
        //通过属性传递state过来
        this.state = props['agencyList']
    }

    componentDidMount() {  //render前执行一次 以后再也不执行
        agencyAction.getList(this.state.search)
    }

    componentWillReceiveProps(props) {
        this.state = props["agencyList"]
        this.forceUpdate()
    }

    onSale(status) {
        this.state.search.status = status
        this.state.search.page = 1
        agencyAction.getList(this.state.search)
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
            console.log(item)
            this.openAgencyRechaarge({bus_id: item.bus_id})
        } else if (name == "unenable" || name == "enable") {
            this.state.curId = item.id
            console.log(this.state.curId)
        }
    }

    openAgencyRechaarge(id) {
        let call = function () {
            // this.state.width = '100%'
            // this.forceUpdate()
        }.bind(this)
        window.store.dispatch({
            type: "DIALOG_OPEN",
            payload: {
                key: "agencyDetails",
                slide: true,
                fade: true,
                close: true,
                view: <AgencyDetails close={call} id={id}/>
            }
        })
    }

    confirm(status, search) {
        if (status == 1) {
            agencyAction.disable({id: this.state.curId}, search)
        } else {
            agencyAction.enable({id: this.state.curId}, search)
        }
    }

    render() {
        return (
            <div className="goods-list">
                <div className="navigator">
                    <div className="status">
                        <span className={this.state.search.status === 1 ? "active" : null}
                              onClick={this.onSale.bind(this, 1)}>正常银商</span>
                        <span className={this.state.search.status === 2 ? "active" : null}
                              onClick={this.onSale.bind(this, 2)}>禁用银商</span>
                    </div>
                </div>
                <Search defaultValue={this.state.search}
                        category={this.state.category}
                        onSubmit={() => {
                            this.state.search.page = 1
                            agencyAction.getList(this.state.search)

                        }}
                        onChange={(e) => {
                            this.state.search[e.target.name] = e.target.value
                        }}>
                    <div className="item">
                        <div>银商</div>
                        <input type="text" name="title"/></div>
                    <div className="item">
                        <div>注册时间</div>
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
                    <button name="unenable" compare="${status}==1" className="iconfont" title="禁用"><Popconfirm
                        placement="bottomLeft"
                        title="确定要禁用该管理员吗?"
                        onConfirm={this.confirm.bind(this, 1, this.state.search)} okText="Yes"
                        cancelText="No">
                        &#xe863;
                    </Popconfirm></button>
                    <button name="enable" compare="${status}==2" className="iconfont" title="禁用"><Popconfirm
                        placement="bottomLeft"
                        title="确定要启用该管理员吗?"
                        onConfirm={this.confirm.bind(this, 2, this.state.search)} okText="Yes"
                        cancelText="No">
                        &#xe603;
                    </Popconfirm></button>
                    <button name="detail" className="iconfont" title="查看代理商详细信息">&#xe645;</button>
                    <NavLink to={"/agency/rechargeLog/15"} className="iconfont" name="list">&#xe738;</NavLink>
                    {/*<NavLink to={"/agency/rechargeLog/${group_id}"} name="list">推广员业绩</NavLink>*/}
                    {/*<button name="search" className="iconfont" title="查询充值流水"></button>*/}
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
export default connect(({agencyList}) => ({agencyList}))(AgencyAllList)