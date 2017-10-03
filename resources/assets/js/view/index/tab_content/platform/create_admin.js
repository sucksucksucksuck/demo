/**
 * Created by sucksuck on 2017/4/11.
 */
import React from 'react'
import Form from '../../../../modules/form'
import Input from '../../../../modules/input'
import {connect} from 'react-redux'
import * as platformAction from '../../../../action/platform'
import * as utilAction from '../../../../action/util'
import SelectTree from '../../../../modules/select_tree'

class CreateAdmin extends React.Component {
    constructor(props) {
        super(props)
        this.state = props["createAdmin"]
        //通过属性传递state过来
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type)
        }
    }

    componentWillReceiveProps(props) {
        this.state = props["createAdmin"]
        this.forceUpdate()
    }

    onSubmit(e) {
        e.preventDefault()
        utilAction.confirm("是否确定修改", () => {
            platformAction.createAdmin(this.state.admin_info, this.props.search)
            // platformAction.getPlatformAdmin();
            return true
        })
    }

    componentWillUnmount() {
        platformAction.clear()
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
                <div className="title">新建管理员
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="wrap">
                    <form ref="form"
                          defaultValue={this.state.admin_info}
                          onSubmit={this.onSubmit.bind(this)}
                    >
                        <div className="form-group">
                            <label className="control-label">工号：</label>
                            <div>
                                <Input verify="^[a-zA-Z0-9]*$" name="employee_id" maxLength="24"
                                       onChange={this.onChange.bind(this)}/>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label">姓名：</label>
                            <div>
                                <Input maxLength="20" verify="" type="text" name="truename"
                                       onChange={this.onChange.bind(this)}/>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label">账号：</label>
                            <div>
                                <Input type="text" maxLength="100" verify="^[a-zA-Z0-9]*$" name="account"
                                       onChange={this.onChange.bind(this)}/>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label">手机号码：</label>
                            <div>
                                <Input maxLength="20" verify="^[\d]*$" name="phone"
                                       onChange={this.onChange.bind(this)}/>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label">角色：</label>
                            <div>
                                <SelectTree
                                    onHandleChange={(e) => {
                                        this.state.admin_info[e.target.name] = e.target.value
                                        this.forceUpdate()
                                    }}
                                    admin_group={this.props.role_list}
                                    defaultTitle="请选择"/>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label">性别：</label>
                            <div>
                                <label><input name="sex" type="radio" value="1" onClick={this.onChange.bind(this, 1)}/>男</label>
                                <label><input name="sex" type="radio" value="2" onClick={this.onChange.bind(this, 2)}/>女</label>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="button">
                    <button type="submit" onClick={this.onSubmit.bind(this)} className="blue">保存</button>
                </div>
            </div>)
    }
}

export default connect(({createAdmin}) => ({createAdmin}))(CreateAdmin)

