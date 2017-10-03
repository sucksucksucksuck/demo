/**
 * Created by lrx on 2017/7/11.
 */
import React from 'react';
import {connect} from 'react-redux';
import * as appVersionAction from '../../../../action/system/app_version'

class AppVersion extends React.Component {
    constructor(props) {
        super(props);
        this.state = props['appVersion'];
        console.log(this.state);
        this.reader = new FileReader();
        this.reader.onload = function () {
            this.state.file = this.reader.result;
            if (this.callback) {
                this.callback();
            }
        }.bind(this);
    }
    onFileClick(e){
        console.log(this.refs['upfile'].value);
        let index = this.refs["upfile"].value.lastIndexOf(".");
        let value = this.refs["upfile"].value.substr(index);
        let fileIndex = this.refs["upfile"].value.lastIndexOf("\\");
        let fileValue = this.refs["upfile"].value.substr(fileIndex + 1);
        this.state.filename = fileValue;
        this.forceUpdate();
        //
        let f = e.target.files;
        appVersionAction.upFile({file:f[0]})
        //this.loadFile(f, this.forceUpdate.bind(this))
    }
    /*loadFile(files, callback, index = 0) {
        if (files.length > index) {
            this.reader.readAsDataURL(files[index]);
            //this.callback = this.loadFile.bind(this, files, callback, ++index);
        } else {
            this.callback = false;
            callback();
        }
    }*/
    onChange(e){
        let value = !isNaN(parseInt(e.target.value)) ? parseInt(e.target.value) : '';
        this.state[e.target.name] =value;
        this.forceUpdate()
    }
    componentDidMount(){
        appVersionAction.versionInit();
    }
    componentWillReceiveProps(props) {
        this.state = props['appVersion'];
        this.forceUpdate()
    }
    render() {
        return(
            <div className="app-version">
                <div className="section">
                    <div>
                        <div className="title">更新官网Android安装包</div>
                        <div className="package">
                            <div>
                                <div>
                                    安装包
                                </div>
                                <div>
                                    <div className="install-name">{this.state.filename}</div>
                                    <div className="file-button">上传文件
                                        <input type="file" ref="upfile" className="file-install"
                                               onChange={this.onFileClick.bind(this)}/>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
                <div className="section">
                    <div>
                        <div className="title">ios版本设置</div>
                        <div className="package">
                            <div>
                                <div>
                                    版本号
                                </div>
                                {this.state.ios_show ?
                                    <div>
                                        <div className="server-text">
                                            V{this.state.ios_version}</div>
                                        <div className="edit"
                                             onClick={
                                                 () => {
                                                     this.state.ios_show = false;
                                                     this.forceUpdate()
                                                 }
                                             }/>
                                    </div>
                                    :
                                    <div>
                                        <div className="version-input">
                                            <div>V</div>
                                            <input
                                                type="text" name="ios_version"  value={this.state.ios_version}
                                                onChange={(e)=>{this.onChange(e)}}/>
                                        </div>
                                        <div className="save">
                                            <div>
                                                <div className="save-yes" onClick={
                                                    () => {
                                                        this.state.ios_show = true;
                                                        this.forceUpdate();
                                                        appVersionAction.updateVersion({ios:this.state.ios_version})
                                                    }
                                                }/>
                                                <div className="save-no" onClick={
                                                    () => {
                                                        this.state.ios_show = true;
                                                        this.forceUpdate();
                                                    }
                                                }/>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default connect(({appVersion}) => ({appVersion}))(AppVersion);