/**
 * Created by sucksuck on 2017/3/15.
 */

import React from 'react';
import {connect} from 'react-redux';
import * as goodsAction from '../../../../action/goods';
import Form from '../../../../modules/form';
import Input from '../../../../modules/input';
import * as utilAction from '../../../../action/util';

const tag = [
    {
        id: 3,
        title: "tab_hot",
        value: "tab_hot"
    },
    {
        id: 4,
        title: "tab_new",
        value: "tab_new"
    },
    {
        id: 0,
        title: "hot",
        value: "hot",
    },
    {
        id: 1,
        title: "年货",
        value: "year"
    },
    {
        id: 2,
        title: "当季新品",
        value: "new"
    }

];
module = 101;

class GoodsEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = props['goodsEdit'];
        this.reader = new FileReader();
        this.callback = false;
        this.reader.onload = function () {
            this.state.image.push(this.reader.result);
            if (this.callback) {
                this.callback();
            }
        }.bind(this);
    }

    componentDidMount() {  //render前
        if (this.props.extend == "create") {
            goodsAction.clear();

        } else {
            goodsAction.clear();
            goodsAction.getGoodsDetail({id: this.props.extend});
        }

    }

    loadFile(files, callback, index = 0) {
        if (files.length > index) {
            this.reader.readAsDataURL(files[index]);
            this.callback = this.loadFile.bind(this, files, callback, ++index);
        } else {
            this.callback = false;
            callback();
        }
    }

    componentWillMount() {  //render前

    }

    componentWillUnmount() {
        goodsAction.clear();
    }

    componentWillReceiveProps(props) {
        this.state = props["goodsEdit"];
        this.forceUpdate();
    }

    doImageAdd(e) {
        let f = e.target.files;
        let length = f.length;
        for (let i = 0; i < length; i++) {
            this.state.form.image.push(f[i]);
        }
        this.loadFile(f, this.forceUpdate.bind(this));

    }


    doCalculateAmount(type, value) {
        this.state.form[type] = value;
        if (!this.state.form['total']) {
            this.state.form["total"] = this.state.value.total;
            this.forceUpdate();
        }
        this.state.amount = this.state.form["unit_price"] * this.state.form["total"];
        if (!isNaN(this.state.amount)) {
            this.forceUpdate()
        }

    }

    onSubmit() {
        this.state.value.img_del = this.state.form.delete;
        this.state.value.image = this.state.form.image;
        let tag_result = [];
        tag.map(function (ele, index) {
            if (this.state.tag[ele.id]) {
                tag_result.push(ele.value);
            }
        }.bind(this));
        if (tag_result.length) {
            this.state.value.tag = tag_result;
        } else {
            this.state.value.tag = [];
        }
        if (this.state.form.main != -1) {
            this.state.value.icon = this.state.form.main;
        } else {
            this.state.value.icon = "";
        }
        if (this.state.value.id) {
            if (this.state.form.main == -1) {
                utilAction.prompt("请选择主图");
            } else {
                utilAction.confirm("是否确认修改?", () => {
                    goodsAction.saveGoodsInfo(this.refs['form'].getValue(this.state.value));
                    return true;
                });
            }
        } else {
            if (this.state.form.main == -1) {
                utilAction.prompt("请选择主图");
            } else {
                utilAction.confirm("是否确认保存?", () => {
                    goodsAction.createGoods(this.refs['form'].getValue(this.state.value));
                    return true;
                });
            }
        }
    }

    doImageDel(index, isDel, isRaw) {
        if (isDel) {
            let i = this.state.form['delete'].indexOf(index);
            this.state.form['delete'].splice(i, 1);
        } else if (isRaw) {
            this.state.form['delete'].push(index);
        } else {
            this.state['image'].splice(index, 1);
            this.state['form']['image'].splice(index - this.state.init_length, 1);
            if (this.state.form.main > index) {
                this.state.form.main--;
                this.forceUpdate();
                return;
            }
        }
        if (this.state.form.main === index) {
            this.state.form.main = -1;
        }
        this.forceUpdate()
    }


    getCheck(item) {
        if (this.state.tag[`${item.id}`]) {
            return "checked";
        } else {
            return "";
        }

    }

    onChecked(item) {
        this.state.tag[`${item.id}`] = !this.state.tag[`${item.id}`];
        this.forceUpdate();
    }

    render() {
        return (
            <div className="form-control goods-edit">
                <Form ref="form"
                      onSubmit={this.onSubmit.bind(this)}
                      defaultValue={this.state.value}
                      onChange={(e) => {
                          this.state.value[e.target.name] = e.target.value;
                      }}
                      save={window.hasPermission(101, 2) || window.hasPermission(101, 1)}>
                    {this.props.extend == "create" ? null :
                        <div className="group">
                            <div className="title">商品ID</div>
                            <div className="disabled">
                                {this.props.extend}
                            </div>
                        </div>
                    }
                    <div className="group">
                        <div className="title">商品标题</div>
                        <Input name="title" verify=""/>
                    </div>
                    <div className="group">
                        <div className="title">商品分类</div>
                        <div className="radio">
                            {this.props.goods.category.map(function (item, index) {
                                return (
                                    <label key={index}>
                                        <input name="category_id"
                                               type="radio"
                                               value={item.id}
                                               key={index}/>
                                        {item.title}
                                    </label>)
                            }, this)}
                        </div>
                    </div>
                    <div className="group">
                        <div className="title">商品属性</div>
                        <div className="radio">
                            <label>
                                <input name="type" type="radio" value="0"/>
                                实物商品
                            </label>
                            <label>
                                <input name="type" type="radio" value="1"/>
                                虚拟商品
                            </label>
                        </div>
                    </div>
                    <div className="group">
                        <div className="title">商品图片 (仅可以上传JPG、GIF或PNG格式的文件，图片大小不能超过2M)</div>
                        <div className="edit-img">
                            {this.state.image.map(function (img, index) {
                                let itemClass = ['item'];
                                let isDel = false;
                                let isRaw = false;
                                if (img.indexOf('data:image') !== 0) {
                                    isRaw = true;
                                }
                                if (this.state.form["delete"].indexOf(index) > -1) {
                                    if (this.state.form.main === index) {
                                        this.state.form.main = -1;
                                    }
                                    isDel = true;
                                    itemClass.push('delete');
                                }
                                if (this.state.form.main === index) {
                                    itemClass.push('main');
                                }
                                return (
                                    <div className={itemClass.join(' ')} key={index}>
                                        <img src={img}/>
                                        <div className="operation">
                                            <div
                                                onClick={this.doImageDel.bind(this, index, isDel, isRaw)}>
                                                {isDel ? "取消" : "删除"}
                                            </div>
                                            {!isDel ? (
                                                <div onClick={() => {
                                                    this.state.form.main = index;
                                                    this.forceUpdate()
                                                }}>设置主图
                                                </div>) : null}
                                        </div>
                                    </div>
                                );
                            }, this)}
                            <div className="item add">
                                <input type="file"
                                       multiple
                                       className="file"
                                       onChange={this.doImageAdd.bind(this)}/>
                            </div>
                        </div>

                    </div>
                    <div className="group">
                        <div className="title">价格设置</div>
                        <table className="amount">
                            <tbody>
                            <tr>
                                <td>价格(元)</td>
                                <td>单价(一人次)</td>
                                <td>总需人次</td>
                                <td>商品原价</td>
                            </tr>
                            <tr>
                                <td>{this.state.amount}</td>
                                <td><Input maxLength="3" name="unit_price" verify="^[\d]*$"
                                /></td>
                                <td><Input maxLength="7" name="total" verify="^[\d]*$"
                                /></td>
                                <td><Input maxLength="7" name="amount" verify="^[\d]*$"/></td>
                            </tr>
                            </tbody>
                        </table>
                        <div className="title">单次增加选择参与人次</div>
                        <table className="amount">
                            <tbody>
                            <tr>
                                {this.state.value.purchase_volume.map(function (item, index) {
                                    return <td key={index}>
                                        <Input allowZero={true} verify="^[\d]*$" maxLength="4" defaultValue={this.state.value.purchase_volume[index]}
                                               onChange={(value,e) => {
                                                   this.state.value.purchase_volume[index] = value;
                                                   this.forceUpdate();
                                               }}/>
                                    </td>
                                }.bind(this))}
                            </tr>
                            </tbody>
                        </table>
                        <div className="title">期数设置</div>
                        <table className="amount">
                            <tbody>
                            <tr>
                                <td>最小期数</td>
                                <td>最大期数</td>
                            </tr>
                            <tr>
                                <td>
                                    <Input allowZero={true} defaultValue="0" verify="" maxLength="12" name="periods"/>
                                </td>
                                <td><Input maxLength="9" name="max_periods" verify=""/></td>

                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="group">
                        <div className="title">描述</div>
                        <textarea cols="10" rows="10"
                                  name="content"/>
                    </div>
                    <div className="group">
                        <div className="title">人气商品</div>
                    </div>
                    <div className="group sort">
                        <Input maxLength="5" name="sort" verify="^[\d]*$"/>
                        数值越大越靠前
                    </div>
                    <div className="group">
                        <div className="title">标签</div>
                        <div className="check-item">
                            {tag.map(function (item, index) {
                                return <div key={index} className={"checkbox " + this.getCheck(item)}
                                            onClick={this.onChecked.bind(this, item)}>{item.title}</div>
                            }.bind(this))}

                        </div>
                    </div>
                    {this.state.value.type == 0 ? <div className="group">
                        <div className="title">商品购买链接</div>
                        <Input name="url" verify=""/>
                    </div> : null}
                </Form>

            </div>
        )
    }

}

export default connect(({goodsEdit, goods}) => ({goodsEdit, goods}))(GoodsEdit);

