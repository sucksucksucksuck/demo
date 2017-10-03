/**
 * Created by sucksuck on 2017/3/21.
 */


import React from 'react';
import ReactDom from 'react-dom';
import {connect} from 'react-redux';
import * as menuActive from '../../../../action/menu';
import * as authAction from '../../../../action/goods';

class OrderShare extends React.Component {
    constructor(props) {
        super(props);
        this.state = props.menu.active;
        //通过属性传递state过来
    }

    componentDidMount() {  //render前
        this.state.files = [];
        this.state.src = [];
        this.state.main = 0;
        this.state.sellPrice = 0;
        this.state.defaultValue = {
            id: "",
            title: "",
            category: "",
            amount: "",
            unit_price: "",
            total: ""
        };
        let els = this.refs['form'].elements;
        for (let i = 0; i < els.length; i++) {
            els[i].value = this.state.extend[els[i].name] || "";
            this.state.defaultValue[els[i].name] = this.state.extend[els[i].name];

        };
        this.forceUpdate();
    }

    componentWillMount() {  //render前
    }

    componentWillUpdate() {
        this.state.sellPrice = this.state.defaultValue.unit_price * this.state.defaultValue.total;

    }

    componentWillReceiveProps(props) {
    }


    render() {
        return (
            <div className="order-form">
                <div className="navigator">
                    <div className="detail">
                        <img src="xx.png"/>
                        <div className="text">
                            <div>{this.state.extend.title}</div>
                            <div>
                                <span>期数:{this.state.extend.periods}</span>
                                <span>单价:{this.state.extend.unit_price}</span>
                                <span>商品ID:{this.state.extend.goods_id}</span>
                            </div>
                        </div>
                    </div>
                    <div className="date">
                        <div>揭晓时间:{this.state.extend.lottery_at}</div>
                    </div>
                </div>
                <div className="wrap">
                    <form ref="form" method="post" onChange={(e) => {
                        this.state.defaultValue[e.target.name] = e.target.value;
                        this.forceUpdate();
                    }}>

                        <div className="item-title">晒单内容</div>
                        <textarea name="" id="" cols="300" rows="5" value=""/>
                        <div className="item-title">晒单图片</div>
                        <div className="img">
                            {this.state.src ? this.state.src.map(function (item, index) {
                                        return (<div key={index} id={index} className="goods-img">
                                            <img src={item}/>
                                            <div className="mask">
                                            <span onClick={(e) => {
                                                let ele = parseInt(e.target.parentNode.parentNode.id);
                                                this.state.src.splice(ele, 1);
                                                this.state.files.splice(ele, 1);
                                                this.forceUpdate();
                                            }}>删除</span>

                                            </div>
                                        </div>)
                                }, this): null}
                            <div className="add-img">
                                <span>+</span><input type="file" multiple name="img" className="file"
                                                     onChange={(e) => {
                                                         let f = e.target.files;
                                                         let length = f.length;
                                                         for(let i = 0; i < length; i++) {
                                                             let f1 = e.target.files[i];
                                                             let reader = new FileReader();
                                                             let _this = this;
                                                             reader.onload = function () {
                                                                 _this.state.src.push(reader.result);
                                                                 _this.forceUpdate();
                                                             };
                                                             reader.readAsDataURL(f1);
                                                             this.state.files.push(f1);
                                                             this.forceUpdate();
                                                         }
                                                     }}/>
                            </div>
                        </div>
                        <div className="msg">xxx</div>
                        <div className="button">
                            <button>保存</button>
                            <button>取消</button>
                        </div>
                    </form>
                </div>
            </div>
        )

    }
}
export default connect(({menu}) => ({menu}))(OrderShare);

