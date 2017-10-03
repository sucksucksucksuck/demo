/**
 * Created by sucksuck on 2017/9/30 9:59.
 */
import React from 'react'
import Form from '../../modules/form'
import Input from '../../modules/input'
import {connect} from 'react-redux'
import * as utilAction from '../../action/util'

class ForgetPwd extends React.Component {
    constructor(props) {
        super(props)
        //通过属性传递state过来
        this.state = {
            type: 1,
        }
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type)
        }
    }

    componentWillReceiveProps(props) {
    }

    onSubmit(e) {
        e.preventDefault()
    }

    componentWillUnmount() {
        // platformAction.clear()
    }

    onChange(value, e) {
        // this.state.admin_info[e.target.name] = value
    }

    typeChange(type) {
        this.state.type = type
        this.forceUpdate()
    }

    render() {
        return (
            <div className="forget-pwd">
                <div className="title">
                    <div className="iconfont">&#xe64c;</div>
                    忘记密码
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="nav-bar">
                    <div className={this.state.type === 1 ? 'active iconfont' : 'iconfont'} onClick={this.typeChange.bind(this, 1)}>&#xe61b; 手机找回
                    </div>
                    <div className={this.state.type === 2 ? 'active iconfont' : 'iconfont'} onClick={this.typeChange.bind(this, 2)}>
                        &#xe621; 邮箱找回
                    </div>
                </div>
                <div className="wrap">
                    {this.state.type === 1 ? <form ref="form"
                                                   onSubmit={this.onSubmit.bind(this)}
                    >
                        <div className="form-group">
                            <label className="control-label">手机号：</label>
                            <div>
                                <Input verify="^[a-zA-Z0-9]*$" name="employee_id" maxLength="24"
                                       onChange={this.onChange.bind(this)}/>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label">验证码：</label>
                            <div>
                                <Input maxLength="20" verify="" type="text" name="truename"
                                       onChange={this.onChange.bind(this)}/>
                                <button type="button" className="captcha-btn">获取验证码</button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label">新密码：</label>
                            <div>
                                <Input placeholder="
新密码，请输入6~30位字符" type="text" maxLength="100" verify="^[a-zA-Z0-9]*$" name="account"
                                       onChange={this.onChange.bind(this)}/>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label">确认密码：</label>
                            <div>
                                <Input placeholder="
确认密码，请输入6~30位字符" maxLength="20" verify="^[\d]*$" name="phone"
                                       onChange={this.onChange.bind(this)}/>
                            </div>
                        </div>
                    </form> : <form ref="form"
                                    onSubmit={this.onSubmit.bind(this)}
                    >
                        <div className="form-group">
                            <label className="control-label">邮箱：</label>
                            <div>
                                <Input verify="^[a-zA-Z0-9]*$" name="employee_id" maxLength="24"
                                       onChange={this.onChange.bind(this)}/>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label">验证码：</label>
                            <div>
                                <Input maxLength="20" verify="" type="text" name="truename"
                                       onChange={this.onChange.bind(this)}/>
                                <button type="button" className="captcha-btn">获取验证码</button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label">新密码：</label>
                            <div>
                                <Input placeholder="
新密码，请输入6~30位字符" type="text" maxLength="100" verify="^[a-zA-Z0-9]*$" name="account"
                                       onChange={this.onChange.bind(this)}/>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label">确认密码：</label>
                            <div>
                                <Input placeholder="
确认密码，请输入6~30位字符" maxLength="20" verify="^[\d]*$" name="phone"
                                       onChange={this.onChange.bind(this)}/>
                            </div>
                        </div>
                    </form>}

                </div>
                <div className="button">
                    <button type="submit" onClick={this.onSubmit.bind(this)} className="blue">重置密码</button>
                </div>
            </div>)
    }
}

export default ForgetPwd

