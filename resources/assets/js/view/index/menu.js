/**
 * Created by sun_3211 on 2017/3/6.
 */

import React from 'react'
//import {connect} from 'react-redux';
//import * as menuAction from '../../action/menu';
import {NavLink} from 'react-router-dom'
import * as authAction from '../../action/auth'
import * as platformAction from '../../action/platform'
import  '../../../image/index/index_user.png'

export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = props['menu']
        this.state.user_info = props['auth']
        this.state.authOption = false
        //通过属性传递state过来
    }

    componentWillMount() {  //render前
        // console.log(this.state);
    }

    componentDidMount() {
        console.log(this.state)
    }

    componentWillReceiveProps(props) {
        //   this.setState(props["menu"]);
        this.state.user_info = props['auth']
        //   this.state = props['menu'];
        //this.setState(props["menu"]);
        this.forceUpdate()

    }

    onMenuClick(item) {
        item.show = !item.show
        this.forceUpdate()
    }

    render() {
        return (
            <div className="menu">
                <div className="user-handle" onClick={() => {
                    this.state.authOption = !this.state.authOption
                    this.forceUpdate()
                }}>
                    <img className="user-icon" onError={(e) => {
                        e.target.src = window.config.root + "/image/index/index_user.png"
                    }}
                         src={this.state.user_info.user.icon == null ? window.config.root + "/image/index/index_user.png" : this.state.user_info.user.icon}/>
                    <div className="name">
                        <div>{this.state.user_info.user.truename}</div>
                        <div>{this.state.user_info.user.title}</div>
                    </div>
                    {this.state.authOption ?
                        <div className="auth-wrap"/> : null}

                </div>
                {this.state.authOption ? (
                    <div className="authOption">
                        <button type="button" onClick={() => {
                            this.state.authOption = !this.state.authOption
                            this.forceUpdate()
                            authAction.changePwd()
                        }}>修改密码
                        </button>
                        {/*<button type="button" onClick={() => {*/}
                        {/*if (this.state.authOption) {*/}
                        {/*this.state.authOption = false*/}
                        {/*this.forceUpdate()*/}
                        {/*authAction.moneyInfo()*/}
                        {/*}*/}
                        {/*}}>*/}
                        {/*我的打款信息*/}
                        {/*</button>*/}
                        <button type="button" onClick={() => {
                            if (this.state.authOption) {
                                this.state.authOption = false
                                this.forceUpdate()
                            }
                            authAction.adminInfo()
                        }}>个人信息
                        </button>
                        <button type="button" onClick={() => {
                            if (this.state.authOption) {
                                this.state.authOption = false
                                this.forceUpdate()
                                platformAction.logOut()
                            }
                        }}>登出
                        </button>
                    </div>)
                    : null}
                <div className="menu-item">
                    {this.state.menu.map(function (item, index) {
                        let className = []
                        if (item.has_sub) {
                            className.push('has')
                        }
                        if (item.class) {
                            className.push(item.class)
                        }
                        if (className.length > 0) {
                            className = className.join(' ')
                        } else {
                            className = null
                        }
                        return (
                            <div key={index} className={item.show ? "show" : null}>
                                {item.url ?
                                    <NavLink className={className}
                                             to={window.caseUrl(item.url + "/" + JSON.stringify(item.extend))}>
                                        {item.title}
                                    </NavLink> :
                                    <div className={className}
                                         onClick={this.onMenuClick.bind(this, item, false)}>
                                        {item.title}
                                    </div>}
                                {item.has_sub ?
                                    <div>{item.sub.map(function (subItem, subIndex) {
                                        let subClassName = []
                                        if (subItem.class) {
                                            subClassName.push(subItem.class)
                                        }
                                        if (subClassName.length > 0) {
                                            subClassName = subClassName.join(' ')
                                        } else {
                                            subClassName = null
                                        }
                                        return (
                                            <NavLink key={subIndex} className={subClassName}
                                                     to={window.caseUrl(subItem.url + "/" + JSON.stringify(subItem.extend))}>
                                                {subItem.title}
                                            </NavLink>
                                        )
                                    }, this)}
                                    </div>
                                    : null}
                            </div>
                        )
                    }, this)}

                </div>
            </div>
        )
    }
}
//export default connect(({menu, auth}) => ({menu, auth}))(Menu);