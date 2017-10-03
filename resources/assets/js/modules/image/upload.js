/**
 * Created by Sun on 16/10/4.
 */
//
import React from 'react';
import {connect} from 'react-redux';
import * as utilAction from '../../action/util';

class Upload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            web: true,
            value: "http://",
            tag: props.tag,
        };
    }

    componentWillReceiveProps(props) {
        this.setState({
            web: true,
            tag: props.tag,
            value: "http://"
        });
    }

    onSelected(file) {
        if (this.props.onSelected) {
            this.props.onSelected(file);
        }
    }

    uploadFile(e) {
        console.log(this.props.event_id);
        e.preventDefault();
        if (!e.target["file"].files.length && !this.state.icon) {
            utilAction.prompt("请先选择图片!");
            return;
        }
        if (e.target["file"].files.length) {
            let image = Array.prototype.slice.call(e.target["file"].files);
            window.ajax.post(window.config.root + this.props.url, {
                id: this.props.event_id,
                image: image
            }, function (ret) {
                if (ret.errcode) {
                    utilAction.prompt(ret.msg);
                } else {
                    let images = ret.data;
                    if (this.state.icon) {
                        images.push(this.state.icon);
                    }
                    this.onSelected(images);
                    this.onClose();
                }
            }.bind(this));
        } else {
            let images = [];
            images.push(this.state.icon);
            this.onSelected(images);
            this.onClose();
        }
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    onClose() {
        window.store.dispatch({
            type: "DIALOG_CLOSE",
            payload: "imageUpload"
        });
    }

    onButtonClick(type, value) {
        if (this.props.onButtonClick) {
            this.props.onButtonClick(type, value);
        }
    }


    render() {
        return (
            <div className="image-upload" ref="dialog">
                <div className="title">图片上传
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <form className="image-upload-panel" onSubmit={this.uploadFile.bind(this)}>
                    <input type="hidden" value={this.state.tag} name="tag"/>
                    <div className="input">
                        <div>
                            上传文件：
                            <input type="file"
                                   multiple
                                   ref="file"
                                   name="file"
                                   onChange={(e) => {
                                       this.refs["file-path"].innerHTML = e.target.value;
                                   }}/>
                            <button type="button" className="btn btn-default btn-xs" onClick={() => {
                                this.refs["file"].click()
                            }}>浏览...
                            </button>
                            <div ref="file-path"/>
                        </div>
                        <div>
                            上传图片地址：<input type="text" name="icon" onChange={(e) => {
                            this.state.icon = e.target.value;
                        }}/>
                        </div>
                    </div>
                    <div className="button">
                        <button type="submit" className="btn btn-default btn-xs">确定</button>
                        <button type="button"
                                onClick={this.onClose.bind(this)}
                                className="btn btn-default btn-xs">取消
                        </button>
                    </div>
                </form>
            </div>
        )
    }
}

export default connect(({imgUpload}) => ({imgUpload}))(Upload);
