/**
 * Created by sucksuck on 2017/5/31.
 */
import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom'
import * as eventAction from '../../../../action/event/display_info';
import Form from '../../../../modules/form';
import Input from '../../../../modules/input';
import AbsTabContent from '../abs_tab_content';
import Select from '../../../../modules/select';

const module = 703;
const type = {
    "1": "banner",
    "2": "最新活动",
    "3": "banner+最新活动",
};
const visible = {
    "1": "所有人",
    "2": "客服",
    "3": "测试",
};
class EventDisplayInfo extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props["eventDisplayInfo"];
        this.state.image = this.state.info.icon;
        this.reader = new FileReader();
        this.reader.onload = function () {
            this.state.image = this.reader.result;
            if (this.callback) {
                this.callback();
            }
        }.bind(this);
    }


    componentWillMount() {
        if (this.props.extend == "create") {
            eventAction.clear();
        } else {
            eventAction.clear();
            eventAction.getEventInfo({id: this.props.extend});
        }
    }

    componentWillReceiveProps(props) {
        this.state = props["eventDisplayInfo"];
        this.forceUpdate();
    }

    addIcon(f) {
        this.state.info.image = f[0];
        this.loadFile(f, this.forceUpdate.bind(this));
    }

    loadFile(files, callback, index = 0) {
        if (files.length > index) {
            this.reader.readAsDataURL(files[index]);
            this.callback = this.loadFile.bind(this, files, callback, ++index);
        } else {
            this.callback = false;
            callback();
        }
    }

    componentWillUnmount() {
        eventAction.clear();
    }

    render() {
        return (
            <div className="event-info">
                <Form
                    defaultValue={this.state.info}
                    onChange={(e) => {
                        if (e.target.name != "icon") {
                            this.state.info[e.target.name] = e.target.value;
                        }
                        if (Math.abs(Date.parse(this.state.info.begin_at)) > Math.abs(Date.parse(this.state.info.end_at))) {
                            this.refs[e.target.name].value = "";
                            this.state.info[e.target.name] = "";
                            this.forceUpdate();
                        }
                        if (e.target.name == "begin_at" || e.target.name == "end_at") {
                            this.state.info[e.target.name] = e.target.value;
                            this.forceUpdate();
                        }
                    }}
                    onSubmit={() => {
                        if (this.props.extend == "create") {
                            eventAction.createEvent(this.state.info);
                        } else {
                            eventAction.setEventInfo(this.state.info);
                        }
                    }}
                    save={true}>
                    {this.props.extend == "create" ? null :
                        <div className="group">
                            <div className="title">ID</div>
                            <div className="disabled">
                                {this.props.extend}
                            </div>
                        </div>
                    }
                    <div className="group">
                        <div className="title">活动主标题</div>
                        <Input name="title" maxLength="20" verify=""/>
                    </div>
                    <div className="group">
                        <div className="title">活动副标题</div>
                        <Input name="describe" maxLength="255" verify=""/>
                    </div>
                    <div className="group">
                        <div className="title">活动图</div>
                        <div className="event-icon">
                            <img src={this.state.image} onError={(e) => {
                                e.target.src = window.config.root + "/image/index/index_user.png";
                            }}/>
                            <div>
                                <div className="file" onClick={eventAction.imageUpload.bind(this, (img) => {
                                    if (img.image) {
                                        this.addIcon(img.image);
                                        this.state.image = img.image;
                                    } else {
                                        this.state.image = img.icon;
                                        this.state.info.icon = img.icon;
                                    }
                                    this.forceUpdate();
                                })}>上传图片
                                </div>
                                <div>
                                    你可以上传JPG、GIF或PNG格式的文件，文件大小不能超过2M。<br/>
                                    建议尺寸：750*376（2:1）
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="group">
                        <div className="title">活动类型</div>
                        <div className="radio">
                            <label>
                                <input name="action" type="radio" value="1"/>跳转链接
                            </label>
                            <label>
                                <input name="action" type="radio" value="2"/>关联活动
                            </label>
                            <label>
                                <input name="action" type="radio" value="3"/>关联商品
                            </label>
                            <label>
                                <input name="action" type="radio" value="4"/>专栏内容
                            </label>
                        </div>
                    </div>
                    <div className="group">
                        <div className="title">展示时间</div>
                        <input name="begin_at" ref="begin_at" value={this.state.info.begin_at} type="date"
                        />-
                        <input name="end_at" ref="end_at" value={this.state.info.end_at} type="date"
                        />
                    </div>
                    <div className="group">
                        <div className="title">可见范围</div>
                        <Select name="visible" object={true} opts={visible} defaultText="请选择"/>
                    </div>
                    <div className="group">
                        <div className="title">栏目</div>
                        <Select name="type" object={true} opts={type} defaultText="请选择"/>
                    </div>
                </Form>
            </div>
        );
    }
}
export default connect(({eventDisplayInfo}) => ({eventDisplayInfo}))(EventDisplayInfo);
