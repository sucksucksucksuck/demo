/**
 * Created by sucksuck on 2017/8/10.
 */
import React from 'react';
import Form from'../../../../modules/form';
import {connect} from 'react-redux';
import * as utilAction from '../../../../action/util';
import * as messageAction from '../../../../action/message_manage/push_message';
import Select from '../../../../modules/select';
import * as eventAction from '../../../../action/event/associate_event_id';

class CreatePushMsg extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['pgAnnouncementInfo'];

    }

    componentDidMount() {  //render前

    }

    componentWillMount() {  //render前
        eventAction.getEventList({not_expired:1});

    }

    componentWillUpdate() {

    }

    componentWillUnmount() {
        messageAction.clearData();
    }


    componentWillReceiveProps(props) {
        this.state = props['pgAnnouncementInfo'];
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
                <div className="title">新增推送消息
                    <span className="red">(推送消息一旦发送则无法回头，请谨慎编辑内容)</span>
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
                                <td><input name="title" placeholder="默认标题是“盘古商城”"/>
                                </td>
                            </tr>
                            <tr>
                                <td>推送内容</td>
                                <td><textarea name="content"/>
                                </td>
                            </tr>
                            <tr className="red">
                                <td/>
                                <td>内容限制为36个汉字以内
                                </td>
                            </tr>
                            <tr>
                                <td>关联活动</td>
                                <td> <Select name="event_id" opts={this.state.event_list} value="id" text="title"
                                             defaultText="无（默认进入盘古商城首页）"/>
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
                        messageAction.savePushMsg(this.state,this.props.search);
                    }}>推送
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>
            </div>
        )

    }
}
export default connect(({pgAnnouncementInfo}) => ({pgAnnouncementInfo}))(CreatePushMsg);
