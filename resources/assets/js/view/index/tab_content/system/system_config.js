/**
 * Created by lrx on 2017/5/16.
 */

import React from 'react';
import {connect} from 'react-redux';
import * as systemConfigAction from '../../../../action/system/system_config'

class SystemConfig extends React.Component {
    constructor(props) {
        super(props);
        this.state = props['systemConfig'];
        /*样式显示*/
        this.state.robot_show=true,
        this.state.goods_show=true,
        this.state.win_show=true,
        this.state.amount_show=true,
        this.state.remove_show=false,
        this.state.pwd_show=true,
        this.state.pwd_type_show=true,
        this.state.warn = false
    }

    componentDidMount() {
        this.onMouseMove = this.onMouseMove.bind(this);
        window.addEventListener('mousemove', this.onMouseMove, true);
        this.onMouseUp = this.onMouseUp.bind(this);
        window.addEventListener('mouseup', this.onMouseUp, true);
        systemConfigAction.initConfig();
    }

    componentWillUnmount() {
        window.removeEventListener(this.onMouseMove, false);
        window.removeEventListener(this.onMouseUp, false);
    }

    componentWillReceiveProps(props) {
        this.state = props['systemConfig'];
        this.forceUpdate()
    }

    onMouseDown(e) {
        if (!this.state.status) {
            // this.state.status = true;
            this.state.status = {clientX: e.clientX - this.state.bar_left};
            this.forceUpdate()
        }
    }

    onMouseMove(e) {
        if (this.state.status ) {
            this.moveHandle("bar_left", e)
        }
    }

    onMouseUp(e) {
        /*注意up区域，不然全局警告空更新*/
        if(!this.state.robot_show){
            this.state.status = false;
            if (0 < this.state.bar_left && this.state.bar_left <= ((1 / 5) * 400)) {
                this.state.bar_left = ((1 / 5) * 400);
            }
            else if (((1 / 5) * 400) < this.state.bar_left && this.state.bar_left <= ((2 / 5) * 400)) {
                this.state.bar_left = ((2 / 5) * 400);
            }
            else if (((2 / 5) * 400) < this.state.bar_left && this.state.bar_left <= ((3 / 5) * 400)) {
                this.state.bar_left = ((3 / 5) * 400);
            }
            else if (((3 / 5) * 400) < this.state.bar_left && this.state.bar_left <= ((4 / 5) * 400)) {
                this.state.bar_left = ((4 / 5) * 400);
            }
            else if (((4 / 5) * 400) < this.state.bar_left && this.state.bar_left <= 400) {
                this.state.bar_left = 400;
            }
            this.forceUpdate();
        }
    }

    moveHandle(left, e) {
        this.state[`${left}`] = e.clientX - this.state.status.clientX;
        if (this.state[`${left}`] >= 400) {
            this.state[`${left}`] = 400;
        } else if (this.state[`${left}`] <= 0) {
            this.state[`${left}`] = ((1 / 5) * 400);
        }
        this.forceUpdate();
    }
    /*抽离*/
    onInputEditClick(show,subShow) {
        this.state[`${show}`] = !this.state[`${show}`];
        this.state[`${subShow}`] = true;
        this.forceUpdate()
    }

    onInputSaveClick(show,subShow) {
        this.state[`${show}`] = !this.state[`${show}`];
        this.state[`${subShow}`] = false;
        this.forceUpdate()
    }

    onInputCloseClick(show,subShow) {
        this.state[`${show}`] = !this.state[`${show}`];
        this.state[`${subShow}`] = false;
        this.forceUpdate()
    }

