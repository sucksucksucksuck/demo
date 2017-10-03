/**
 * Created by sucksuck on 2017/6/5.
 */

import React from 'react';
import Form from'../../../../modules/form';
import Input from '../../../../modules/input';
import {connect} from 'react-redux';
import * as eventAction from '../../../../action/event/associate_content';
import * as utilAction from '../../../../action/util';
import Editor from '../../../../modules/editor';

class AssociateContent extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['associateContent'];
    }

    componentDidMount() {  //render前

    }

    componentWillMount() {  //render前
        if(this.props.event_id){
            eventAction.getAssociateInfo({id: this.props.event_id});
        }
    }

    componentWillUpdate() {

    }

    componentWillUnmount() {

    }

    componentWillReceiveProps(props) {
        this.state = props['associateContent'];
        this.forceUpdate();
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    render() {
        return (
            <div className="associate">
                <div className="title">关联专栏内容
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
                            <tr>
                                <td>活动主标题</td>
                                <td className="disable">{this.state.info.title}
                                </td>
                            </tr>

                            <tr>
                                <td>活动副标题</td>
                                <td className="disable">{this.state.info.describe}
                                </td>
                            </tr>
                            <tr>
                                <td/>
                                <td><img src={this.state.info.icon} onError={(e) => {
                                    e.target.src = window.config.root + "/image/index/index_user.png";
                                }}/>
                                </td>
                            </tr>
                            <tr>
                                <td>优先级显示</td>
                                <td><Input verify="" name="sort"/>
                                </td>
                            </tr>
                            <tr className="red">
                                <td/>
                                <td>*数字越大，显示越前</td>
                            </tr>
                            <tr>
                                <td>内容</td>
                                <td>
                                    <Editor
                                        name="content"
                                        ref="editor"
                                        event_id={this.props.event_id}
                                        url="/event_manage/display_info/up_img"
                                    />
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </Form>
                </div>
                <div className="control-button">
                    <button type="button" onClick={() => {
                        eventAction.setAssociatecontent({
                            id: this.props.event_id,
                            sort: this.state.info.sort,
                            content:this.refs.editor.state.content
                        },this.props.search)
                    }}>保存
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>
            </div>
        )

    }
}
export default connect(({associateContent}) => ({associateContent}))(AssociateContent);
