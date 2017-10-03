/**
 * Created by lrx on 2017/5/18.
 */

import React from 'react';
import {connect} from 'react-redux';
import * as appConfigAction from '../../../../action/system/app_config'

const serviceTitle = ["客服热线","第三方供应商","客服QQ","微信公众号","商务合作邮箱","发货时间"];
class AppConfig extends React.Component {
    constructor(props) {
        super(props);
        this.state = props['appConfig'];
        this.state.sort = false;
    }
    componentDidMount() {
        appConfigAction.initConfig();
    }

    componentWillUnmount() {
    }

    componentWillReceiveProps(props) {
        this.state = props['appConfig'];
        console.log(this.state);
        this.forceUpdate()
    }

    onInputEditClick(show, subShow) {
        this.state[`${show}`] = !this.state[`${show}`];
        this.state[`${subShow}`] = true;
        this.forceUpdate()
    }

    onChange(e) {
        let value = !isNaN((e.target.value)) ? (e.target.value) : '';
        this.state.input[e.target.name] =value.replace(/[^\d.]/g,'');
        this.forceUpdate()
    }
    onServiceChange(e){
        this.state.writes[e.target.name] = e.target.value;
        this.forceUpdate()
    }
    onTextChange(e){
        this.state.writes[e.target.name] =e.target.value;
        this.forceUpdate()
    }

    onSwitchClick(open) {
        this.state[`${open}`] = !this.state[`${open}`];
        this.forceUpdate();
    }

    /*上传文件*/
    onFileClick() {
        let index = this.refs["music"].value.lastIndexOf(".");
        let value = this.refs["music"].value.substr(index);
        let fileIndex = this.refs["music"].value.lastIndexOf("\\");
        let fileValue = this.refs["music"].value.substr(fileIndex + 1);
        if (value == ".mp3") {
            this.state.filename = fileValue;
            this.forceUpdate();
        } else {
            this.state.filename = "请选择正确的文件格式";
            this.forceUpdate();
        }
    }

    onTagUpload(item,e){
        let fileIndex = e.target.value.lastIndexOf("\\");
        let fileValue = e.target.value.substr(fileIndex + 1);
        if(fileValue==''){
            this.state.label[e.target.name] = "未上传图片"
        }else{
            this.state.label[e.target.name] = fileValue;
        }
        this.forceUpdate();
        let f = e.target.files;
        if(f.length !== 0){
            appConfigAction.upGoodsTag({id:item.id,image:f[0]})
        }

    }

