/**
 * Created by sucksuck on 2017/8/10.
 */
import React from 'react';
import Form from'../../../../modules/form';
import Input from '../../../../modules/input';
import {connect} from 'react-redux';
import * as eventAction from '../../../../action/event/prize_red_info';
import * as utilAction from '../../../../action/util';
import * as messageAction from '../../../../action/message_manage/station_message';

class CreateStationMsg extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            switch: false
        }
        //通过属性传递state过来
    }

    componentDidMount() {  //render前

    }

    componentWillMount() {  //render前
        // eventAction.prizeInfoClear();
    }

    componentWillUpdate() {

    }

    componentWillUnmount() {
        eventAction.prizeInfoClear();
    }

    componentWillReceiveProps(props) {
        this.forceUpdate();
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);

        }
    }

    render() {
        return (
            <div className="dialog-form create-msg">
                <div className="title"> 新增站内信消息
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
                            <tr>
                                <td>标题</td>
                                <td><input name="title"/>
                                </td>
                            </tr>
                            <tr>
                                <td>内容</td>
                                <td><textarea name="content"/>
                                </td>
                            </tr>
                            <tr>
                                <td>系统公告</td>
                                <td className="switch">
                                    <div className={this.state.switch ? "open" : "close"}
                                         onClick={() => {
                                             this.state.switch = !this.state.switch;
                                             this.forceUpdate();
                                         }}>
                                        <div className="switch"/>
                                    </div>
                                </td>
                            </tr>
                            <tr className="red">
                                <td/>
                                <td>系统公告在用户首页的弹窗展示，系统公告的标题限制在10个字以内，内容限制在180个字以内

                                </td>
                            </tr>
                            <tr>
                                <td>发送对象</td>
                                <td><input name="user_id"/>
                                </td>
                            </tr>
                            <tr className="red">
                                <td/>
                                <td>为空则发送到全体用户
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </Form>
                </div>
                <div className="button">
                    <button type="button" onClick={() => {
                        if (this.state.switch) {
                            this.state.type = 3;
                        } else {
                            this.state.type = 2;
                        }
                        messageAction.saveStationMsg(this.state,this.props.search)
                    }}>发送
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>
            </div>
        )

    }
}
export default CreateStationMsg;
