/**
 * Created by s on 2017/3/6.
 */

import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import * as goodsAction from '../../../../action/goods';
import * as utilAction from '../../../../action/util';
import * as openWindow from '../../../../modules/open_window';
import {NavLink} from 'react-router-dom';
import AbsTabContent from '../abs_tab_content';
import Button from '../../../../modules/button';
const head = [
    {"text": "ID", "key": "id", className: "w50"},
    // {"text": "商品图标", "key": "icon", "type": "img", className: "img w80"},
    {"text": "商品名字", "key": "title", className: "w100"},
    {"text": "商品分类", "key": "category", className: "w100"},
    {"text": "商品原价", "key": "amount", order: "asc", className: "amount w100"},
    {"text": "单价(1人次)", "key": "unit_price", order: "desc-asc", className: "w150"},
    {"text": "总需人次", "key": "total", className: "w100"},
    {"text": "最新期数", "key": "periods", className: "w100"},
    // {"text": "发布时间", "key": "create_at", className: "date", order: "desc"}
];
const down_shelf_head = [
    {"text": "ID", "key": "id", className: "w50"},
    // {"text": "商品图标", "key": "icon", "type": "img", className: "img"},
    {"text": "商品名字", "key": "title", className: "w100"},
    {"text": "商品分类", "key": "category", className: "w100"},
    {"text": "商品原价", "key": "amount", order: "asc", className: "amount w100"},
    {"text": "单价(1人次)", "key": "unit_price", order: "desc-asc", className: "w150"},
    {"text": "总需人次", "key": "total", className: "w100"},
    {"text": "最新期数", "key": "periods", className: "w100"},
    {"text": "发布时间", "key": "create_at", className: "date", order: "desc"},
    // {"text": "下架时间", "key": "down_shelf_at", className: "date", order: "desc"}
];
const module = 100;
class Goods extends AbsTabContent {
    constructor(props) {
        super(props, module);
        //通过属性传递state过来
        this.state = props['goods'];
    }

    componentDidMount() {  //render前执行一次 以后再也不执行
        goodsAction.getGoodsList(this.state.search);
        goodsAction.getGoodsCategory();
    }

    componentWillReceiveProps(props) {
        this.state = props["goods"];
        this.forceUpdate();

    }

    exportChecked(status) {
        let ids = this.refs['table'].getChecked();
        if (ids.length) {
            this.state.export = !this.state.export;
            this.forceUpdate();
            openWindow.post(window.config.root + '/goods/search/excel',
                {id: ids, status: status}
            );

        } else {
            utilAction.prompt("请先选择商品");
        }
    }

    exportChange(e) {
        this.state.export = !this.state.export;
        this.state.exportAll = this.state.exportAll ? false : null;
        this.forceUpdate();
    }

    exportBatchChange() {
        this.state.exportAll = !this.state.exportAll;
        this.state.export = !this.state.export;
        this.forceUpdate();
    }

    exportCategory() {
        if (this.state.category_id_export) {
            openWindow.post(window.config.root + '/goods/search/excel',
                {category_id: this.state.category_id_export, status: 1}
            );
            this.state.exportAll = this.state.exportAll ? false : null;
            this.forceUpdate();
        }

    }

    onSale(status) {
        this.state.search.status = status;
        this.state.search.page = 1;
        goodsAction.getGoodsList(this.state.search);
        this.forceUpdate();
    }

    downShelves() {
        let ids = this.refs['table'].getChecked();
        if (ids.length !== 0) {
            utilAction.confirm("是否确定下架已选中的商品，下一期商品不再进行，该操作不可恢复，请确认", () => {
                goodsAction.downShelvesGoods({id: ids}, this.state.search);
                return true;
            });
        }
    }

    forceDownShelves() {
        let ids = this.refs['table'].getChecked();
        if (ids.length !== 0) {
            utilAction.confirm("是否确定强制下架已选中的商品，本期所参与的订单金额、红包、优惠券将退回原账户，该操作不可恢复，请确认", () => {
                goodsAction.forceDownShelvesGoods({id: ids}, this.state.search);
                return true;
            });
        }
    }

    sort(order) {
        this.state.search.sort_field = order.split(" ")[0];
        this.state.search.sort = order.split(" ")[1];
        this.state.search.order = order;
        goodsAction.getGoodsList(this.state.search);

    }

    closeExport() {
        this.state.export = this.state.export ? false : null;
        this.state.exportAll = this.state.exportAll ? false : null;
        this.forceUpdate();
    }

