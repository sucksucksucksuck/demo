/**
 * Created by sun_3211 on 2017/3/17.
 */

import  React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom'
import AbsOrder from './abs_order';
import * as orderAction from '../../../../action/order';
import * as utilAction from '../../../../action/util';
import * as openWindow from '../../../../modules/open_window/user_all_order';
import Button from '../../../../modules/button';
import DateInput from '../../../../modules/date_input';
import Select from '../../../../modules/select';

const order_status = {
    2: "订单确认",
    3: "已发货",
    4: "已签收",
    5: "夺宝完成"
};

const entity = {
    1: "手动发货",
    3: "拒绝发货",
    4: "成功发货",
    5: "异常订单"
};

const head = [
    {"text": "商品图标", "key": "icon", "type": "img", className: "img w80"},
    {"text": "商品名字", "key": "title", className: "w400"},
    {"text": "用户", "key": "user", "type": "user", className: "user "},
    {"text": "收货人信息", "key": "pcontact", "type": "pcontact",className: "w150"},
    {"text": "购买次数", "key": "num", "type": "num", className: "w80"},
    {"text": "商品原价", "key": "amount", "type": "amount", className: "real_amount w80"},
    {"text": "订单状态", "key": "order_status", "type": "order_status", className: "w80"},
    {"text": "实物发货", "key": "payment_type", "type": "payment_type", className: "w80"},
];
const module = 202;
class Entity extends AbsOrder {
    constructor(props) {
        super(props, module);
        this.state = props['orderEntity'];
        // console.log(window.hasPermission(202,3));
    }

    componentWillReceiveProps(props) {
        this.state = props['orderEntity'];
        this.forceUpdate();
    }
    getSearch() {
        return [
            <div key="1" className="item">
                <div>用户ID</div>
                <input type="text" name="user_id"/>
            </div>,
            <div key="2" className="item">
                <div>订单编号</div>
                <input type="text" name="order_id"/>
            </div>,
            <div key="3" className="item">
                <div>价格范围</div>
                <input type="text" className="price" name="min_price"/>-
                <input type="text" className="price" name="max_price"/>
            </div>,
            <div key="4" className="item">
                <div>订单状态</div>
                <Select name="order_status" object={true} opts={order_status} defaultText="全部"/>
            </div>,
            <div key="5" className="item">
                <div>商品分类</div>
                <Select name="category_id" opts={this.state.category} value="id" text="title" defaultText="全部"/>
            </div>,
            <div key="6" className="item">
                <div>商品名字</div>
                <input type="text" name="title"/>
            </div>,
            <div key="7" className="item">
                <div>商品ID</div>
                <input type="text" name="goods_id"/>
            </div>,
            <div key="8" className="item">
                <div>商品期数</div>
                <input type="text" name="periods"/>
            </div>,
            <div key="9" className="item">
                <div>期数id</div>
                <input type="text" name="id"/>
            </div>,
            <div key="10" className="item">
                <div>收货人信息</div>
                <input type="text" name="contact_name"/>
            </div>,
            <div key="12" className="item">
                <div>发货类型</div>
                <Select name="payment_type" object={true} opts={entity} defaultText="全部"/>
            </div>,
            <DateInput title="开奖时间" key="11" name="12" start="start_time" end="end_time"/>
        ];
    }
    getColumnStyle(val, head, item) {
        if (head.type === "user") {
            return <div onMouseUp={() => {
                if (window.hasPermission(217, 0)) {
                    openWindow.userAllOrder(item.user_id);
                }
            }}>
                <div>{item.nickname}</div>
                <div>{item.user_id}</div>
            </div>;
        }
        if (head.type === "order_status") {
            return order_status[val];
        }
        if (head.type == "pcontact") {
            return (<div>
                <div>{item.contact_name}</div>
                <div>{item.contact_phone}</div>
                <div>{item.contact_id}</div>
            </div>)
        }
        if (head.type === "payment_type") {
            if (val == "5") {
                return <div className="warn">{entity[val]}</div>
            } else {
                return entity[val];
            }
        }
        if (head.type === "amount") {
            return <div>
                <div>{item.amount}</div>
                <div>{item.real_amount}</div>
            </div>;
        }
    }

    onItemButtonClick(search, item, name) {
        if (name === "delivery") {
            orderAction.deliveryPopUp("entity", item, search);
        }
        if (name === "order-status") {
            orderAction.changeOrderStatus("entity", item['id'], item['order_status'], search);
        }
        if (head.type === "amount") {
            return <div>
                <div>{item.amount}</div>
                <div>{item.real_amount}</div>
            </div>;
        }
    }

