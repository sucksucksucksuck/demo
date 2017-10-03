/**
 * Created by sucksuck on 2017/8/10.
 */
import React from 'react';
import Form from'../../../../modules/form';
import Editor from '../../../../modules/editor';
import Select from '../../../../modules/select';
import {connect} from 'react-redux';
import * as utilAction from '../../../../action/util';
import * as messageAction from '../../../../action/message_manage/pg_announcement';
import * as eventAction from '../../../../action/event/associate_event_id';

class CreateAnnouncement extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['pgAnnouncementInfo'];
        this.reader = new FileReader();
        this.reader.onload = function () {
            this.state.image = this.reader.result;
            if (this.callback) {
                this.callback();
            }
        }.bind(this);
    }

    componentDidMount() {  //render前
        eventAction.getEventList({not_expired: 1});
        if (this.props.id) {
            messageAction.getInfo({id: this.props.id})
        }
    }

    componentWillMount() {  //render前
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

    loadFile(files, callback, index = 0) {
        if (files.length > index) {
            this.reader.readAsDataURL(files[index]);
            this.callback = this.loadFile.bind(this, files, callback, ++index);
        } else {
            this.callback = false;
            callback();
        }
    }

    render() {
        return (
            <div className="dialog-form announcement">
                <div className="title">新增盘古公告
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="wrap">
                    <Form
                        defaultValue={this.state.info}
                        onChange={(e) => {
                            if (e.target.name == "icon") {
                                let f = e.target.files;
                                this.state.info.image = f[0];
                                this.loadFile(f, this.forceUpdate.bind(this));
                            } else {
                                this.state.info[e.target.name] = e.target.value;
                            }
                        }}>
                        <table>
                            <tbody>
                            <tr>
                                <td>标题</td>
                                <td><input name="title"/>
                                </td>
                            </tr>
                            <tr>
                                <td>公告图</td>
                                <td><img src={this.state.image} onError={(e) => {
                                    e.target.src = window.config.root + "/image/index/index_user.png";
                                }}/>
                                </td>
                            </tr>
                            <tr>
                                <td/>
                                <td>
                                    <div className="file">
                                        上传图片
                                        <input type="file" name="icon" className="icon"
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>内容</td>
                                <td>
                                    <Editor
                                        name="content"
                                        ref="editor"
                                        getImageList={(path) => {
                                            this.state.info.image_list = path;
                                        }}
                                        event_id={this.props.id ? this.props.id : "img" + new Date().getTime()}
                                        url="/message_manage/pangu_message/up_img"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>可见范围</td>
                                <td>
                                    <select type="text" name="visible">
                                        <option value="1">所有人</option>
                                        <option value="2">客服号</option>
                                        <option value="3">测试号</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>关联活动</td>
                                <td>
                                    <Select name="event_id" opts={this.state.event_list} value="id" text="title"
                                            defaultText="无（默认进入盘古商城首页）"/>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </Form>
                </div>
                <div className="button">
                    <button type="button" onClick={() => {
                        this.state.info.content = this.refs.editor.state.content;
                        if (this.props.id) {
                            messageAction.editAnnouncement(this.state.info);
                        } else {
                            messageAction.saveAnnouncement(this.state.info);
                        }
                    }}>发布
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>
            </div>
        )

    }
}
export default connect(({pgAnnouncementInfo}) => ({pgAnnouncementInfo}))(CreateAnnouncement);