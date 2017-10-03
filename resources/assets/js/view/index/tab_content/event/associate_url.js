/**
 * Created by sucksuck on 2017/6/5.
 */
import React from 'react';
import Form from'../../../../modules/form';
import Input from '../../../../modules/input';
import {connect} from 'react-redux';
import * as eventAction from '../../../../action/event/associate_url';
import * as utilAction from '../../../../action/util';

class AssociateUrl extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['associateUrl'];
    }

    componentDidMount() {  //render前

    }

    componentWillMount() {  //render前
        if (this.props.event_id) {
            eventAction.getAssociateInfo({id: this.props.event_id});
        }
    }

    onSelected(ret){
        if(this.props.onSelected){
            this.props.onSelected(ret);
        }
    }


    componentWillUpdate() {

    }

    componentWillUnmount() {
    }

    componentWillReceiveProps(props) {
        this.state = props['associateUrl'];
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
                <div className="title">关联跳转链接
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
                                <td>跳转链接</td>
                                <td><textarea className="text-area" name="url" cols="300"/>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </Form>
                </div>
                <div className="control-button">
                    <button type="button" onClick={() => {
                        if(this.props.event_id){
                            eventAction.setAssociateUrl({
                                id: this.props.event_id,
                                sort: this.state.info.sort,
                                url: this.state.info.url
                            }, this.props.search);
                        }else {
                            if(this.state.info.url){
                                this.onSelected(this.state.info.url);
                                this.props.onClick('cancel');
                            }else {
                                utilAction.prompt("请填写链接");
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
export default connect(({associateUrl}) => ({associateUrl}))(AssociateUrl);
