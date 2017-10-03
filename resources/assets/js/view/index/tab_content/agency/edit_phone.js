/**
 * Created by sucksuck on 2017/10/3 19:41.
 */
import React from 'react'
import Form from '../../../../modules/form'
import Input from '../../../../modules/input'
import {connect} from 'react-redux'
import * as platformAction from '../../../../action/platform'
import * as utilAction from '../../../../action/util'

class EditInfo extends React.Component {
    constructor(props) {
        super(props)
        // this.state = props["editInfo"]
        //通过属性传递state过来
        this.state = {
            next: false,
        }
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type)
        }
    }

    componentWillReceiveProps(props) {
        this.state = props["editInfo"]
        this.forceUpdate()
    }

    onSubmit(e) {
        e.preventDefault()
        // platformAction.createAdmin(this.state.admin_info, this.props.search)
    }

    componentWillUnmount() {
        // platformAction.clear()
    }

    onChange(value, e) {
        this.state.admin_info[e.target.name] = value
    }

    stop(e) {
        e.stopPropagation()
    }

    render() {
        return (
            <div className="create-admin" onClick={this.stop.bind(this)}>
                <div className="title">修改绑定手机
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                {this.state.next ? <div className="wrap">
                    <form ref="form"
                        // defaultValue={this.state.admin_info}
                          onSubmit={this.onSubmit.bind(this)}
                    >
                        <div className="form-group">
                            <label className="control-label">新手机号码：</label>
                            <div>
                                1356451254
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label">验证码：</label>
                            <div>
                                <Input maxLength="20" verify="" type="text" name="truename"
                                       onChange={this.onChange.bind(this)}/>
                                <button type="button" className="w100">获取验证码</button>
                            </div>
                        </div>
                    </form>
                </div> : <div className="wrap">
                    <form ref="form"
                        // defaultValue={this.state.admin_info}
                          onSubmit={this.onSubmit.bind(this)}
                    >
                        <div className="form-group">
                            <label className="control-label">手机号码：</label>
                            <div>
                                1356451254
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label">验证码：</label>
                            <div>
                                <Input maxLength="20" verify="" type="text" name="truename"
                                       onChange={this.onChange.bind(this)}/>
                                <button type="button" className="w100">获取验证码</button>
                            </div>
                        </div>
                    </form>
                </div>}
                {this.state.next ? <div className="button">
                    <button type="submit" onClick={() => {
                        this.state.next = !this.state.next
                        this.forceUpdate()
                    }}>上一步
                    </button>
                    <button type="submit" onClick={this.onSubmit.bind(this)} className="blue">保存</button>
                </div> : <div className="button">
                    <button type="submit" className="blue" onClick={() => {
                        this.state.next = !this.state.next
                        this.forceUpdate()
                    }}>下一步
                    </button>
                </div>}

            </div>)
    }
}

export default connect(({editInfo}) => ({editInfo}))(EditInfo)