    /*下架*/
    onOffShelf() {
        systemConfigAction.offShelf()
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

    /*编辑修改*/
    onChange(e) {
        let value = !isNaN(parseInt(e.target.value)) ? parseInt(e.target.value) : '';
        this.state[e.target.name] =value;
        this.forceUpdate()
    }
    onAmountChange(index,e){
        let value = !isNaN(parseInt(e.target.value)) ? parseInt(e.target.value) : '';
        this.state.money_amounts[index] = value;
        this.forceUpdate()
    }
    onWinSaveClick(){
        if(this.state.win_time<30){
            this.state.win_time = 30;
            this.state.warn = true
        }else if(this.state.win_time>600){
            this.state.win_time = 600;
            this.state.warn = true
        }else {
            this.state.warn = false

        }
        this.forceUpdate()
    }
    onSwitchClick(open){
        this.state[`${open}`] = !this.state[`${open}`];
        this.forceUpdate();
    }
    onSaveAmount(){
        this.state.money_amounts.forEach(function (item,index) {
            if(item ==''){
                this.state.money_amounts.splice(index,1);
                this.forceUpdate()
            }
        },this)
    }
    render() {
        return (
            <div className="system-config">
                <div className="wrap">
                    <div className="section">
                        <div className=" item robot">
                            <div className="title">机器人设置</div>
                            <div>
                                <div>
                                    <div>
                                        机器人购买
                                    </div>
                                    <div>
                                        <div className={this.state.robot_switch ? "open" : "close"}
                                             onClick={
                                                 ()=>{
                                                     this.onSwitchClick("robot_switch");
                                                     systemConfigAction.editConfig({"input[RobotBuy]":this.state.robot_switch});
                                                 }
                                             }>
                                            <div className="switch"/>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="robot-speed">
                                        调用机器人速度
                                    </div>
                                    <div>
                                        <div className="progress">
                                            <div className="bar" style={{width: this.state.bar_left}}/>
                                            { this.state.robot_show ?
                                                null :
                                                <div className="control" style={{left: this.state.bar_left}}
                                                     onMouseDown={this.onMouseDown.bind(this)}/>
                                            }
                                            { this.state.robot_show ?
                                                <div className="edit"
                                                     onClick={this.onInputEditClick.bind(this,"robot_show")}/> :
                                                <div className="save">
                                                    <div>
                                                        <div className="save-yes" onClick={
                                                            ()=>{
                                                                this.onInputSaveClick("robot_show");
                                                                systemConfigAction.editConfig({"input[BuySpeed]":((this.state.bar_left)/400)*5});
                                                            }
                                                        }/>
                                                        <div className="save-no" onClick={
                                                            ()=>{
                                                                this.onInputCloseClick("robot_show");
                                                                systemConfigAction.initConfig();
                                                            }
                                                        }/>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                        <div className="robot-time">
                                            <div>1</div>
                                            <div>2</div>
                                            <div>3</div>
                                            <div>4</div>
                                            <div>5</div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        每次购买商品数量
                                    </div>
                                    <div className="all-input">
                                        { this.state.goods_show ?
                                            <div>{this.state.goods_buy_count}</div> :
                                            <div>
                                                <input name="goods_buy_count" value={this.state.goods_buy_count} onChange={this.onChange.bind(this)}/>
                                            </div>}
                                        {this.state.goods_show ?
                                            <div className="edit"
                                                 onClick={this.onInputEditClick.bind(this, "goods_show")}/> :
                                            <div className="save">
                                                <div>
                                                    <div className="save-yes"
                                                         onClick={
                                                             ()=>{
                                                                 this.onInputSaveClick("goods_show");
                                                                 systemConfigAction.editConfig({"input[SinglePeopleBuy]":this.state.goods_buy_count});
                                                             }
                                                         }/>
                                                    <div className="save-no"
                                                         onClick={
                                                             ()=>{
                                                                 this.onInputCloseClick( "goods_show");
                                                                 systemConfigAction.initConfig();
                                                             }
                                                         }/>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        开奖倒计时时间
                                    </div>
                                    <div className="all-input">
                                        { this.state.win_show ?
                                            <div>{this.state.win_time + "s"}</div> :
                                            <div>
                                                <input name="win_time" value={this.state.win_time} onChange={this.onChange.bind(this)}/>
                                            </div>}
                                        {this.state.win_show ?
                                            <div className="edit"
                                                 onClick={this.onInputEditClick.bind(this, "win_show")}/>  :
                                            <div className="save">
                                                <div>
                                                    <div className="save-yes"
                                                         onClick={
                                                             ()=>{
                                                                 this.onWinSaveClick();
                                                                 this.onInputSaveClick("win_show");
                                                                 systemConfigAction.editConfig({"input[LotteryWait]":this.state.win_time});
                                                             }
                                                         }/>
                                                    <div className="save-no"
                                                         onClick={
                                                             ()=>{
                                                                 this.onInputCloseClick("win_show");
                                                                 systemConfigAction.initConfig();
                                                             }
                                                         }/>
                                                </div>
                                            </div>
                                        }
                                        {
                                            this.state.warn ?<div className="time-warn">时间范围为30s-600s</div>:null
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="item goods">
                            <div className="title">商品设置</div>
                            <div>
                                <div>
                                    <div>
                                        扩展属性模块
                                    </div>
                                    <div>
                                        <div className={this.state.attr_switch ? "open" : "close"}
                                             onClick={this.onSwitchClick.bind(this,"attr_switch")}>
                                            <div className="switch"/>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        强制下架所有商品
                                    </div>
                                    <div>
                                        <button type="button" className="off-shelf" onClick={this.onOffShelf.bind(this)}>
                                            一键强制下架所有商品
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="section">
                        <div className=" item order">
                            <div className="title">订单管理</div>
                            <div>
                                <div>
                                    <div>虚拟自动发货</div>
                                    <div>
                                        <div className={this.state.amount_switch ? "open" : "close"}
                                             onClick={this.onSwitchClick.bind(this,"amount_switch")}>
                                            <div className="switch"/>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        虚拟自动发货金额
                                    </div>
                                    <div className="all-input auto-input">
                                        { this.state.amount_show ? (this.state.money_amounts).map(function (item,index) {
                                            return (
                                                <div className="bold" key={index}>{item}</div>
                                            )
                                        },this) : (this.state.money_amounts).map(function (item,index) {
                                            return (
                                                <div key={index}>
                                                    <input className="amount-input" value={item}
                                                           onChange={this.onAmountChange.bind(this,index)}/>
                                                    {this.state.remove_show ? <div className="remove" onClick={
                                                        ()=>{
                                                            this.state.money_amounts.splice(index,1);
                                                            this.forceUpdate()
                                                        }
                                                    }>&times;</div> :null}
                                                </div>
                                            )
                                        },this)
                                        }
                                        {this.state.amount_show ?
                                            <div className="add-delete">
                                                <div className="add"
                                                     onClick={
                                                         ()=>{
                                                             this.onInputEditClick("amount_show","remove_show");
                                                             this.state.money_amounts.push('');
                                                             this.forceUpdate()

                                                         }
                                                     }/>
                                                <div className="delete"
                                                     onClick={
                                                         ()=>{
                                                             this.onInputEditClick("amount_show","remove_show");
                                                         }
                                                     }/>
                                            </div>
                                            :
                                            <div className="save">
                                                <div>
                                                    <div className="save-yes"
                                                         onClick={
                                                             ()=>{
                                                                 this.onInputSaveClick("amount_show","remove_show");
                                                                 this.onSaveAmount();
                                                             }
                                                         }/>
                                                    <div className="save-no"
                                                         onClick={
                                                             ()=>{
                                                                 this.onInputCloseClick("amount_show","remove_show");
                                                                 this.onSaveAmount();
                                                                 systemConfigAction.initConfig();
                                                             }
                                                         }/>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div>
                                    <div>新订单的提示音</div>
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
                        <div className="item login">
                            <div className="title">登录及密码设置</div>
                            <div>
                                <div>
                                    <div>
                                        是否需要短信验证码
                                    </div>
                                    <div>
                                        <div className={this.state.msg_switch ? "open" : "close"}
                                             onClick={this.onSwitchClick.bind(this,"msg_switch")}>
                                            <div className="switch"/>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        首次登录是否需要重设密码
                                    </div>
                                    <div>
                                        <div>
                                            <div className={this.state.reset_switch ? "open" : "close"}
                                                 onClick={this.onSwitchClick.bind(this,"reset_switch")}>
                                                <div className="switch"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        设置管理员初始密码（仅限新建的管理员）
                                    </div>
                                    <div className="all-input">
                                        { this.state.pwd_show ?
                                            <div>{this.state.init_pwd}</div> :
                                            <div>
                                                <input name="init_pwd" value={this.state.init_pwd} onChange={this.onChange.bind(this)}/>
                                            </div>}
                                        {this.state.pwd_show ?
                                            <div className="edit"
                                                 onClick={this.onInputEditClick.bind(this, "pwd_show")}/> :
                                            <div className="save">
                                                <div>
                                                    <div className="save-yes"
                                                         onClick={this.onInputSaveClick.bind(this, "pwd_show")}/>
                                                    <div className="save-no"
                                                         onClick={this.onInputCloseClick.bind(this, "pwd_show")}/>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        重置管理员密码的密码设置
                                    </div>
                                    <div>
                                        <div className="pwd-wrap">
                                            { this.state.pwd_type_show ?
                                                <form>
                                                    <input type="radio" name="pwd_type" value="1" disabled="disabled"
                                                           checked={this.state.pwd_type == 1}/>随机密码
                                                    <input type="radio" name="pwd_type" value="2" disabled="disabled"
                                                           checked={this.state.pwd_type == 2}/>初始密码
                                                </form> :
                                                <form onChange={
                                                    (e) => {
                                                        this.state[e.target.name] = e.target.value;
                                                        this.forceUpdate()
                                                    }
                                                }>
                                                    <input type="radio" name="pwd_type" value="1"
                                                           checked={this.state.pwd_type == 1}/>随机密码
                                                    <input type="radio" name="pwd_type" value="2"
                                                           checked={this.state.pwd_type == 2}/>初始密码
                                                </form>
                                            }
                                            { this.state.pwd_type_show ?
                                                <div className="edit"
                                                     onClick={this.onInputEditClick.bind(this,"pwd_type_show")}/> :
                                                <div className="save">
                                                    <div>
                                                        <div className="save-yes"
                                                             onClick={this.onInputSaveClick.bind(this,"pwd_type_show")}/>
                                                        <div className="save-no"
                                                             onClick={this.onInputCloseClick.bind(this,"pwd_type_show")}/>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        重置管理员密码的是否发送到手机
                                    </div>
                                    <div>
                                        <div>
                                            <div className={this.state.send_switch ? "open" : "close"}
                                                 onClick={this.onSwitchClick.bind(this,"send_switch")}>
                                                <div className="switch"/>
                                            </div>
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
export default connect(({systemConfig}) => ({systemConfig}))(SystemConfig);