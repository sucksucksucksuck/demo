/**
 * Created by sucksuck on 2017/7/11.
 */
import  React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom'
import SimpleTable from '../../../../modules/simple_table';
import AbsTabContent from '../abs_tab_content';
import * as shareAction from '../../../../action/share_order/share_order_list';
import Button from '../../../../modules/button';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import Select from '../../../../modules/select';

const status = {
    "1": "隐藏",
    "2": "显示"
};

const user_type = {
    "0": "普通用户",
    "1": "机器人",
    "4": "客服"
};
const head = [
    {"text": "商品信息", "key": "title", "type": "title"},
    {"text": "用户", "key": "user", "type": "user", className: "user "},
    {"text": "晒单内容", "key": "content", "content": "num", className: "w400"},
    {"text": "晒单时间", "key": "create_at", className: "date"},
    {"text": "显示状态", "key": "status", "type": "status", className: "w60"},
];
const module = 402;
class ShareOrderList extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['shareOrderList'];
    }

    componentWillReceiveProps(props) {
        this.state = props['shareOrderList'];
        this.forceUpdate();
    }

    getColumnStyle(val, head, item) {
        if (head.type === "user") {
            return <div>
                <div>{item.nickname}</div>
                <div>{item.user_id}</div>
            </div>;
        }
        if (head.type === "status") {
            return status[val];
        }
        if (head.type === "title") {
            return <div className="title">
                <div>
                    <img src={item.icon} onError={(e) => {
                        e.target.src = window.config.root + "/image/index/index_user.png";
                    }}/>
                </div>
                <div>
                    <div>{item.title}</div>
                    <div>
                        <div>期数:{item.periods}</div>
                        <div>商品ID:{item.goods_id}</div>
                        <div>期数ID:{item.periods_id}</div>
                        <div>订单编号:{item.order_id}</div>
                    </div>
                </div>
            </div>
        }
    }


    componentWillUnmount() {
        // orderAction.entityClear();
    }

    componentWillMount() {  //render前
        shareAction.getList(this.state.search);
        shareAction.getGoodsCategory();
    }

    onItemButtonClick(search, item, name) {
        if (name == "delete") {
            shareAction.delShare({id: item.id}, search);
        }
        if (name == "hide") {
            shareAction.changeShareStatus({id: item.id, status: 1}, search);
        }
        if (name == "show") {
            shareAction.changeShareStatus({id: item.id, status: 2}, search);
        }
        if (name == "edit") {
            shareAction.createShareOrder(item, search);
        }
        if (name == "info") {
            shareAction.shareInfo(item);
        }
    }

    render() {
        return (
            <div className="share-list">
                <div className="navigator">
                    <Button>
                        <button module={module} action="3" name="delete" onClick={() => {
                            let ids = this.refs['table'].getChecked();
                            shareAction.delShare({id: ids}, this.state.search);
                        }}> 删除
                        </button>
                    </Button>
                </div>
                <Search
                    defaultValue={this.state.search}
                    onSubmit={() => {
                        this.state.search.page = 1;
                        shareAction.getList(this.state.search);
                    }}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                        this.forceUpdate();
                    }}
                >
                    <div key="2" className="item">
                        <div>订单编号</div>
                        <input type="text" name="order_id"/>
                    </div>
                    <div key="5" className="item">
                        <div>商品分类</div>
                        <Select name="category_id" opts={this.state.category} value="id" text="title" defaultText="全部"/>
                    </div>
                    <div key="6" className="item">
                        <div>商品名字</div>
                        <input type="text" name="title"/>
                    </div>
                    <div key="7" className="item">
                        <div>商品ID</div>
                        <input type="text" name="goods_id"/>
                    </div>
                    <div key="8" className="item">
                        <div>商品期数</div>
                        <input type="text" name="periods"/>
                    </div>
                    <div key="1" className="item">
                        <div>晒单内容</div>
                        <input type="text" name="content"/>
                    </div>
                    <div key="9" className="item">
                        <div>期数id</div>
                        <input type="text" name="periods_id"/>
                    </div>
                    <div key="14" className="item">
                        <div>用户类型</div>
                        <Select name="user_type" object={true} opts={user_type} defaultText="全部"/>
                    </div>
                    <div key="11" className="item">
                        <div>显示状态</div>
                        <Select name="status" object={true} opts={status} defaultText="全部"/>
                    </div>
                </Search>
                <SimpleTable
                    head={head}
                    rows={this.state.rows}
                    ref="table"
                    getColumnStyle={this.getColumnStyle.bind(this)}
                    onItemButtonClick={this.onItemButtonClick.bind(this, this.state.search)}
                >
                    <button key="1" name="info">详情</button>
                    <button key="2" module={module} action="1" name="edit">编辑</button>
                    <button key="3" module={module} action="2" name="hide" compare="${status}==2">隐藏</button>
                    <button key="3" module={module} action="2" name="show" compare="${status}==1">显示</button>
                    <button key="4" module={module} action="3" name="delete">删除</button>
                </SimpleTable>
                <Paging
                    total={this.state.total}
                    page={this.state.search.page}
                    onPaginate={(page, page_size) => {
                        this.state.search.page = page;
                        this.state.search.page_size = page_size;
                        shareAction.getList(this.state.search);
                    }}
                />
            </div>
        );
    }
}
export default connect(({shareOrderList}) => ({shareOrderList}))(ShareOrderList);
