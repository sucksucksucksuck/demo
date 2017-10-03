/**
 * Created by sucksuck on 2017/6/7.
 */
import React from 'react';
import {connect} from 'react-redux';
import * as eventAction from '../../../../action/event/count';
import Form from "../../../../modules/form";
class EventCount extends React.Component {
    constructor(props) {
        super(props);
        // this.state = props['systemConfig'];
        /*获取数据*/
        this.state = {recharge: {}, consume: {}};


    }

    onChange(name,e) {
        this.state[name][e.target.name] = e.target.value;
        this.forceUpdate();
    }


    render() {
        return (
            <div className="event-count">
                <Form className="section">
                    <div>
                        <div className="title">充值金额</div>
                        <div>
                            <table>
                                <tbody>
                                <tr>
                                    <td>金额</td>
                                    <td><input onChange={this.onChange.bind(this,"recharge")} type="text" name="amount"
                                               value={this.state.recharge.amount || ""}/></td>
                                </tr>
                                <tr>
                                    <td/>
                                    <td className="red">*金额输入格式：单笔充值金额；需要增加的活动次数</td>
                                </tr>
                                <tr>
                                    <td>客服UID</td>
                                    <td><textarea onChange={this.onChange.bind(this,"recharge")} name="id"
                                                  value={this.state.recharge.id || ""} cols="30" rows="10"/>
                                    </td>
                                </tr>
                                <tr>
                                    <td/>
                                    <td className="red">*可进行多个UID进行增加次数， 最多输入50个UID，间隔号“；”，如：123456；123457
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            <div className="button" onClick={() => {
                                eventAction.addAmount({
                                    id:this.state.recharge.id,
                                    type:1,
                                    amount:this.state.recharge.amount
                                })
                            }}>
                                增加
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="title">消费金额</div>
                        <div>
                            <table>
                                <tbody>
                                <tr>
                                    <td>金额</td>
                                    <td><input  value={this.state.consume.amount || ""} onChange={this.onChange.bind(this,"consume")} type="text" name="amount"/></td>
                                </tr>
                                <tr>
                                    <td/>
                                    <td className="red">*金额输入格式：消费金额；需要增加的活动次数</td>
                                </tr>
                                <tr>
                                    <td>客服UID</td>
                                    <td><textarea value={this.state.consume.id || ""} onChange={this.onChange.bind(this,"consume")} name="id" cols="30"
                                                  rows="10"/></td>
                                </tr>
                                <tr>
                                    <td/>
                                    <td className="red">*可进行多个UID进行增加次数， 最多输入50个UID，间隔号“；”，如：123456；123457
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            <div className="button" onClick={() => {
                                eventAction.addAmount({
                                    id:this.state.consume.id,
                                    type:2,
                                    amount:this.state.consume.amount
                                })
                            }}>
                                增加
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        )
    }
}
export default connect(({}) => ({}))(EventCount);