    getTableButton() {
        let btn = [
            <NavLink key="1" module="211" action="0" name="details" to="/order/entity/info/${id}">订单详情</NavLink>,
            <button key="2" module="211" action="2" compare="${order_status}==2" name="delivery">我要发货</button>,
            <button key="2" module="211" action="2" compare="${order_status}==3" name="delivery">修改发货信息</button>,
            <button key="3" module={module} action="3" name="order-status">修改订单状态</button>
        ];
        return btn;
    }

    getNavigator() {
        return (
            <div className="navigator">
                {this.getStatus()}
                <div className="button">
                    <Button>
                        <button name="1" module={module} action="2" onClick={this.complete.bind(this)}>夺宝完成</button>
                        <button name="2" module={module} action="1" onClick={this.exportChange.bind(this)}>导出</button>
                    </Button>
                    {this.state.export ? <div className="export-wrap" onClick={this.closeExport.bind(this)}/> : null}
                    {this.state.export ? <div className="export">
                        <button onClick={this.exportChecked.bind(this)}>勾选的订单</button>
                        <button onClick={this.exportBatchChange.bind(this)}>设置批量导出</button>
                    </div> : null}
                    {this.state.exportAll ? <div className="export-wrap" onClick={this.closeExport.bind(this)}/> : null}
                    {this.state.exportAll ?
                        <form onChange={this.dateChange.bind(this)}
                              className="export">
                            开奖时间
                            <div className="date">
                                <input ref="start_time" type="date" name="start_time"/>-
                                <input ref="end_time"
                                       type="date"
                                       name="end_time"/>
                            </div>
                            发货时间
                            <div className="date">
                                <input ref="deliver_start_time"
                                       type="date"
                                       name="deliver_start_time"/>-
                                <input ref="deliver_end_time"
                                       type="date"
                                       name="deliver_end_time"/>
                            </div>
                            <div className={this.state.warn ? "red" : "black"}>{this.state.warnText}</div>
                            订单状态
                            <Select name="order_status" object={true} opts={order_status} defaultText="全部"/>
                            操作人:
                            <Select name="admin_id" opts={this.state.admin_list} value="id" text="truename" defaultText="全部"/>
                            <div className="button">
                                <button type="button" onClick={this.exportOption.bind(this)}>确定
                                </button>
                                <button onClick={this.closeExport.bind(this)}>取消
                                </button>
                            </div>
                        </form> : null}
                </div>
            </div>);
    }

    complete() {
        let ids = this.refs['table'].getChecked();
        if (ids.length !== 0) {
            utilAction.confirm("是否改变订单状态为'夺宝完成',请确认", () => {
                orderAction.entityComplete({id: ids}, this.state.search);
                // orderAction.getEntity(this.state.search);
                return true;
            });
        } else {
            utilAction.prompt("请先选择订单");
        }
    }

    componentWillUnmount() {
        // orderAction.entityClear();
    }

    componentWillMount() {  //render前
        orderAction.getEntity(this.state.search);
        orderAction.getGoodsCategory();
        orderAction.adminList();
    }

    exportChecked() {
        let ids = this.refs['table'].getChecked();
        if (ids.length) {
            orderAction.entityExcel({id: ids});
        } else {
            utilAction.prompt("请先选择订单");
        }
    }

    exportOption(e) {
        e.preventDefault();
        if ((this.state.end_time && this.state.start_time) || (this.state.deliver_start_time && this.state.deliver_end_time)) {
            orderAction.entityExcel({
                end_time: this.state.end_time,
                start_time: this.state.start_time,
                deliver_start_time: this.state.deliver_start_time,
                deliver_end_time: this.state.deliver_end_time,
                order_status: this.state.order_status,
                admin_id: this.state.admin_id
            });
        } else {
            this.state.warn = true;
            this.state.warnText = "请填写完整信息";
            this.forceUpdate();
        }
    }

    exportChange() {
        this.state.export = !this.state.export;
        this.state.exportAll = this.state.exportAll ? false : null;
        this.forceUpdate();
    }

    getTableHead() {
        return head;
    }

    getSearchRows() {
        return this.state.rows;
    }

    getTotal() {
        return this.state.total;
    }

    getPage() {
        return this.state.search.page;
    }

    onSubmit() {
        this.state.search.page = 1;
        orderAction.getEntity(this.state.search);

    }


    onPage(page, pageSize) {
        this.state.search.page = page;
        this.state.search.page_size = pageSize;
        orderAction.getEntity(this.state.search);

    }


}
export default connect(({orderEntity}) => ({orderEntity}))(Entity);
