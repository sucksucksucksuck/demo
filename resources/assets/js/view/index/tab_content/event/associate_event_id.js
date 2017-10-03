/**
 * Created by sucksuck on 2017/6/5.
 */
import React from 'react';
import Form from'../../../../modules/form';
import Input from '../../../../modules/input';
import Select from '../../../../modules/select';
import {connect} from 'react-redux';
import * as eventAction from '../../../../action/event/associate_event_id';
import * as utilAction from '../../../../action/util';
import Editor from '../../../../modules/editor';

class AssociateEventId extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['associateEventId'];
    }

    componentDidMount() {  //render前

    }

    componentWillMount() {  //render前
        if (this.props.event_id) {
            eventAction.getAssociateInfo({id: this.props.event_id});
            eventAction.getEventList({not_expired: 1});
        } else {
            eventAction.getEventUrlList();
        }
    }

    onSelected(ret) {
        if (this.props.onSelected) {
            this.props.onSelected(ret);
        }
    }

    componentWillUpdate() {

    }

    componentWillUnmount() {
        eventAction.clear();
    }

    componentWillReceiveProps(props) {
        this.state = props['associateEventId'];
        this.forceUpdate();
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    render() {
        return (
            <div className={this.props.event_id ? "associate" : "little-associate"}>
                <div className="title">关联活动
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
                            {this.props.event_id ? <tr>
                                <td>活动主标题</td>
                                <td className="disable">{this.state.info.title}
                                </td>
                            </tr> : null}
                            {this.props.event_id ? <tr>
                                <td>活动副标题</td>
                                <td className="disable">{this.state.info.describe}
                                </td>
                            </tr> : null}
                            {this.props.event_id ? <tr>
                                <td/>
                                <td><img src={this.state.info.icon} onError={(e) => {
                                    e.target.src = window.config.root + "/image/index/index_user.png";
                                }}/>
                                </td>
                            </tr> : null}
                            {this.props.event_id ? <tr>
                                <td>优先级显示</td>
                                <td><Input verify="" name="sort"/>
                                </td>
                            </tr> : null}
                            {this.props.event_id ? <tr className="red">
                                <td/>
                                <td>*数字越大，显示越前</td>
                            </tr> : null}
                            <tr>
                                <td>关联活动</td>
                                <td>
                                    {this.props.event_id ?
                                        <Select name="event_id" opts={this.state.event_list} value="id" text="title"
                                                defaultText="请选择活动"/> :
                                        <select name="event_id" id="">
                                            <option value="">请选择活动</option>
                                            {this.state.event_list.map(function (item, index) {
                                                return (
                                                    <option key={index}
                                                            value={JSON.stringify(item)}>{item.title}</option>);
                                            })}
                                        </select>}
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </Form>
                </div>
                <div className="control-button">
                    <button type="button" onClick={() => {
                        if (this.props.event_id) {
                            eventAction.setAssociateEvent({
                                id: this.props.event_id,
                                sort: this.state.info.sort,
                                event_id: this.state.info.event_id
                            }, this.props.search);

                        } else {
                            if (this.state.info.event_id) {
                                this.onSelected(this.state.info.event_id);
                                this.props.onClick('cancel');
                            } else {
                                utilAction.prompt("请选择活动");
                            }
                        }

                    }}>保存
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>
            </div>
        )

    }
}
export default connect(({associateEventId}) => ({associateEventId}))(AssociateEventId);
