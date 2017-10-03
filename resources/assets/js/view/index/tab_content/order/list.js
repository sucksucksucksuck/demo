/**
 * Created by s on 2017/3/13.
 */
import React from 'react';
import OrderTable from '../../../../modules/order_table';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search'

export default class extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            page: 1,
            button: [],
            export: false,
            exportAll: false
        };
    }


    componentDidMount() {  //render前
        // authAction.goodsCategory();
        this.forceUpdate();
    }


    componentWillUpdate() {
    }

    onNavButtonClick(name) {
        if (name == "export") {
            this.state.export = !this.state.export;
            this.state.exportAll = this.state.exportAll ? false : null;
            this.forceUpdate();
        }
    }

    getNavButton(btns) {
        let button = [];
        if (btns) {
            for (let btn of btns) {
                let props = {
                    key: btn.name,
                    name: btn.name,
                    onClick: this.onNavButtonClick.bind(this, btn.name)
                };
                button.push(React.createElement("button", props, btn.text))
            }
            return button;
        }
    }


// componentWillReceiveProps(props) {
//     // this.setState(props["order"]);
//     this.forceUpdate();
// }

    render() {
        return (
            <div className="order-list">
                <div className="navigator">
                    <div className="button">
                        {this.getNavButton(this.button)}
                        {this.state.export ? <div className="export">
                            <button>勾选的产品</button>
                            <button onClick={() => {
                                this.state.exportAll = !this.state.exportAll;
                                this.state.export = !this.state.export;
                                this.forceUpdate();
                            }
                            }>设置批量导出
                            </button>
                        </div> : null}
                        {this.state.exportAll ?
                            <div className="export">
                                产品分类
                                <select type="text" name="category_id">
                                    <option value="">全部</option>
                                    {this.state.category.map(function (item, index) {
                                        return <option key={index} value={item.id}>{item.title}</option>
                                    })}
                                </select>
                                <div className="button">
                                    <button>确定</button>
                                    <button onClick={() => {
                                        this.state.exportAll = !this.state.exportAll;
                                        this.forceUpdate();
                                    }
                                    }>取消
                                    </button>
                                </div>
                            </div> : null}
                    </div>
                </div>
                <Search
                    defaultValue={this.state.search}
                    onSubmit={this.onSubmit.bind(this)}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                    }}

                >
                    <div>用户ID:<input type="text" name="user_id"/></div>
                    <div>订单编号:<input type="text" name="id"/></div>
                    {this.name == "entity" ? <div>订单状态:
                        <select type="text" name="status">
                            <option name="">全部</option>
                            <option value="1" name="1">获得奖品-待确认</option>
                            <option value="2" name="2">已确认填写收货地址</option>
                            <option value="3" name="3">已发货</option>
                            <option value="4" name="4">已签收(完成)</option>
                        </select>
                    </div> : null}

                    {this.name == "exchange" ? <div>订单状态:
                        <select type="text" name="status">
                            <option value="" name="">全部</option>
                            <option value="1" name="1">获得奖品-待确认</option>
                            <option value="2" name="2">已确认填写收货地址</option>
                            <option value="3" name="3">已发货</option>
                            <option value="4" name="4">已签收(完成)</option>
                        </select>
                    </div> : null}

                    {this.name == "fictitious" ? <div>订单状态:
                        <select type="text" name="status">
                            <option name="" value="">全部</option>
                            <option value="1" name="1">获得奖品-待确认</option>
                            <option value="2" name="2">已确认填写收货地址</option>
                            <option value="3" name="3">已发货</option>
                            <option value="4" name="4">已签收(完成)</option>
                        </select>
                    </div> : null}


                    <div>商品分类:<select type="text" name="category_id">
                        <option value="">全部</option>
                        {this.state.category.map(function (item, index) {
                            return <option key={index} value={item.id}>{item.title}</option>
                        })}
                    </select>
                    </div>
                    <div>商品名字:<input type="text" name="title"/></div>
                    <div>商品ID:<input type="text" name="goods_id"/></div>
                    <div>金额范围:<input type="text" className="price" name="min_price" placeholder="最小值"/> －<input
                        type="text" className="price" name="max_price" placeholder="最大值"/></div>
                </Search>
                <OrderTable head={this.head} rows={this.state.rows}
                            order={this.state.search.order}
                            onItemButtonClick={(item, name) => {
                                if (name == "detail") {
                                    menuActive.active({
                                        module: "OrderForm",
                                        extend: item,
                                        category: this.state.category,
                                        name: this.name
                                    });
                                }
                                if (name == "share") {
                                    menuActive.active({
                                        module: "OrderShare",
                                        extend: item,
                                        category: this.state.category,
                                        name: this.name
                                    });
                                }
                            }}
                            onOrderChange={(order) => {
                                this.state.search.order = order;
                            }}


                >
                    <button name="detail" compare={"'entity'=='" + this.name + "' && ${order_status}==1"}>详情</button>
                    <button name="2" compare={"'entity'=='" + this.name + "' && ${order_status}==1"}>核对奖品信息</button>
                    <button name="lucky" compare={"'entity'=='" + this.name + "' && ${order_status}==1"}>TA的夺宝号码
                    </button>

                    <button name="detail" compare={"'entity'=='" + this.name + "' && ${order_status}==2"}>详情</button>
                    <button name="2" compare={"'entity'=='" + this.name + "' && ${order_status}==2"}>我要发货</button>
                    <button name="lucky" compare={"'entity'=='" + this.name + "' && ${order_status}==2"}>TA的夺宝号码
                    </button>

                    <button name="detail" compare={"'entity'=='" + this.name + "' && ${order_status}==3"}>详情</button>
                    <button name="2" compare={"'entity'=='" + this.name + "' && ${order_status}==3"}>核对奖品信息</button>
                    <button name="lucky" compare={"'entity'=='" + this.name + "' && ${order_status}==3"}>TA的夺宝号码
                    </button>

                    <button name="detail" compare={"'entity'=='" + this.name + "' && ${order_status}==4"}>详情</button>
                    <button name="2" compare={"'entity'=='" + this.name + "' && ${order_status}==4"}>修改发货信息</button>
                    <button name="lucky" compare={"'entity'=='" + this.name + "' && ${order_status}==4"}>TA的夺宝号码
                    </button>
                    <button name="4" compare={"'entity'=='" + this.name + "' && ${order_status}==4"}>晒单</button>

                    <button name="lucky" compare={"'notwinning'=='" + this.name + "' && ${order_status}!=0"}>TA的夺宝号码
                    </button>

                    <button name="detail" compare={"'exchange'=='" + this.name + "' && ${order_status}!=0"}>详情</button>
                    <button name="detail" compare={"'fictitious'=='" + this.name + "' && ${order_status}!=0"}>详情
                    </button>

                    <button name="detail" compare={"'robot'=='" + this.name + "' && ${order_status}!=0"}>详情</button>
                    <button name="share" compare={"'robot'=='" + this.name + "' && ${order_status}==1"}>晒单分享</button>


                </OrderTable>

                <Paging total={this.state.total}
                        page={this.state.search.page}
                        onPaginate={this.onPage.bind(this)}/>
            </div>
        )
    }
}

