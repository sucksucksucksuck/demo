/**
 * Created by sucksuck on 2017/3/21.
 */

import React from 'react';
import {connect} from 'react-redux';
import * as utilAction from '../../../../action/util';
import * as menuActive from '../../../../action/menu';
import * as goodsAction from '../../../../action/goods';
import Input from '../../../../modules/input';
import Button from '../../../../modules/button';

class GoodsAttribute extends React.Component {
    constructor(props) {
        super(props);
        this.state = props['goodsAttribute'];
    }

    componentDidMount() {  //render前


    }

    componentWillMount() {  //render前
        goodsAction.getExtend({id: this.props.extend});
        this.forceUpdate();
    }

    componentWillReceiveProps(props) {
        this.state = props['goodsAttribute'];
        // console.log(this.state);
        if (this.state.robot_buy === 1) {
            this.state.switch = true;
        } else {
            this.state.switch = false;
        }
        this.forceUpdate();
    }

    addModel() {
        // console.log(this.state);
        this.state.model.push({max: 0, min: 0, chance: 0});
        this.forceUpdate();
    }

    addTime() {
        this.state.time.push({end: 0, begin: 0, interval: [0, 0]});
        this.forceUpdate();
    }

    delTime(e) {
        let id = e.target.parentNode.id;
        if (this.state.time.length > 1) {
            this.state.time.splice(id, 1);
            this.forceUpdate();
        } else {
            utilAction.prompt("时间间隔模式至少有一条数据!");
        }

    }

    delRow(e) {
        let id = e.target.parentNode.id;
        if (this.state.model.length > 1) {
            this.state.model.splice(id, 1);
            this.forceUpdate();
        } else {
            utilAction.prompt("机器人至少有一条数据!");
        }
    }

    doSubmit(e) {
        e.preventDefault();
        this.state.robot_buy_setting = {};
        // console.log(123, this.state.robot_buy_setting);
        this.state.robot_buy = this.state.switch ? 1 : 0;
        this.state.robot_buy_setting.model = this.state.model;
        this.state.robot_buy_setting.time = this.state.time;
        this.forceUpdate();
        let json = JSON.stringify(this.state.robot_buy_setting);
        this.state.robot_buy_setting = json;
        this.forceUpdate();
        utilAction.confirm("是否确认修改?", () => {
            goodsAction.setExtend(this.state);
            return true;
        });
    }

    upShelves() {
        this.state.robot_buy_setting = {};
        this.state.robot_buy = this.state.switch ? 1 : 0;
        this.state.robot_buy_setting.model = this.state.model;
        this.state.robot_buy_setting.time = this.state.time;
        this.state.status = 1;
        this.forceUpdate();
        let json = JSON.stringify(this.state.robot_buy_setting);
        this.state.robot_buy_setting = json;
        this.forceUpdate();
        utilAction.confirm("是否确认修改?", () => {
            goodsAction.setExtend(this.state);
            return true;
        });
    }

