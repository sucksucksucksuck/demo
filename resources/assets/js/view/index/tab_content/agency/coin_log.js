/**
 * Created by sucksuck on 2017/9/30 17:53.
 */
import React from 'react'
import {connect} from 'react-redux'
import SimpleTable from '../../../../modules/simple_table'
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search'
import * as coinAction from '../../../../action/coin'
import * as utilAction from '../../../../action/util'
import * as openWindow from '../../../../modules/open_window'
import {NavLink} from 'react-router-dom'
import AbsTabContent from '../abs_tab_content'
import Button from '../../../../modules/button'
import AgencyRecharge from './agency_recharge'
import {Select, Popconfirm, message} from 'antd'
const Option = Select.Option
const children = []
const select = [{id: 0, text: '代用户充值'}, {id: 1, text: '向平台充值'}]
for (let i = 0; i < select.length; i++) {
    children.push(<Option key={i} value={select[i].id}>{select[i].text}</Option>)
}

const head = [
    {"text": "记录时间", "key": "id", order: "desc-asc",},
    {"text": "类型", "key": "title"},
    {"text": "金币记录", "key": "category"},
    {"text": "剩余金币", "key": "amount",},
]
const module = 100

class CoinLog extends AbsTabContent {
    constructor(props) {
        super(props, module)
        //通过属性传递state过来
        this.state = props['coinLog']
    }

    componentDidMount() {  //render前执行一次 以后再也不执行
        this.openAgencyRechaarge()
    }

    componentWillReceiveProps(props) {
        this.state = props["coinLog"]
        this.forceUpdate()
    }


    sort(order) {
        this.state.search.sort_field = order.split(" ")[0]
        this.state.search.sort = order.split(" ")[1]
        this.state.search.order = order
    }

    handleChange(value) {
    }

    onItemButtonClick(item, name) {
        if (name == 'detail') {
            // this.state.width = '57%'
            this.forceUpdate()
            this.openAgencyRechaarge()
        }

    }

    openAgencyRechaarge() {
        let call = function () {
            this.state.width = '100%'
            this.forceUpdate()
        }.bind(this)
        window.store.dispatch({
            type: "DIALOG_OPEN",
            payload: {
                key: "agencyRecharge",
                slide: true,
                fade: true,
                close: true,
                view: <AgencyRecharge close={call}/>
            }
        })
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
                            coinAction.getCoinLog(this.state.search)
                        }}
                        onChange={(e) => {
                            this.state.search[e.target.name] = e.target.value
                        }}>
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
                </Search>
                <SimpleTable
                    head={head}
                    rows={this.state.rows}
                    order={this.state.search.order}
                    ref="table"
                    width={this.state.width}
                    checkbox={false}
                    onItemButtonClick={this.onItemButtonClick.bind(this)}
                    onOrderChange={this.sort.bind(this)}>
                    <button name="detail" className="iconfont" title="查询详情">&#xe645;</button>
                </SimpleTable>
                <Paging total={this.state.total}
                        page={this.state.search.page}
                        width={this.state.width}
                        onPaginate={(page, page_size) => {
                            this.state.search.page = page
                            this.state.search.page_size = page_size
                            coinAction.getCoinLog(this.state.search)
                        }}/>
            </div>
        )
    }
}
export default connect(({coinLog}) => ({coinLog}))(CoinLog)