    render() {
        return (
            <div className="goods-list">
                <div className="navigator">
                    <div className="status">
                        <span className={this.state.search.status === 1 ? "active" : null}
                              onClick={this.onSale.bind(this, 1)}>出售中的商品</span>
                        <span className={this.state.search.status === 3 ? "active" : null}
                              onClick={this.onSale.bind(this, 3)}>已下架的商品</span>
                    </div>
                    {this.state.search.status === 1 ? (<div className="button">
                        <Button>
                            <NavLink key="1"
                                     name="create"
                                     action="1"
                                     module="101"
                                     to="/goods/info/create">发布商品</NavLink>
                            <button key="2" name="down"
                                    action="3"
                                    module={module}
                                    type="button"
                                    onClick={this.downShelves.bind(this)}>下架
                            </button>
                            <button key="3"

                                    name="forceDown"
                                    action="4"
                                    module={module}
                                    type="button"
                                    onClick={this.forceDownShelves.bind(this)}>强制下架
                            </button>
                            <button key="4"
                                    name="export"
                                    action="1"
                                    module={module}
                                    type="button"
                                    onClick={this.exportChange.bind(this)}>导出
                            </button>
                        </Button>
                        {this.state.export ?
                            <div className="export-wrap" onClick={this.closeExport.bind(this)}/> : null}
                        {this.state.export ? (<div className="export">
                            <button type="button" onClick={this.exportChecked.bind(this, 1)}>勾选的商品
                            </button>
                            <button type="button" onClick={this.exportBatchChange.bind(this)}>设置批量导出
                            </button>
                        </div>) : null}
                        {this.state.exportAll ?
                            <div className="export-wrap" onClick={this.closeExport.bind(this)}/> : null}
                        {this.state.exportAll ?
                            <div className="export">
                                商品分类
                                <select type="text"
                                        name="category_id_export"
                                        onChange={(e) => {
                                            this.state.category_id_export = e.target.value;
                                            this.forceUpdate();
                                        }}>
                                    <option value=" ">全部</option>
                                    {this.state.category.map(function (item, index) {
                                        return <option key={index} value={item.id}>{item.title}</option>
                                    })}
                                </select>
                                <div className="button">
                                    <button onClick={this.exportCategory.bind(this)}>确定
                                    </button>
                                    <button onClick={() => {
                                        this.state.exportAll = !this.state.exportAll;
                                        this.forceUpdate();
                                    }}>取消
                                    </button>
                                </div>
                            </div> : null}
                    </div>) : (
                        <div className="button">
                            <Button>
                                <NavLink name="create" module="101" action="1" to="/goods/info/create">发布商品</NavLink>
                                <button name="delete" module={module} action="2" onClick={() => {
                                    let ids = this.refs['table'].getChecked();
                                    if (ids.length !== 0) {
                                        utilAction.confirm("是否确定删除已选中的商品，该操作不可恢复，请确认", () => {
                                            goodsAction.deleteGoods({id: ids}, this.state.search);
                                            return true;
                                        });
                                    }
                                }}>删除
                                </button>
                                <button type="button" module={module} action="1" name="export" onClick={() => {
                                    this.state.export = !this.state.export;
                                    this.state.exportAll = this.state.exportAll ? false : null;
                                    this.forceUpdate();
                                }}>导出
                                </button>
                            </Button>
                            {this.state.export ?
                                <div className="export-wrap" onClick={this.closeExport.bind(this)}/> : null}
                            {this.state.export ? <div className="export">
                                <button type="button" onClick={this.exportChecked.bind(this, 3)}>勾选的商品</button>
                                <button type="button" onClick={this.exportBatchChange.bind(this)}>设置批量导出
                                </button>
                            </div> : null}
                            {this.state.exportAll ?
                                <div className="export-wrap" onClick={this.closeExport.bind(this)}/> : null}
                            {this.state.exportAll ?
                                <div className="export">
                                    商品分类
                                    <select type="text" name="category_id" onChange={(e) => {
                                        this.state.category_id_export = e.target.value;
                                        this.forceUpdate();
                                    }}>
                                        <option value="">全部</option>
                                        {this.state.category.map(function (item, index) {
                                            return <option key={index} value={item.id}>{item.title}</option>
                                        })}
                                    </select>
                                    <div className="button">
                                        <button type="button" onClick={() => {
                                            if (this.state.category_id_export) {
                                                openWindow.post(window.config.root + '/goods/search/excel',
                                                    {category_id: this.state.category_id_export, status: 3}
                                                );
                                            }
                                        }
                                        }>确定
                                        </button>
                                        <button type="button" onClick={() => {
                                            this.state.exportAll = !this.state.exportAll;
                                            this.forceUpdate();
                                        }}>取消
                                        </button>
                                    </div>
                                </div> : null}
                        </div>)}
                </div>
                <Search defaultValue={this.state.search}
                        category={this.state.category}
                        onSubmit={() => {
                            /*每次搜索的时候,把当前页码换为1*/
                            this.state.search.page = 1;
                            /*把搜索的语句传到action给后台处理*/
                            goodsAction.getGoodsList(this.state.search);
                        }}
                        onChange={(e) => {
                            this.state.search[e.target.name] = e.target.value;
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
                </Search>
                <SimpleTable
                    head={this.state.search.status === 1 ? head : down_shelf_head}
                    rows={this.state.rows}
                    order={this.state.search.order}
                    ref="table"
                    onItemButtonClick={goodsAction.onItemButtonClick.bind(null, this.state.category)}
                    onOrderChange={this.sort.bind(this)}>
                    <NavLink to={"/goods/info/${id}"} module="101" name="edit" action="0">商品详情</NavLink>
                    <NavLink to={"/goods/extend/${id}"} module="102" action="0" name="extend_props">扩展属性</NavLink>
                </SimpleTable>
                <Paging total={this.state.total}
                        page={this.state.search.page}
                        onPaginate={(page, page_size) => {
                            this.state.search.page = page;
                            this.state.search.page_size = page_size;
                            goodsAction.getGoodsList(this.state.search);
                        }}/>
            </div>
        )
    }
}
export default connect(({goods}) => ({goods}))(Goods);






