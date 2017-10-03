import React from 'react';
import {connect} from "react-redux";
import * as platformAction from "../../action/platform"

class AdminInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = props['auth'];
        // console.log(this.state);
        this.state.image = this.state.user.icon;
        this.reader = new FileReader();
        this.reader.onload = function () {
            this.state.image = this.reader.result;
            if (this.callback) {
                this.callback();
            }
        }.bind(this);
    };

    onChange(e) {
        this.state.user[e.target.name] = e.target.value;
        this.forceUpdate();
    }

    onClose() {
        window.store.dispatch({
            type: "DIALOG_CLOSE",
            payload: "adminInfo"
        });
    }

    componentWillMount() {  //render前
    }

    componentWillReceiveProps(props) {
        this.state = props['auth'];
        this.forceUpdate();
    }

    addIcon(e) {
        let f = e.target.files;
        this.state.user.icon = f[0];
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

    render() {
        return (
            <div className="adminInfo">
                <div className="title">个人信息
                    <div className="close" onClick={this.onClose.bind(this)}/>
                </div>
                <form
                    method="post"
                    className="wordList"
                    onSubmit={(e) => {
                        e.preventDefault();
                        platformAction.editMyInfo({
                            id: this.state.user.id,
                            image: this.state.user.icon,
                            truename: this.state.user.truename,
                            account: this.state.user.account,
                            phone: this.state.user.phone
                        })
                    }}
                >
                    <div className="headPortrait">
                        <img src={this.state.image} onError={(e) => {
                            e.target.src = window.config.root + "/image/index/index_user.png";
                        }}/>
                    </div>
                    <div className="imgUpload">
                        <p>你可以上传JPG、GIF或PNG格式的文件，文件大小不能超过2M。</p>
                        <span>上传图片</span>
                        <input type="file" name="icon" onChange={this.addIcon.bind(this)}/>
                    </div>
                    <div className="Word">
                        <span>名字</span>
                        <input className="inputColor" type="text" name="truename" placeholder="请输入昵称"
                               value={this.state.user.truename} readOnly='readOnly'
                               onChange={this.onChange.bind(this)}/>
                    </div>
                    <div className="Word">
                        <span>账号</span>
                        <input className="inputColor" type="text" name="account" placeholder="请输入账号" readOnly='readOnly'
                               value={this.state.user.account}
                               onChange={this.onChange.bind(this)}/>
                    </div>
                    <div className="Word">
                        <span>手机号码</span>
                        <input className="inputColor" type="text" name="phone" placeholder="请输入手机号码" readOnly='readOnly'
                               value={this.state.user.phone}
                               onChange={this.onChange.bind(this)}/>
                    </div>
                    <div className="button">
                        <button className="blue" type="submit">保存</button>
                        {/*<button type="button" onClick={this.onClose.bind(this)}>取消</button>*/}
                    </div>
                </form>
            </div>
        )
    }
}

export default connect(({auth}) => ({auth}))(AdminInfo);