/**
 * Created by sun_3211 on 2017/3/6.
 */
import React from 'react';
import {connect} from 'react-redux';
import * as authAction from './../../action/auth';
import * as platformAction from "../../action/platform"

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: props['menu']['page'].title,
            icon: props['auth']['user'].icon,
            truename: props['auth']['user'].truename
        };
        this.state.authOption = false;
        if (props['menu']['page']['extend'] && props['menu']['page']['extend']['button']) {
            this.state.button = props['menu']['page']['extend'].button;
        };

    }

    componentWillMount() {  //render前

    }

    componentWillReceiveProps(props) {
        this.state = {
            title: props['menu']['page'].title,
            icon: props['auth']['user'].icon,
            truename: props['auth']['user'].truename
        };
        if (props['menu']['page']['extend'] && props['menu']['page']['extend']['button']) {
            this.state.button = props['menu']['page']['extend'].button;
        }
        this.forceUpdate();

    }

    handleOption() {
        this.state.authOption = !this.state.authOption;
        this.forceUpdate();
    }
    closeExport(){
        this.state.authOption = !this.state.authOption;
        this.forceUpdate();
    }

    render() {
        return (
            <div className="header">
                <img className="logo" src={window.config.root + "/image/index/index_logo.png"}/>
                <div>
                    <div className="navigation">
                        {this.state.title=='商品数据监控-商品实时数据'?'':this.state.title}
                        {this.state.button ?
                            <div className={this.state.button}
                                 onClick={this.props.onButtonClick.bind(this, this.state.button)}/> : null}
                    </div>
                    <div className="user-info">
                        <img className="user-icon" onError={(e) => {
                            e.target.src = window.config.root + "/image/index/index_user.png";
                        }} src={this.state.icon}/>
                        <div className="user-name" onClick={this.handleOption.bind(this)}>{this.state.truename}
                        </div>

                        {this.state.authOption ? <div className="export-wrap" onClick={this.closeExport.bind(this)}/> : null}
                        {this.state.authOption ? (
                            <div className="authOption">
                                <button type="button" onClick={() => {
                                    this.handleOption();
                                    authAction.changePwd();
                                }}>修改密码
                                </button>
                                <button type="button" onClick={()=>{
                                    if (this.state.authOption) {
                                        this.state.authOption = false;
                                        this.forceUpdate();
                                        authAction.moneyInfo();
                                    }
                                }}>
                                    我的打款信息
                                </button>
                                <button type="button" onClick={() => {
                                    if (this.state.authOption) {
                                        this.state.authOption = false;
                                        this.forceUpdate();
                                    }
                                    authAction.adminInfo();
                                }}>个人信息
                                </button>
                                <button type="button" onClick={() => {
                                    if (this.state.authOption) {
                                        this.state.authOption = false;
                                        this.forceUpdate();
                                        platformAction.logOut();
                                    }
                                }}>登出
                                </button>
                            </div>)
                            : null}</div>
                </div>
            </div>
        )
    }
}
export default connect(({menu, auth}) => ({menu, auth}))(Header);