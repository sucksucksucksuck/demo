/**
 * Created by sucksuck on 2017/9/30 17:53.
 */
import React from 'react'
import {connect} from 'react-redux'
import SimpleTable from '../../../../modules/simple_table'
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search'
import * as goodsAction from '../../../../action/goods'
import * as utilAction from '../../../../action/util'
import * as openWindow from '../../../../modules/open_window'
import {NavLink} from 'react-router-dom'
import AbsTabContent from '../abs_tab_content'
import Button from '../../../../modules/button'
const head = [
    {"text": "订单ID", "key": "id", className: "w80"},
    {"text": "用户游戏ID", "key": "title", className: "w100"},
    {"text": "用户昵称", "key": "category", className: "w100"},
    {"text": "订单金额", "key": "amount", order: "desc-asc", className: "amount w100"},
    {"text": "充值金币", "key": "unit_price", order: "desc-asc", className: "w150"},
    {"text": "充值时间", "key": "total", order: "desc-asc", className: "w100"},
    {"text": "最新期数", "key": "periods", className: "date"},
]
const module = 100
class RechargeLog extends AbsTabContent {
    constructor(props) {
        super(props, module)
        //通过属性传递state过来
        this.state = props['goods']
    }

    componentDidMount() {  //render前执行一次 以后再也不执行
        goodsAction.getGoodsList(this.state.search)
        goodsAction.getGoodsCategory()
    }

    componentWillReceiveProps(props) {
        this.state = props["goods"]
        this.forceUpdate()

    }

    exportChecked(status) {
        let ids = this.refs['table'].getChecked()
        if (ids.length) {
            this.state.export = !this.state.export
            this.forceUpdate()
            openWindow.post(window.config.root + '/goods/search/excel',
                {id: ids, status: status}
            )

        } else {
            utilAction.prompt("请先选择商品")
        }
    }

    exportChange(e) {
        this.state.export = !this.state.export
        this.state.exportAll = this.state.exportAll ? false : null
        this.forceUpdate()
    }

    exportBatchChange() {
        this.state.exportAll = !this.state.exportAll
        this.state.export = !this.state.export
        this.forceUpdate()
    }

    exportCategory() {
        if (this.state.category_id_export) {
            openWindow.post(window.config.root + '/goods/search/excel',
                {category_id: this.state.category_id_export, status: 1}
            )
            this.state.exportAll = this.state.exportAll ? false : null
            this.forceUpdate()
        }

    }

    onSale(status) {
        this.state.search.status = status
        this.state.search.page = 1
        goodsAction.getGoodsList(this.state.search)
        this.forceUpdate()
    }

    downShelves() {
        let ids = this.refs['table'].getChecked()
        if (ids.length !== 0) {
            utilAction.confirm("是否确定下架已选中的商品，下一期商品不再进行，该操作不可恢复，请确认", () => {
                goodsAction.downShelvesGoods({id: ids}, this.state.search)
                return true
            })
        }
    }

    forceDownShelves() {
        let ids = this.refs['table'].getChecked()
        if (ids.length !== 0) {
            utilAction.confirm("是否确定强制下架已选中的商品，本期所参与的订单金额、红包、优惠券将退回原账户，该操作不可恢复，请确认", () => {
                goodsAction.forceDownShelvesGoods({id: ids}, this.state.search)
                return true
            })
        }
    }

    sort(order) {
        this.state.search.sort_field = order.split(" ")[0]
        this.state.search.sort = order.split(" ")[1]
        this.state.search.order = order
        goodsAction.getGoodsList(this.state.search)

    }

    closeExport() {
        this.state.export = this.state.export ? false : null
        this.state.exportAll = this.state.exportAll ? false : null
        this.forceUpdate()
    }

    render() {
        return (
            <div className="goods-list">
                <div className="navigator">
                    <div className="status">
                        <span className={this.state.search.status === 1 ? "active" : null}
                              onClick={this.onSale.bind(this, 1)}>今日充值</span>
                        <span className={this.state.search.status === 2 ? "active" : null}
                              onClick={this.onSale.bind(this, 2)}>7天内充值</span>
                        <span className={this.state.search.status === 3 ? "active" : null}
                              onClick={this.onSale.bind(this, 3)}>本月充值</span>
                    </div>
                </div>
                <Search defaultValue={this.state.search}
                        category={this.state.category}
                        onSubmit={() => {
                            /*每次搜索的时候,把当前页码换为1*/
                            this.state.search.page = 1
                            /*把搜索的语句传到action给后台处理*/
                            goodsAction.getGoodsList(this.state.search)
                        }}
                        onChange={(e) => {
                            this.state.search[e.target.name] = e.target.value
                        }}>
                    <div className="item">
                        <div>商品名字</div>
                        <input type="text" name="title"/></div>
                    <div className="item">
                        <div>商品ID</div>
                        <input type="text" name="id"/></div>
                    <div className="item">
                        <div>商品分类</div>
                        <select type="text" name="category_id">
                            <option value="">全部</option>
                            {this.state.category.map(function (item, index) {
                                return <option key={index} value={item.id}>{item.title}</option>
                            })}
                        </select>
                    </div>
                    <button>12</button>
                </Search>
                <SimpleTable
                    head={head}
                    rows={this.state.rows}
                    order={this.state.search.order}
                    ref="table"
                    checkbox={false}
                    onItemButtonClick={goodsAction.onItemButtonClick.bind(null, this.state.category)}
                    onOrderChange={this.sort.bind(this)}>
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
export default connect(({goods}) => ({goods}))(RechargeLog)