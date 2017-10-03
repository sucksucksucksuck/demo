/**
 * Created by sucksuck on 2017/9/30 17:53.
 */
import React from 'react'
import {connect} from 'react-redux'
import * as financeAction from '../../../../action/finance/recharge'
import Form from '../../../../modules/simple_form'
import Input from '../../../../modules/input'
class FinanceRecharge extends React.Component {
    constructor(props) {
        super(props)
        this.state = props['financeRecharge']
        /*获取数据*/
    }

    componentWillReceiveProps(props) {
        this.state = props["financeRecharge"]
        console.log(this.state)
        this.forceUpdate()
    }

    componentWillUnmount() {
        financeAction.clear()
    }

    onChange(name, e) {
        this.state[name][e.target.name] = e.target.value
        this.forceUpdate()
    }

    search() {

    }

    render() {
        return (
            <div className="agency-details">
                <Form className="wrap"
                      defaultValue={this.state.form}
                      onSubmit={(e) => {
                          e.preventDefault()
                          financeAction.recharge(this.state.form)
                      }}
                      onChange={(e) => {
                          this.state.form[e.target.name] = e.target.value
                      }}>
                    <div className="content">
                        <div className="title"><span className="iconfont">&#xe620;</span>银商信息</div>
                        <div className="add">
                            <div className="item">
                                <div>
                                    <div>银商账号：</div>
                                    <div><Input verify="" type="text" name="bus_id"/>
                                        <button type="button" onClick={() => {
                                            financeAction.getList({bus_id: this.state.form.bus_id})
                                        }}>查询
                                        </button>
                                    </div>
                                </div>
                                <div/>
                            </div>
                            {this.state.data.bus_account ? <div>
                                <div className="item">
                                    <div>
                                        <div>账号：</div>
                                        <div className="orange">{this.state.data.bus_account}</div>
                                    </div>
                                    <div/>
                                </div>
                                <div className="item">
                                    <div>
                                        <div>金币余额：</div>
                                        <div>{this.state.data.coins}</div>
                                    </div>
                                    <div>
                                        <div>注册时间：</div>
                                        <div>{this.state.data.created_at}</div>
                                    </div>
                                </div>
                                <div className="item">
                                    <div>
                                        <div>手机号：</div>
                                        <div>{this.state.data.phone}</div>
                                    </div>
                                    <div>
                                        <div>电子邮箱：</div>
                                        <div
                                            className="orange">{this.state.data.email ? this.state.data.email : "未绑定"}</div>
                                    </div>
                                </div>
                                <div className="item">
                                    <div>
                                        <div>微信号：</div>
                                        <div>{this.state.data.wechat ? this.state.data.wechat : "未绑定"}</div>
                                    </div>
                                    <div>
                                        <div>QQ：</div>
                                        <div>
                                            {this.state.data.qq ? this.state.data.qq : "未绑定"}</div>
                                    </div>
                                </div>
                            </div> : null}


                        </div>
                    </div>
                    <div className="content">
                        <div className="title"><span className="iconfont">&#xe620;</span>充值信息</div>
                        <div className="add">
                            <div className="item">
                                <div>
                                    <div>充值金额：</div>
                                    <div>
                                        <div>
                                            <Input verify="^[\d]*$" type="text" name="amount"/>元
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div>金币数：</div>
                                    <div>
                                        <div>
                                            <Input verify="^[\d]*$" type="text" name="coin_number"/>元
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="button">
                        <button type="button" className="white" onClick={() => {
                            for (let x in this.state.form) {
                                this.state.form[x] = null
                                this.forceUpdate()
                            }
                        }}>重置
                        </button>
                        <button type="submit">保存</button>
                    </div>
                </Form>
            </div>
        )
    }
}
export default connect(({financeRecharge}) => ({financeRecharge}))(FinanceRecharge)
