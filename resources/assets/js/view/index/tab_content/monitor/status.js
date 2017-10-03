/**
 * Created by sun_3211 on 2017/4/14.
 */

import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import * as statusAction from '../../../../action/monitor/status';
import * as goodsAction from '../../../../action/goods';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import Select from '../../../../modules/select';
import * as utilAction from '../../../../action/util';
import AbsTabContent from '../abs_tab_content';


const head = [
    {"text": "ID", "key": "id", className: "w50"},
    {"text": "商品图标", "key": "icon", "type": "img", className: "img w80"},
    {"text": "商品名字", "key": "title"},
    {"text": "商品分类", "key": "category_title","type":"category_title", className: "w100"},
    {"text": "商品原价", "key": "amount", className: "amount w80"},
    {"text": "商品售价", "key": "actual_amount", "type": "actual_amount", className: "w150"},
    {"text": "状态", "key": "lottery_type", "type": "lottery_type", className: "w100"},
    {"text": "发布时间", "key": "create_at", className: "date",}
];

const module=1302;
class GoodsStatus extends AbsTabContent {
    constructor(props) {
        super(props,module);
        //通过属性传递state过来
        this.state = props['monitorGoodsStatus'];
    }

    componentWillMount() {  //render前执行一次 以后再也不执行
        statusAction.getGoodsList(this.state.search);
        goodsAction.getGoodsCategory();

    }

    componentWillReceiveProps(props) {
        this.state = props["monitorGoodsStatus"];
        this.forceUpdate();

    }

    setGoodsStatus(status, goods_id) {

    }

    getColumnStyle(val, head, item) {
        if (head.type === "sex") {
            if (val === 1) {
                return "男";
            } else {
                return "女";
            }
        }
        if (head.type === "lottery_type") {
            if (val === 1) {
                return "全部";
            } else if (val === 2) {
                return "机器人";
            }
        }
    }

    onItemButtonClick(item, name) {
        if (name == "all") {
            statusAction.setGoodsStatus({goods_id: [item.id], status: 1},this.state.search);
            this.forceUpdate();
        }
        if (name == "robot") {
            statusAction.setGoodsStatus({goods_id: [item.id], status: 2},this.state.search);
            this.forceUpdate();
        }
    }

    render() {
        return (
            <div className="goods-list admin-list">
                <Search
                    defaultValue={this.state.search}
                    onSubmit={() => {
                        this.state.search.page = 1;
                        statusAction.getGoodsList(this.state.search);
                    }}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                    }}
                >
                    <div>
                        <input type="text" name="keyword" placeholder="商品名称或ID"/>
                        <Select name="category_id" opts={this.state.category} value="id" text="title" defaultText="全部"/>
                    </div>
                    <div className="button">
                        {window.hasPermission(module,1) ? <button className="add" type="button" onClick={() => {
                            let ids = this.refs['table'].getChecked();
                            if (ids.length !== 0) {
                                statusAction.setGoodsStatus({goods_id: ids, status: 1});
                                statusAction.getGoodsList(this.state.search);
                            } else {
                                utilAction.prompt("请先选择商品");
                            }

                        }}>全部
                        </button> : null}
                        {window.hasPermission(module,1) ?　<button className="add" type="button" onClick={() => {
                            let ids = this.refs['table'].getChecked();
                            if (ids.length !== 0) {
                                statusAction.setGoodsStatus({goods_id: ids, status: 2});
                                statusAction.getGoodsList(this.state.search);
                            } else {
                                utilAction.prompt("请先选择商品");
                            }
                        }}>机器人
                        </button> : null}
                    </div>
                </Search>
                <SimpleTable
                    head={head}
                    rows={this.state.rows}
                    order={this.state.search.order}
                    getColumnStyle={this.getColumnStyle.bind(this)}
                    ref="table"
                    onItemButtonClick={this.onItemButtonClick.bind(this)}
                >
                    <button module={module} action="1" compare="${lottery_type}==2" name="all"> 全部</button>
                    <button module={module} action="1" compare="${lottery_type}==1" name="robot"> 机器人</button>
                </SimpleTable>
                <Paging
                    total={this.state.total}
                    page={this.state.search.page}
                    onPaginate={(page, page_size) => {
                        this.state.search.page = page;
                        this.state.search.page_size = page_size;
                        statusAction.getGoodsList(this.state.search);
                    }}/>
            </div>
        )
    }
}
export default connect(({monitorGoodsStatus}) => ({monitorGoodsStatus}))(GoodsStatus);






