/**
 * Created by sucksuck on 2017/10/2 15:19.
 */
import React from 'react'
import Form from '../../../../modules/form'
import Input from '../../../../modules/input'
import {connect} from 'react-redux'
import * as platformAction from '../../../../action/platform'
import * as utilAction from '../../../../action/util'
import SelectTree from '../../../../modules/select_tree'

class AgencyRecharge extends React.Component {
    constructor(props) {
        super(props)
        this.state = props["agencyRecharge"]
        //通过属性传递state过来
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type)
        }
    }

    componentWillReceiveProps(props) {
        this.state = props["agencyRecharge"]
        this.forceUpdate()
    }


    componentWillUnmount() {
        this.props.close()
    }

    onChange(value, e) {
        this.state.admin_info[e.target.name] = value
    }

    stop(e) {
        e.stopPropagation()
    }

    render() {
        return (
            <div className="agency-recharge" onClick={this.stop.bind(this)}>
                <div className="title">代理充值信息</div>
                <div className="wrap">
                    <div className="content">
                        <div className="title"><span className="iconfont">&#xe620;</span>充值信息</div>
                        <div className="add">
                            <div className="item">
                                <div>
                                    <div>订单ID：</div>
                                    <div className="orange">56488522665</div>
                                </div>
                                <div/>
                            </div>
                            <div className="item">
                                <div>
                                    <div>充值前金币：</div>
                                    <div>466000</div>
                                </div>
                                <div>
                                    <div>充值时间：</div>
                                    <div>2000</div>
                                </div>
                            </div>
                            <div className="item">
                                <div>
                                    <div>本次代理金币：</div>
                                    <div>500</div>
                                </div>
                                <div>
                                    <div>充值金融：</div>
                                    <div>500元</div>
                                </div>
                            </div>
                            <div className="item">
                                <div>
                                    <div>剩余金币：</div>
                                    <div>500</div>
                                </div>
                                <div>
                                    <div>类型：</div>
                                    <div className="blue">代充</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="content">
                        <div className="title"><span className="iconfont">&#xe620;</span>用户信息</div>

                        <div className="add">
                            <div className="item">
                                <div>
                                    <div>用户游戏ID：</div>
                                    <div>500</div>
                                </div>
                                <div>
                                    <div>客户昵称：</div>
                                    <div>500元</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>)
    }
}

export default connect(({agencyRecharge}) => ({agencyRecharge}))(AgencyRecharge)