    render() {
        return (
            <div className="extend-form">
                <div className="info">
                    <div className="detail">
                        <img src={this.state.icon} onError={(e) => {
                            e.target.src = window.config.root + "/image/index/index_user.png";
                        }}/>
                        <div className="text">
                            <div>{this.state.title}</div>
                            <div>
                                <span>商品ID:{this.state.id}</span>
                                <span>总需人次:{this.state.total}</span>
                            </div>
                        </div>
                    </div>
                    <div className="date">
                        <div>发布时间</div>
                        <div>{this.state.create_at}</div>
                    </div>
                </div>
                <div className="wrap">
                    <form ref="form" method="post"
                          onChange={(e) => {
                              this.state[e.target.name] = e.target.value;
                              this.forceUpdate();
                          }}>
                        <div className="item-title">开启机器人</div>
                        <div className={this.state.switch ? "open" : "close"}
                             onClick={() => {
                                 this.state.switch = !this.state.switch;
                                 this.forceUpdate();
                             }}>
                            <div className="switch"/>
                        </div>
                        {this.state.switch ? <div className="content">
                            <div>
                                <div className="item-title">中奖模式</div>
                                <div className="radio">
                                    <label><input name="lottery_type"
                                                  type="radio" value="1"
                                                  checked={this.state.lottery_type == 1}
                                    />全部可中</label>
                                    <label><input name="lottery_type"
                                                  type="radio" value="2"
                                                  checked={this.state.lottery_type == 2}
                                    />机器人可中</label>
                                </div>
                            </div>
                            <div>
                                <div className="item-title">机器人模式</div>
                                <table className="amount-item">
                                    <thead>
                                    <tr>
                                        <td>模式</td>
                                        <td>单个机器人最少购买(人次)</td>
                                        <td>单个机器人最多购买(人次)</td>
                                        <td>购买概率(%)</td>
                                        <td>操作</td>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {this.state.model ? this.state.model.map(function (item, index) {
                                        return (
                                            <tr ref={"model" + index} key={index} id={index}
                                                onChange={(e) => {
                                                    let id = e.target.parentNode.parentNode.id;
                                                    let name = e.target.name;
                                                    let value = !isNaN(parseInt(e.target.value)) ? parseInt(e.target.value) : 0;
                                                    this.state.model[id][name] = value;
                                                    this.forceUpdate();
                                                }}
                                            >
                                                <td>模式{index + 1}</td>
                                                <td><input type="text"
                                                           name="min"
                                                           value={this.state.model[index].min}
                                                />
                                                </td>
                                                <td><input type="text" name="max"
                                                           value={this.state.model[index].max}
                                                />
                                                </td>
                                                <td><input type="text" name="chance"
                                                           value={this.state.model[index].chance}
                                                />
                                                </td>
                                                <td className="btn" onClick={this.delRow.bind(this)}>删除</td>
                                            </tr>
                                        )
                                    }, this) : null}

                                    <tr >
                                        <td className="btn" colSpan="99" onClick={this.addModel.bind(this)}>添加模式</td>
                                    </tr>
                                    </tbody>
                                </table>
                                <div>默认最少有一种模式，购买概率总和需设置为100%</div>
                            </div>
                            <div>
                                <div className="item-title">时间间隔设置</div>
                                <table className="amount-item">
                                    <thead>
                                    <tr>
                                        <td>时段</td>
                                        <td>时间段</td>
                                        <td>购买间隔</td>
                                        <td>操作</td>
                                    </tr>
                                    </thead>
                                    <tbody>

                                    {this.state.time ? this.state.time.map(function (item, index) {
                                        return ( <tr className="time"
                                                     key={index}
                                                     id={index}
                                                     onChange={(e) => {
                                                         let id = e.target.parentNode.parentNode.id;
                                                         let name = e.target.name;
                                                         let value = !isNaN(parseInt(e.target.value)) ? parseInt(e.target.value) : 0;
                                                         if (e.target.name === "interval0") {
                                                             this.state.time[id].interval[0] = value;
                                                         } else if (e.target.name === "interval1") {
                                                             this.state.time[id].interval[1] = value;
                                                         } else if (e.target.name == "end" || e.target.name == "begin") {
                                                             this.state.time[id][name] = value;
                                                         }
                                                         this.forceUpdate();
                                                     }}>
                                            <td>时段{index + 1}</td>
                                            <td><input type="text"
                                                       name="begin"
                                                       value={this.state.time[index].begin}
                                            />
                                                - <input type="text" name="end"
                                                         value={this.state.time[index].end}

                                                />
                                            </td>
                                            <td><input type="text"
                                                       name="interval0"
                                                       value={this.state.time[index].interval[0]}


                                            /> - <input type="text"
                                                        name="interval1"
                                                        value={this.state.time[index].interval[1]}


                                            /></td>
                                            <td className="btn" onClick={this.delTime.bind(this)}>删除</td>
                                        </tr>)
                                    }, this) : null}
                                    <tr >
                                        <td className="btn" colSpan="99" onClick={this.addTime.bind(this)}>添加模式</td>
                                    </tr>
                                    </tbody>
                                </table>
                                <div>默认最少有一个时间段设置，时间格式为24小时；如果设置的时间段冲突或没设置的时间段则以最后一个时间段执行。</div>
                            </div>
                        </div> : null}
                    </form>
                </div>
                    <Button>
                        <button
                            name="1"
                            module="102"
                            action="1"
                            type="button" onClick={this.upShelves.bind(this)}>上架
                        </button>
                        <button
                            name="2"
                            module="102"
                            action="1"
                            type="button"
                            onClick={this.doSubmit.bind(this)}>保存
                        </button>
                        <button  name="3" type="button" onClick={(e) => {
                            e.preventDefault();
                            window.history.back();
                        }}>取消
                        </button>
                    </Button>
            </div>
        )

    }
}
export default connect(({goodsAttribute}) => ({goodsAttribute}))(GoodsAttribute);

