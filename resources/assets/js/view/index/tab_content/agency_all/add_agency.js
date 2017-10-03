/**
 * Created by sucksuck on 2017/9/30 17:53.
 */
import React from 'react'
import {connect} from 'react-redux'
import Form from '../../../../modules/simple_form'
import Input from '../../../../modules/input'
import * as agencyAction from '../../../../action/agency_all/add_agency'
class AddAgency extends React.Component {
    constructor(props) {
        super(props)
        // this.state = props['systemConfig'];
        /*获取数据*/
        this.state = {
            recharge: {},
            consume: {},
            check: false,
            form: {pwd: 0},
        }
    }

    onChange(name, e) {
        this.state[name][e.target.name] = e.target.value
        this.forceUpdate()
    }

    search() {

    }

    onChecked() {
        this.state.check = !this.state.check
        this.forceUpdate()
    }

    getCheck() {
        if (this.state.check) {
            return "checked"
        } else {
            return ""
        }
    }

    radio(e) {
        this.state.form[e.target.name] = e.target.value
        this.forceUpdate()
    }

    render() {
        return (
            <div className="agency-details">
                <Form className="wrap"
                      defaultValue={this.state.form}
                      onSubmit={() => {
                          if (!this.state.check) {
                              delete this.state.form.discount
                              this.forceUpdate()
                          }
                          if (this.state.form.pwd == 0) {
                              delete this.state.form.password
                              delete this.state.form.pwd
                          }
                          console.log(this.state.form)
                          agencyAction.addAgency(this.state.form)
                      }}
                      onChange={(e) => {
                          this.state.form[e.target.name] = e.target.value
                      }}>
                    <div className="content">
                        <div className="title"><span className="iconfont">&#xe620;</span>基本信息</div>
                        <div className="add">
                            <div className="item">
                                <div>
                                    <div>银商ID：</div>
                                    <div>系统生成</div>
                                </div>
                                <div/>
                            </div>
                            <div className="item">
                                <div>
                                    <div>账号：</div>
                                    <div><Input verify="" name="bus_account" type="text"
                                                placeholder="6~32位英文字母，数字，下划线组成"/></div>
                                </div>
                                <div/>
                            </div>
                            <div className="item">
                                <div>
                                    <div>充值微信：</div>
                                    <div><Input verify="" name="wechat" type="text" placeholder="请填写微信号"/></div>
                                </div>
                                <div>
                                    <div>充值QQ：</div>
                                    <div><Input verify="^[\d]*$" name="qq" type="text" placeholder="请填写QQ号"/></div>
                                </div>
                            </div>
                            <div className="item">
                                <div>
                                    <div>手机号：</div>
                                    <div><Input verify="^[\d]*$" name="phone" type="text" placeholder="请输入手机号码"/></div>
                                </div>
                                <div>
                                    <div>电子邮箱：</div>
                                    <div><Input verify="" name="email" type="text" placeholder="请输入电子邮箱"/></div>
                                </div>
                            </div>
                            <div className="item">
                                <div>
                                    <div>真实姓名：</div>
                                    <div><Input verify="" name="truename" type="text" placeholder="请填写真实姓名"/></div>
                                </div>
                                <div>
                                    <div>身份证号码：</div>
                                    <div><Input verify="" name="id_card" type="text" placeholder="请填写身份证号码"/>
                                    </div>
                                </div>
                            </div>
                            <div className="item">
                                <div>
                                    <div/>
                                    <div>
                                        <label><input onClick={this.radio.bind(this)} type="radio" value="0"
                                                      name="pwd"/>默认密码</label>
                                        <label><input onClick={this.radio.bind(this)} type="radio" value="1"
                                                      name="pwd"/>设置密码</label>
                                    </div>
                                </div>
                                <div/>
                            </div>
                            {this.state.form.pwd == 0 ? <div className="item">
                                <div>
                                    <div/>
                                    <div className="blue">提示：系统默认密码为“852741”请牢记；银商可自行修改默认密码。</div>
                                </div>
                                <div/>
                            </div> : <div className="item">
                                <div>
                                    <div>密码</div>
                                    <div><Input defaultValue={this.state.form.password} name="password" verify=""
                                                type="password"
                                                placeholder="6~32位英文字母，数字，下划线组成"/></div>
                                </div>
                                <div/>
                            </div>}
                        </div>
                    </div>
                    <div className="content">
                        <div className="title"><span className="iconfont">&#xe620;</span>合作信息</div>
                        <div className="add">
                            <div className="item">
                                <div>
                                    <div>分成类型</div>
                                    <div>
                                        <div className={"checkbox " + this.getCheck() }
                                             onClick={this.onChecked.bind(this)}
                                        >
                                            折扣
                                        </div>
                                    </div>
                                </div>
                                <div/>
                            </div>
                            <div className="item">
                                <div>
                                    <div/>
                                    {this.state.check ? <div><Input maxLength="1" verify="^[\d]*$" name="discount"
                                                                    type="text"
                                                                    placeholder="请输入折扣"/>折
                                    </div> : null}

                                </div>
                                <div/>
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
export default connect(({}) => ({}))(AddAgency)
