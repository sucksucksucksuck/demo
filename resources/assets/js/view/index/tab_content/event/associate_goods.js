/**
 * Created by sucksuck on 2017/6/5.
 */

import React from 'react';
import Form from'../../../../modules/form';
import Input from '../../../../modules/input';
import {connect} from 'react-redux';
import * as eventAction from '../../../../action/event/associate_goods';
import * as utilAction from '../../../../action/util';
import * as goodsAction from '../../../../action/goods';

class AssociateGoods extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['associateGoods'];
    }

    componentDidMount() {  //render前

    }

    componentWillMount() {  //render前
        // eventAction.associateGoodsList({category_id: 1});
        if (!this.state.item) {
            this.state.item = 1;
        }
        goodsAction.getGoodsCategory();
        if (this.props.event_id) {
            eventAction.getAssociateInfo({id: this.props.event_id});
        }
        eventAction.associateGoodsList({category_id: 1, status: 1});
    }

    componentWillUpdate() {

    }

    componentWillUnmount() {
        eventAction.clear();
    }

    componentWillReceiveProps(props) {
        this.state = props['associateGoods'];
        this.forceUpdate();
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    changeItem(type) {
        this.state.item = type;
        switch (type) {
            case 1:
                this.state.category_goods_checked = -1;
                this.state.good_checked = -1;
                break;
            case 2:
                this.state.category_checked = -1;
                this.state.category_goods_checked = 1;
                break;
            case 3:
                this.state.category_goods_checked = -1;
                this.state.good_checked = -1;
                this.state.category_checked = -1;
                break;
            default:
                return null;
        }
        this.forceUpdate();
    }

    onSelected(ret) {
        if (this.props.onSelected) {
            this.props.onSelected(ret);
        }
    }

    render() {
        return (
            <div className={this.props.event_id ? "associate" : "little-associate"}>
                <div className="title">关联商品
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="wrap">
                    <Form
                        defaultValue={this.state.info}
                        onChange={(e) => {
                            this.state.info[e.target.name] = e.target.value;
                        }}
                    >
                        <table className="input-table">
                            <tbody>
                            {this.props.event_id ? <tr>
                                <td>活动主标题</td>
                                <td className="disable">{this.state.info.title}
                                </td>
                            </tr> : null}
                            {this.props.event_id ? <tr>
                                <td>活动副标题</td>
                                <td className="disable">{this.state.info.describe}
                                </td>
                            </tr> : null}
                            {this.props.event_id ? <tr>
                                <td>优先级显示</td>
                                <td><Input verify="" name="sort"/>
                                </td>
                            </tr> : null}
                            {this.props.event_id ? <tr className="red">
                                <td/>
                                <td>*数字越大，显示越前</td>
                            </tr> : null}
                            <tr>
                                <td>关联链接</td>
                                <td>
                                    <div className="url-select">
                                        <div className="select-title">
                                            <div className={this.state.item == 1 ? "active" : null}
                                                 onClick={this.changeItem.bind(this, 1)}>分类链接
                                            </div>
                                            <div className={this.state.item == 2 ? "active" : null}
                                                 onClick={this.changeItem.bind(this, 2)}>商品链接
                                            </div>
                                            <div className={this.state.item == 3 ? "active" : null}
                                                 onClick={this.changeItem.bind(this, 3)}>搜索链接
                                            </div>
                                        </div>
                                        <div className="select-item">
                                            {this.state.item == 1 ?
                                                <div className="select-category">
                                                    {this.state.category.map(function (item, index) {
                                                        return (<div
                                                            className={item.id == this.state.category_checked ? "active" : null}
                                                            onClick={() => {
                                                                this.state.category_checked = item.id;
                                                                this.forceUpdate();
                                                            }
                                                            } key={index}>{item.title}</div>)
                                                    }, this)}
                                                </div> : null}
                                            {this.state.item == 2 ? <div className="select-goods">
                                                <div className="category">
                                                    {this.state.category.map(function (item, index) {
                                                        return (<div
                                                            className={item.id == this.state.category_goods_checked ? "active" : null}
                                                            onClick={() => {
                                                                this.state.category_goods_checked = item.id;
                                                                eventAction.associateGoodsList({
                                                                    category_id: this.state.category_goods_checked,
                                                                    status: 1
                                                                });
                                                                this.forceUpdate();
                                                            }
                                                            } key={index}>{item.title}</div>)
                                                    }, this)}
                                                </div>
                                                <div className="select-category">
                                                    {this.state.goods_list.map(function (item, index) {
                                                        return (<div
                                                            className={item.id == this.state.good_checked ? "active" : null}
                                                            onClick={() => {
                                                                this.state.good_checked = item.id;
                                                                this.state.good_periods_checked = item.periods;
                                                                this.forceUpdate();
                                                            }
                                                            } key={index}>{item.title}</div>)
                                                    }, this)}
                                                </div>
                                            </div> : null}
                                            {this.state.item == 3 ? <div className="select-url">
                                                关键字搜索：<input type="text" name="href"
                                                             defaultValue={this.state.search_text}
                                                             onChange={(e) => {
                                                                 this.state.search_text = e.target.value;
                                                             }
                                                             }/>
                                            </div> : null}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </Form>
                </div>
                <div className="control-button">
                    <button type="button" onClick={() => {
                        if (this.state.item == 1) {//商品分类
                            let extend = {
                                category_id: this.state.category_checked,
                                item: 1,
                                data: {
                                    type: "win",
                                    param: {
                                        url: "widget://html/new_win.html",
                                        name: "goods_sort_win",
                                        delay: 400, "bounces": false,
                                        pageParam: {
                                            script: "./lib/snatch/sort/index.js",
                                            active: this.state.category_checked
                                        }
                                    }
                                }
                            };
                            this.state.extend = JSON.stringify(extend);
                        } else if (this.state.item == 2) {//商品id
                            let extend = {
                                category_id: this.state.category_goods_checked,
                                goods_id: this.state.good_checked,
                                item: 2,
                                data: {
                                    type: "win",
                                    param: {
                                        name: "goods_detail_" + this.state.good_checked + "_" + this.state.good_periods_checked,
                                        url: "widget://html/new_win.html",
                                        vScrollBarEnabled: false,
                                        scrollEnabled: false,
                                        delay: 400,
                                        pageParam: {
                                            script: "./lib/snatch/detail/goods_detail_win.js",
                                            goods_id: this.state.good_checked
                                        }
                                    }

                                }
                            };
                            this.state.extend = JSON.stringify(extend);
                        } else if (this.state.item == 3) {//搜索商品
                            let extend = {
                                search_text: this.state.search_text,
                                item: 3,
                                data: {
                                    type: "win",
                                    param: {
                                        name: "search",
                                        url: "widget://html/new_win.html",
                                        vScrollBarEnabled: false,
                                        bgColor: "#fff",
                                        pageParam: {
                                            script: "./lib/snatch/search/search_list_win.js",
                                            keyword: this.state.search_text
                                        }
                                    }
                                }
                            };
                            this.state.extend = JSON.stringify(extend);
                        }
                        if (this.props.event_id) {
                            eventAction.setAssociateGoods({
                                id: this.props.event_id,
                                sort: this.state.info.sort,
                                extend: this.state.extend
                            }, this.props.search);
                        } else {
                            if (this.state.extend) {
                                this.onSelected(this.state);
                                this.props.onClick('cancel');
                            } else {
                                utilAction.prompt("请选择类别");
                            }
                        }
                    }}>保存
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>
            </div>
        )
    }
}
export default connect(({associateGoods}) => ({associateGoods}))(AssociateGoods);
