/**
 * Created by sucksuck on 2017/9/30 15:17.
 */
import React from 'react'
import {connect} from 'react-redux'
import * as eventAction from '../../../../action/event/count'
import * as utilAction from '../../../../action/util'
import Form from "../../../../modules/form"
import EditPhone from './edit_phone'
// import EditInfo from './edit_info'
class AgencyDetails extends React.Component {
    constructor(props) {
        super(props)
        // this.state = props['systemConfig'];
        /*获取数据*/
        this.state = {recharge: {}, consume: {}}
    }

    onChange(name, e) {
        this.state[name][e.target.name] = e.target.value
        this.forceUpdate()
    }


    render() {
        return (
            <div className="agency-details">
                <div className="wrap">
                    <div className="content">
                        <div className="title"><span className="iconfont">&#xe620;</span>基本信息</div>
                        <div className="info">
                            <div>
                                <span>账号：</span>
                                <div className="orange">cheec(登录账号)</div>
                            </div>
                            <div>
                                <span>代理商ID：</span>
                                <div>cheec(登录账号)</div>
                            </div>
                            <div>
                                <span>注册时间：</span>
                                <div className="blue">2017-15-11 15:12:45</div>
                            </div>
                        </div>
                        <div className="row">
                            <div>
                                <div>身份信息</div>
                                <div>您已实名<span className="green">*大锤</span>，身份证号码<span className="green">443945198****7836</span>
                                </div>
                            </div>
                            <div>
                                <div className="green"><i className="iconfont">&#xe63b;</i>已设置</div>
                            </div>
                        </div>
                        <div className="row">
                            <div>
                                <div>手机绑定</div>
                                <div>您已绑定了手机<span className="green">1395642****</span>[您的手机号为安全手机，可用于找回密码，但不能用于登录]
                                </div>
                            </div>
                            <div>
                                <div className="green"><i className="iconfont">&#xe63b;</i>已设置</div>
                                <i/>
                                <div className="edit" onClick={() => {
                                    let call = function (type) {
                                        if (type === "cancel") {
                                            utilAction.close("EditInfo")
                                        }
                                    }
                                    window.store.dispatch({
                                        type: "DIALOG_OPEN",
                                        payload: {
                                            key: "EditInfo",
                                            // slide: true,
                                            fade: true,
                                            view: <EditPhone onClick={call}/>
                                        }
                                    })
                                }}>修改
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div>
                                <div>微信绑定</div>
                                <div>您已绑定了微信<span className="green">ch**ry520</span>
                                </div>
                            </div>
                            <div>
                                <div className="green"><i className="iconfont">&#xe63b;</i>已设置</div>
                                <i/>
                                <div className="edit">修改</div>
                            </div>
                        </div>
                        <div className="row">
                            <div>
                                <div>QQ绑定</div>
                                <div>代理充值途径，可用户为客户进行充值
                                </div>
                            </div>
                            <div>
                                <div className="green"><i className="iconfont">&#xe63b;</i>已设置</div>
                                <i/>
                                <div className="edit">修改</div>
                            </div>
                        </div>
                        <div className="row">
                            <div>
                                <div>电子邮箱</div>
                                <div>未绑定，手机号或电子邮箱必须设置一个
                                </div>
                            </div>
                            <div>
                                <div className="green"><i className="iconfont">&#xe63b;</i>已设置</div>
                                <i/>
                                <div className="edit">修改</div>
                            </div>
                        </div>
                        <div className="row">
                            <div>
                                <div>登录密码</div>
                                <div>安全性高的密码可使账号更加安全
                                </div>
                            </div>
                            <div>
                                <div className="green"><i className="iconfont">&#xe63b;</i>已设置</div>
                                <i/>
                                <div className="edit">修改</div>
                            </div>
                        </div>
                    </div>
                    <div className="content">
                        <div className="title"><span className="iconfont">&#xe606;</span>代理信息</div>
                        <div className="agency">
                            <div>
                                <div>金币余额</div>
                                <div>123456</div>
                            </div>
                            <i/>
                            <div>
                                <div>向平台总充值</div>
                                <div>123456</div>
                            </div>
                            <i/>
                            <div>
                                <div>平台合作</div>
                                <div>123456</div>
                            </div>
                            <i/>
                            <div>
                                <div>盈利</div>
                                <div>123456</div>
                            </div>
                        </div>
                    </div>
                    <div className="content">
                        <div className="title"><span className="iconfont">&#xe681;</span>客户充值信息</div>
                        <div className="agency">
                            <div>
                                <div>客户总充值</div>
                                <div>123456</div>
                            </div>
                            <i/>
                            <div>
                                <div>总充值单数</div>
                                <div>123456</div>
                            </div>
                            <i/>
                            <div>
                                <div>月充值</div>
                                <div>123456</div>
                            </div>
                            <i/>
                            <div>
                                <div>月充值单数</div>
                                <div>123456</div>
                            </div>
                            <i/>
                            <div>
                                <div>今日充值</div>
                                <div>123456</div>
                            </div>
                            <i/>
                            <div>
                                <div>今日充值单数</div>
                                <div>123456</div>
                            </div>
                        </div>
                    </div>
                    <div className="content">
                        <div className="title"><span className="iconfont">&#xe69c;</span>月充值报表</div>
                    </div>
                </div>
            </div>
        )
    }
}
export default connect(({}) => ({}))(AgencyDetails)
