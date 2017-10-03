/**
 * Created by sucksuck on 2017/5/24.
 */
import React from 'react';
import * as authAction from '../../action/auth';
import {connect} from 'react-redux';
import * as validity from '../../modules/form_validity';
import  '../../../image/login/logo_3.png';
import  '../../../image/login/login_pic.png';

class Login extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['auth'];

    };

    componentDidMount() {
        this.setIntervalId = window.setInterval(this.countDown.bind(this), 1000);
    }

    countDown() {
        if (this.state.get_code_flag) {
            this.state.get_code_second--;
            if (!this.state.get_code_second) {
                this.state.get_code_flag = false;
            }
            this.forceUpdate();
        }
    }

    componentWillUnmount() {
        window.clearInterval(this.setIntervalId);
    }

    //查看点击登录后是否有 props属性变化
    componentWillReceiveProps(props) {
        this.state = props['auth'];
        this.forceUpdate(function () {
            if (!this.state.sms_validity || !window.config.sms_code) {
                this.resetCaptcha();
            }
        });
    }


    onGetCode() {
        if (validity.validity(this.refs['form'], ['user_id', 'user_pwd', 'captcha'])) {
            this.state.get_code_flag = true;
            this.state.get_code_second = 60;
            this.countDown();
            authAction.getCode(this.state.form);
        }
    }

    resetCaptcha() {
        this.refs["captcha"].src = window.config.root + "/captcha?t=" + new Date().getTime();
    }

    render() {
        return (
            <div className="login-panel3">
                <div className="top">
                    <img className="logo" src={window.config.root + "/image/login/logo_3.png"}/>
                    <div>
                        <div>联品后台管理系统</div>
                        <div>Copyright&copy; 2016-2017 联品科技 版权所有</div>
                    </div>
                </div>
                <div className="footer">
                    <div>利益是团队的前提，精神是团队的灵魂</div>
                    <div>The benefit is this premise of the team.the spirit is the soul of the team</div>
                </div>
                <div className="full">
                    <div className="form">
                        {this.state.errcode && this.state.msg ? (
                            <div className="error">{this.state.msg}</div>
                        ) : null}
                        <form method="post"
                              ref="form"
                              onSubmit={(e) => {
                                  authAction.login(this.refs['form'], this.state.form, e)
                              }}
                              onChange={(e) => {
                                  if (e.target.name) {
                                      e.target.setCustomValidity("");
                                      this.state.form[e.target.name] = e.target.value;
                                      this.forceUpdate();
                                  }
                              }}>
                            <div className="title">用户名</div>
                            <div className=" input-item">
                                <input type="text"
                                       required="required"
                                       name="user_id"
                                       autoFocus="true"
                                       autoComplete="off"
                                       data-msg="请输入用户名"
                                       value={this.state.form.user_id}
                                />
                            </div>
                            <div className="title">密码</div>
                            <div className="input-item">
                                <input type="password"
                                       required
                                       name="user_pwd"
                                       autoComplete="off"
                                       data-msg="请输入密码"
                                       value={this.state.form.user_pwd}
                                />
                            </div>
                            <div className="title">图片验证码</div>
                            <div className="captcha">
                                <input type="text"
                                       name="captcha"
                                       required="required"
                                       autoComplete="off"
                                       data-msg="请输入图片验证码"
                                       maxLength="4"
                                       value={this.state.form.captcha}
                                />
                                <img className="captcha-pic" alt="验证码"
                                     ref="captcha"
                                     onClick={this.resetCaptcha.bind(this)}
                                     src={window.config.root + "/captcha"}/>
                            </div>
                            {window.config.sms_code ? (
                                <div className="sms">
                                    {!this.state.get_code_flag ? (
                                        <div className="msg">
                                            <button type="button" onClick={this.onGetCode.bind(this)}>
                                                获取短信验证码
                                            </button>
                                        </div>) : (
                                        <div className="msg">
                                            请在{this.state.get_code_second}s之后再获取
                                        </div>)}
                                    <div className="sms-code">
                                        <div className="title">短信验证码</div>
                                        <input type="text"
                                               name="verify_code"
                                               required="true"
                                               autoComplete="off"
                                               data-msg="请输入短信验证码"
                                               maxLength="6"
                                               value={this.state.form.verify_code || ""}
                                        />
                                    </div>
                                </div>
                            ) : null}
                            <button className="submit">登录</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}


export default connect(({auth}) => ({auth}))(Login);