    selectedSort(n1,n2){
      return n1.sort-n2.sort;
    }
    sortClick(item,sort){
        item.sort+=sort;
        this.state.sort = true;
        this.forceUpdate();
    }
    componentDidUpdate(){
        if(this.state.sort){
            this.state.sort =false;
            this.forceUpdate();
            let sortArray = [];
            this.state.payArray.map(function (item,index) {
                sortArray.push({id:item.id,sort:item.sort/2+1})
            },this);
             this.timeOut = setTimeout(function () {
                appConfigAction.sortUpdate({sort:JSON.stringify(sortArray)});
            },1000)
        }
    }
    componentWillUnmount(){
        window.clearTimeout(this.timeOut)
    }
    render() {
        return (
            <div className="app-config">
                <div className="wrap">
                    <div className="section section-pay">
                        <div>
                            <div className="title">支付管理</div>
                            <div className="pay">
                                <div>
                                    <div/>
                                    <div className="version-wrap">
                                        <div className="phone-version">iOS版本（低于该版本号不可见）</div>
                                        <div className="phone-version">Android版本（低于该版本号不可见）</div>
                                    </div>
                                </div>
                                {this.state.payArray.sort(this.selectedSort.bind(this)).map(function (item, index) {
                                        item.sort = index*2;
                                        return (
                                        <div key={index} className="ite">
                                            <div>{item.describe}</div>
                                            <div className="pay-wrap">
                                                <div className="control">
                                                    <div className={index===0?"up none":"up"} onClick={this.sortClick.bind(this,item,-3)}/>
                                                    <div className={index===this.state.payArray.length-1?"down none":"down"}
                                                         onClick={this.sortClick.bind(this,item,3)}/>
                                                </div>
                                                <div className="ios-main">
                                                    <div className={item.ios? "open" : "close"}
                                                         onClick={() => {
                                                             if(item.ios){
                                                                 item.ios = 0
                                                             }else{
                                                                 item.ios = 1
                                                             }
                                                             this.forceUpdate();
                                                             appConfigAction.updateStatus({id:item.id,ios:item.ios,android:item.android})
                                                         }}>
                                                        <div className="switch"/>
                                                    </div>
                                                    {item.ios_show ?
                                                        <div>
                                                            <div className="server-text">不可见版本 V{item.ios_version}</div>
                                                            <div className="edit"
                                                                 onClick={() => {item.ios_show = false;this.forceUpdate();}}/>
                                                        </div> :
                                                        <div>
                                                            <div className="server-input ver-input">
                                                                <div>不可见版本 V</div>
                                                                <input
                                                                    type="text" name={`id_${item.id}`} value={this.state.input[`id_${item.id}`]}
                                                                    onChange={(e)=>{this.onChange(e)}}/>
                                                            </div>
                                                            <div className="save">
                                                                <div>
                                                                    <div className="save-yes" onClick={
                                                                        () => {
                                                                            item.ios_show = true;
                                                                            this.forceUpdate();
                                                                            appConfigAction.updateVersion(
                                                                                {id:item.id,type:1,version:this.state.input[`id_${item.id}`]})
                                                                        }
                                                                    }/>
                                                                    <div className="save-no" onClick={
                                                                        () => {
                                                                            item.ios_show = true;
                                                                            this.forceUpdate();
                                                                        }
                                                                    }/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                                <div className="android-main">
                                                    <div className={item.android ? "open" : "close"}
                                                         onClick={() => {
                                                             if(item.android){
                                                                 item.android = 0
                                                             }else{
                                                                 item.android = 1
                                                             }
                                                             //item.android = !item.android;
                                                             this.forceUpdate();
                                                             appConfigAction.updateStatus({id:item.id,ios:item.ios,android:item.android})
                                                         }}>
                                                        <div className="switch"/>
                                                    </div>
                                                    {item.android_show ?
                                                        <div>
                                                            <div className="server-text">不可见版本
                                                                V{item.android_version}</div>
                                                            <div className="edit"
                                                                 onClick={
                                                                     () => {
                                                                         item.android_show = false;
                                                                         this.forceUpdate()
                                                                     }
                                                                 }/>
                                                        </div> :
                                                        <div>
                                                            <div className="server-input ser-input">
                                                                <div>不可见版本 V</div>
                                                                <input
                                                                    type="text" name={`index_${index}`}  value={this.state.input[`index_${index}`]}
                                                                    onChange={(e)=>{this.onChange(e)}}/>
                                                            </div>
                                                            <div className="save">
                                                                <div>
                                                                    <div className="save-yes" onClick={
                                                                        () => {
                                                                            item.android_show = true;
                                                                            appConfigAction.updateVersion(
                                                                                {id:item.id,type:2,version:this.state.input[`index_${index}`]});
                                                                        }
                                                                    }/>
                                                                    <div className="save-no" onClick={
                                                                        () => {
                                                                            item.android_show = true;
                                                                            this.forceUpdate();
                                                                        }
                                                                    }/>
                                                                </div>
                                                            </div>
                                                        </div>}
                                                </div>

                                            </div>
                                        </div>
                                    )
                                }, this)}
                            </div>
                        </div>
                    </div>
                    <div className="section">
                        <div>
                            <div className="title">客服中心</div>
                            <div className="server">
                                {this.state.serverArray.map(function (item,index) {
                                    return(
                                        <div key={index}>
                                            <div>
                                                {serviceTitle[index]}
                                            </div>
                                            {index<=4?
                                                <div>
                                                    <div className={item.status ? "open" : "close"}
                                                         onClick={() => {
                                                             if(item.status){
                                                                 item.status = 0
                                                             }else{
                                                                 item.status = 1
                                                             }
                                                             this.forceUpdate();
                                                             appConfigAction.serviceStatus({id:item.id,status:item.status})
                                                         }}>
                                                        <div className="switch"/>
                                                    </div>
                                                    {item.show ?
                                                        <div className="server-text">{item.content}</div> :
                                                        <div className="server-input">
                                                           <input type="text" name={`id_${item.id}`} value={this.state.writes[`id_${item.id}`]}
                                                                onChange={this.onServiceChange.bind(this)}/>
                                                        </div>
                                                    }
                                                    {item.show ?
                                                        <div className="edit"
                                                             onClick={
                                                                 () => {item.show = false;this.forceUpdate()}}/> :
                                                        <div className="save">
                                                            <div>
                                                                <div className="save-yes" onClick={
                                                                    () => {
                                                                        item.show = true;
                                                                        this.forceUpdate();
                                                                        appConfigAction.serviceVersion({id:item.id,content:this.state.writes[`id_${item.id}`]})
                                                                    }
                                                                }/>
                                                                <div className="save-no" onClick={() => {item.show = true;this.forceUpdate()}}/>
                                                            </div>
                                                        </div>}
                                                </div>:
                                                <div>
                                                    <div className={item.status ? "open" : "close"}
                                                         onClick={() => {
                                                             if(item.status){
                                                                 item.status = 0
                                                             }else{
                                                                 item.status = 1
                                                             }
                                                             this.forceUpdate();
                                                             appConfigAction.serviceStatus({id:item.id,status:item.status})
                                                         }
                                                         }>
                                                        <div className="switch"/>
                                                    </div>
                                                    {item.show ?
                                                        <div className="text-area">
                                            <pre>
                                                {item.content}
                                            </pre>
                                                        </div > :
                                                        <textarea className="service-area" name={`id_${item.id}`} value={this.state.writes[`id_${item.id}`]}
                                                                  onChange={this.onTextChange.bind(this)}>
                                                </textarea>
                                                    }
                                                    {item.show ?
                                                        <div className="edit"
                                                             onClick={() => {item.show = false;this.forceUpdate()}}/>  :
                                                        <div className="save">
                                                            <div>
                                                                <div className="save-yes" onClick={
                                                                    () => {item.show = true;this.forceUpdate();
                                                                        appConfigAction.serviceVersion({id:item.id,content:this.state.writes[`id_${item.id}`]})}
                                                                }/>
                                                                <div className="save-no" onClick={
                                                                    () => {item.show = true;this.forceUpdate()}
                                                                }/>
                                                            </div>
                                                        </div>}
                                                </div>}
                                        </div>
                                    )
                                },this)}
                            </div>
                        </div>
                    </div>
                    <div className="section section-label">
                        <div>
                            <div className="title">标签配置
                                <div>图片仅支持jpg、png、gif格式文件，文件大小在20K以内</div>
                            </div>
                            <div className="label-wrap">
                                {this.state.tag.map(function (item,index) {
                                    return(
                                        <div className="label" key={index}>
                                            <div className="item">
                                                <div>
                                                    标签{index+1}
                                                </div>
                                                <div>
                                                    <div className="file-button">上传文件
                                                        <input type="file" name={`id_${item.id}`} className="file-install"
                                                               onChange={this.onTagUpload.bind(this,item)}/>
                                                    </div>
                                                    <div className="img-name">{this.state.label[`id_${item.id}`]}</div>
                                                    {/*<div className="img-close">&times;</div>*/}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }.bind(this))}
                            </div>
                        </div>
                    </div>
                    <div className="section section-code">
                        <div>
                            <div className="title">推荐码</div>
                            <div>
                                <div>
                                    <div>
                                        是否可以填写推荐码
                                    </div>
                                    <div>
                                        <div className={this.state.ss ? "open" : "close"}
                                             onClick={() => {
                                                 this.onSwitchClick("ss");
                                             }
                                             }>
                                            <div className="switch"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="section section-code">
                        <div className="server">
                            <div className="title">中奖提示音</div>
                            <div>
                                <div>
                                    <div>
                                        中奖提示音
                                    </div>
                                    <div>
                                        <div className={this.state.tt ? "open" : "close"}
                                             onClick={() => {
                                                 this.onSwitchClick("tt");
                                             }
                                             }>
                                            <div className="switch"/>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div>更改中奖提示音</div>
                                    <div>
                                        <div className="file-wrap">
                                            <div className="file-button">上传文件
                                                <input type="file" ref="music" className="file-music"
                                                       onChange={this.onFileClick.bind(this)}/>
                                            </div>
                                            <div className="file-name">{this.state.filename}</div>
                                            <div className="prompt">提示音仅支持.mp3格式，文件大小在20k以内</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default connect(({appConfig}) => ({appConfig}))(AppConfig);