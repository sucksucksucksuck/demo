/**
 * Created by sucksuck on 2017/8/2.
 */
import React from 'react';
import {connect} from 'react-redux';
import * as utilAction from '../../../../action/util';

class Upload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: "",
            icon: ""
        };
    }

    componentWillReceiveProps(props) {
        this.setState({
            image: "",
            icon: ""
        });
    }

    onSelected(img) {
        if (this.props.onSelected) {
            this.props.onSelected(img);
        }
    }

    uploadFile(e) {
        e.preventDefault();
        if (this.state.image && this.state.icon) {
            utilAction.prompt("只能上传一种类型的图片");
            this.state.image = "";
        } else {
            console.log(this.state);
            this.onSelected(this.state);
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
            payload: "eventImageUpload"
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
                                   ref="file"
                                   name="file"
                                   onChange={(e) => {
                                       this.state.image = e.target.files;
                                       this.uploadFile(e);
                                   }}/>
                            <button type="button" className="btn btn-default btn-xs" onClick={() => {
                                if(!this.state.icon){
                                    this.refs["file"].click()
                                }
                            }}>浏览...
                            </button>
                        </div>
                        <div>
                            上传图片地址：<input type="text" name="icon" onChange={(e) => {
                            this.state.icon = e.target.value;
                            this.forceUpdate();
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

export default Upload;
