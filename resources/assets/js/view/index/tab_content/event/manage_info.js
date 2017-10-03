/**
 * Created by sucksuck on 2017/6/5.
 */

import React from 'react';
import Form from'../../../../modules/form';
import Input from '../../../../modules/input';
import {connect} from 'react-redux';
import * as eventAction from '../../../../action/event/manage_info';
import * as utilAction from '../../../../action/util';

class ManageInfo extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['manageInfo'];
    }

    componentDidMount() {  //render前

    }

    componentWillMount() {  //render前
        eventAction.getManageInfo({id: this.props.event_id})
    }

    componentWillUpdate() {

    }

    componentWillUnmount() {
    }

    componentWillReceiveProps(props) {
        this.state = props['manageInfo'];
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
                <div className="title">修改活动信息
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="wrap">
                    <Form
                        defaultValue={this.state}
                        onChange={(e) => {
                            this.state[e.target.name] = e.target.value;
                            if (Math.abs(Date.parse(this.state.begin_at)) > Math.abs(Date.parse(this.state.end_at))) {
                                this.refs[e.target.name].value = "";
                                this.state[e.target.name] = "";
                                this.forceUpdate();
                            }
                            if(e.target.name=="begin_at"||e.target.name=="end_at"){
                                this.forceUpdate();
                            }
                        }}>
                        <table>
                            <tbody>
                            <tr>
                                <td>活动ID</td>
                                <td className="disable">{this.props.event_id}
                                </td>
                            </tr>
                            <tr>
                                <td>活动名字</td>
                                <td><Input verify="" name="title"/>
                                </td>
                            </tr>
                            <tr>
                                <td>开始时间</td>
                                <td><input ref="begin_at" name="begin_at" type="date" value={this.state.begin_at}/>
                                </td>
                            </tr>
                            <tr>
                                <td>结束时间</td>
                                <td>
                                    <input ref="end_at" name="end_at" type="date" value={this.state.end_at}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </Form>
                </div>
                <div className="button">
                    <button type="button" onClick={() => {
                        this.state.event_id = this.props.event_id;
                        eventAction.setManageInfo(this.state, this.props.search);
                    }}>保存
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>
            </div>
        )

    }
}
export default connect(({manageInfo}) => ({manageInfo}))(ManageInfo);
