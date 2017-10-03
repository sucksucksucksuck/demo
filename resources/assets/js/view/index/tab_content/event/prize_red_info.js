/**
 * Created by sucksuck on 2017/5/27.
 */

import React from 'react';
import Form from'../../../../modules/form';
import Input from '../../../../modules/input';
import {connect} from 'react-redux';
import * as eventAction from '../../../../action/event/prize_red_info';
import * as utilAction from '../../../../action/util';

class RedInfo extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['prizeRedInfo'];
    }

    componentDidMount() {  //render前

    }

    componentWillMount() {  //render前
        eventAction.prizeInfoClear();
        if (this.props.id) {
            eventAction.getPrizeRedInfo({id: this.props.id})
        }

    }

    componentWillUpdate() {

    }

    componentWillUnmount() {
        eventAction.prizeInfoClear();
    }

    componentWillReceiveProps(props) {
        this.state = props['prizeRedInfo'];
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
                    <div className="title">{this.props.id ? "编辑红包奖品" : "添加红包奖品"}
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="wrap">
                    <Form
                        defaultValue={this.state}
                        onChange={(e) => {
                            this.state[e.target.name] = e.target.value;
                        }}>
                        <table>
                            <tbody>
                            {this.props.id ? <tr>
                                <td>ID</td>
                                <td className="disable">{this.state.id}
                                </td>
                            </tr> : null}
                            <tr>
                                <td>奖品标题</td>
                                <td><input name="title"/>
                                </td>
                            </tr>
                            <tr>
                                <td>个数</td>
                                <td><input name="receive_quantity"/>
                                </td>
                            </tr>
                            <tr>
                                <td>分组</td>
                                <td><input name="group"/>
                                </td>
                            </tr>
                            <tr>
                                <td>类型</td>
                                <td>
                                    <label >
                                        <input name="type"
                                               type="radio"
                                               value="3"/>
                                        红包
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <td>金额</td>
                                <td><input name="amount"/>
                                </td>
                            </tr>
                            <tr>
                                <td>使用条件(满减)</td>
                                <td><input name="use_amount"/>
                                </td>
                            </tr>
                            <tr>
                                <td>有效期(天)</td>
                                <td><input name="expired"/>
                                </td>
                            </tr>
                            <tr>
                                <td>延时生效(小时)</td>
                                <td><input name="delayed"/>
                                </td>
                            </tr>
                            <tr>
                                <td>权重</td>
                                <td><input name="chance"/>
                                </td>
                            </tr>
                            <tr>
                                <td>次数</td>
                                <td><input name="count"/>
                                </td>
                            </tr>
                            <tr>
                                <td>数量</td>
                                <td><input name="r_count"/>
                                </td>
                            </tr>
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
                        this.state.event_id = this.props.search.id;
                        this.state.red_count = this.state.r_count;
                        if (this.props.id) {
                            eventAction.setPrizeRedInfo(this.state,this.props.search);
                        } else {
                            eventAction.createPrizeRedInfo(this.state,this.props.search);
                        }
                    }}>保存
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>
            </div>
        )

    }
}
export default connect(({prizeRedInfo}) => ({prizeRedInfo}))(RedInfo);
