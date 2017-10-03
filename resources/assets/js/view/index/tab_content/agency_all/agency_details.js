/**
 * Created by sucksuck on 2017/10/2 15:19.
 */
import React from 'react'
import Form from '../../../../modules/form'
import Input from '../../../../modules/input'
import {connect} from 'react-redux'
import * as agencyAction from '../../../../action/agency_all/agency_details'
import * as utilAction from '../../../../action/util'
import SelectTree from '../../../../modules/select_tree'
const status = {
    "1": "启用",
    "2": "禁用"
}
class AgencyDetails extends React.Component {
    constructor(props) {
        super(props)
        this.state = props["agencyDetails"]
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type)
        }
    }

    componentWillMount() {
        agencyAction.getList(this.props.id)
    }

    componentWillReceiveProps(props) {
        this.state = props["agencyDetails"]
        console.log(this.state)
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
                <div className="title">代理商详细信息
                </div>
                <div className="wrap">
                    <div className="content">
                        <div className="title"><span className="iconfont">&#xe620;</span>银商信息</div>
                        <div className="add">
                            <div className="item">
                                <div>
                                    <div>银商ID：</div>
                                    <div>{this.state.data.bus_id}</div>
                                </div>
                                <div>
                                    <div>账号：</div>
                                    <div className="orange">{this.state.data.bus_account}</div>
                                </div>
                            </div>
                            <div className="item">
                                <div>
                                    <div>金币余额：</div>
                                    <div>{this.state.data.coins}</div>
                                </div>
                                <div>
                                    <div>注册时间：</div>
                                    <div></div>
                                </div>
                            </div>
                            <div className="item">
                                <div>
                                    <div>手机号：</div>
                                    <div>{this.state.data.phone}</div>
                                </div>
                                <div>
                                    <div>电子邮箱：</div>
                                    <div>{this.state.data.email}</div>
                                </div>
                            </div>
                            <div className="item">
                                <div>
                                    <div>微信号：</div>
                                    <div>{this.state.data.wechat}</div>
                                </div>
                                <div>
                                    <div>QQ：</div>
                                    <div className="blue">{this.state.data.qq}</div>
                                </div>
                            </div>
                            <div className="item">
                                <div>
                                    <div>真实姓名：</div>
                                    <div>500</div>
                                </div>
                                <div>
                                    <div>身份证：</div>
                                    <div className="blue">{this.state.data.card_id}</div>
                                </div>
                            </div>
                            <div className="item">
                                <div>
                                    <div>状态：</div>
                                    <div>{status[this.state.data.status]}</div>
                                </div>
                                <div>
                                    <div>合作类型：</div>
                                    <div className="blue">折扣</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="content">
                        <div className="title"><span className="iconfont">&#xe620;</span>财务信息</div>

                        <div className="add">
                            <div className="item">
                                <div className="center">
                                    平台充值
                                </div>
                                <div className="center">
                                    用户充值
                                </div>
                            </div>
                            <div className="item">
                                <div>
                                    <div>累计平台充值：</div>
                                    <div>{this.state.data.platFinance.recharge_amount}</div>
                                </div>
                                <div>
                                    <div>累计平台充值：</div>
                                    <div>{this.state.data.userFinance.recharge_amount}</div>
                                </div>
                            </div>
                            <div className="item">
                                <div>
                                    <div>充值次数：</div>
                                    <div>{this.state.data.platFinance.recharge_total}</div>
                                </div>
                                <div>
                                    <div>充值次数：</div>
                                    <div>{this.state.data.userFinance.recharge_total}</div>
                                </div>
                            </div>
                            <div className="item">
                                <div>
                                    <div>最后充值金额：</div>
                                    <div>{this.state.data.platFinance.recharge_last_amount}</div>
                                </div>
                                <div>
                                    <div>最后充值金额：</div>
                                    <div>{this.state.data.userFinance.recharge_last_amount}</div>
                                </div>
                            </div>
                            <div className="item">
                                <div>
                                    <div>最后充值时间：</div>
                                    <div>{this.state.data.platFinance.updated_at}</div>
                                </div>
                                <div>
                                    <div>最后充值时间：</div>
                                    <div>{this.state.data.userFinance.updated_at}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>)
    }
}

export default connect(({agencyDetails}) => ({agencyDetails}))(AgencyDetails)

