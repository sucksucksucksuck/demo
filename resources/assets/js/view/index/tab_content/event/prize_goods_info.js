/**
 * Created by sucksuck on 2017/5/27.
 */

import React from 'react';
import Form from'../../../../modules/form';
import Input from '../../../../modules/input';
import {connect} from 'react-redux';
import * as eventAction from '../../../../action/event/prize_goods_info';
import * as utilAction from '../../../../action/util';

class GoodsInfo extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['prizeGoodsInfo'];
        console.log(this);
    }

    componentDidMount() {  //render前

    }

    componentWillMount() {  //render前
        if (this.props.id) {
            eventAction.getPrizeGoodsInfo({id: this.props.id});
        }
    }

    componentWillUpdate() {

    }

    componentWillUnmount() {
        eventAction.prizeInfoClear();
    }

    componentWillReceiveProps(props) {
        this.state = props['prizeGoodsInfo'];
        this.forceUpdate();
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    render() {
        return (
            <div className="dialog-form">
                <div className="title">{this.props.id ? "编辑奖品" : "添加奖品"}
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="wrap">
                    <Form
                        defaultValue={this.state}
                        onChange={(e) => {
                            this.state[e.target.name] = e.target.value;
                        }}
                    >
                        <table>
                            <tbody>
                            {this.props.id ? <tr>
                                <td>ID</td>
                                <td className="disable">{this.state.id}
                                </td>
                            </tr> : null}

                            <tr>
                                <td>奖品标题</td>
                                <td><Input verify="" name="title"/>
                                </td>
                            </tr>
                            <tr >
                                <td>类型</td>
                                <td>
                                    <label onClick={() => {
                                        this.state.type = "1";
                                        this.state.prize = "";
                                        this.forceUpdate();
                                    }}>
                                        <input name="type"
                                               type="radio"
                                               value="1"/>
                                        实物
                                    </label>
                                    <label onClick={() => {
                                        this.state.type = "2";
                                        this.state.prize = "";
                                        this.forceUpdate();


                                    }}>
                                        <input name="type"
                                               type="radio"
                                               value="2"/>
                                        虚拟
                                    </label>
                                    <label onClick={() => {
                                        this.state.type = "4";
                                        this.forceUpdate();

                                    }}>
                                        <input name="type"
                                               type="radio"
                                               value="4"/>
                                        盘古币
                                    </label>
                                    <label onClick={() => {
                                        this.state.type = "5";
                                        this.forceUpdate();

                                    }}>
                                        <input name="type"
                                               type="radio"
                                               value="5"/>
                                        积分
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <td>分组</td>
                                <td><Input verify="" name="group"/>
                                </td>
                            </tr>
                            <tr>
                                <td>权重</td>
                                <td><Input verify="" name="chance"/>
                                </td>
                            </tr>
                            <tr>
                                <td>次数</td>
                                <td><Input verify="" name="count"/>
                                </td>
                            </tr>
                            {this.state.type == 4 || this.state.type == 5 ? <tr>
                                <td>金额</td>
                                <td><Input verify="" name="prize"/>
                                </td>
                            </tr> : null}

                            <tr className="red">
                                <td/>
                                <td>*为空表示无限</td>
                            </tr>
                            </tbody>
                        </table>
                    </Form>
                </div>
                <div className="button">
                    <button type="button" onClick={() => {
                        if (this.props.id) {
                            this.state.event_id = this.props.search.id;
                            eventAction.setPrizeGoodsInfo(this.state, this.props.search);
                        } else {
                            this.state.event_id = this.props.search.id;
                            eventAction.createPrizeGoodsInfo(this.state, this.props.search);
                        }
                    }}>保存
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>
            </div>
        )

    }
}
export default connect(({prizeGoodsInfo}) => ({prizeGoodsInfo}))(GoodsInfo);
