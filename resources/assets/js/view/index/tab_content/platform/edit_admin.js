/**
 * Created by sucksuck on 2017/4/21.
 */

import React from 'react';
import Form from '../../../../modules/form';
import Input from '../../../../modules/input';
import {connect} from 'react-redux';
import * as platformAction from '../../../../action/platform';
import * as utilAction from '../../../../action/util';
import SelectTree from '../../../../modules/select_tree';

class EditAdmin extends React.Component {
    constructor(props) {
        super(props);
        this.state = props["editAdmin"];
        //通过属性传递state过来

    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    componentWillMount() {
        platformAction.adminInfo({id: this.props.extend.id});
        // console.log(this.state.admin_info);
    }


    componentWillReceiveProps(props) {
        this.state = props["editAdmin"];
        this.forceUpdate();

    }

    onSubmit() {
        this.state.admin_info.id = this.props.extend.id;
        utilAction.confirm("是否确定修改", () => {
            platformAction.editAdminInfo(this.state.admin_info, this.props.search);
            return true;
        });
    }

    onCancel() {
        utilAction.close("editAdmin");

    }

    componentWillUnmount() {
        platformAction.clear();
    }

    render() {
        return (
            <div className="create-admin">
                <div className="title">编辑管理员
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="wrap">
                    <Form ref="form"
                          defaultValue={this.state.admin_info}
                          onChange={(e) => {
                              this.state.admin_info[e.target.name] = e.target.value;
                          }}
                          onSubmit={this.onSubmit.bind(this)}
                          save={window.hasPermission(1202, 2)}
                          onCancel={this.onCancel.bind(this)}
                    >
                        <div className="item-title">工号</div>
                        <input type="text" name="employee_id" maxLength="24"/>
                        <div className="item-title">姓名</div>
                        <Input maxLength="20" verify="" type="text" name="truename"/>
                        <div className="item-title">账号</div>
                        <div className="disable">{this.state.admin_info.account}</div>
                        <div className="item-title">手机号码</div>
                        <Input maxLength="20" verify="^[\d]*$" name="phone"/>
                        <div className="item-title">角色</div>
                        <SelectTree admin_group={this.props.role_list} defaultTitle="请选择"/>
                        <div className="item-title">状态</div>
                        <select name="status" id="">
                            <option value="">请选择</option>
                            <option value="1">正常</option>
                            <option value="2">禁用</option>
                        </select>
                        <div className="item-title">性别</div>
                        <label><input name="sex" type="radio" value="1" />男</label>
                        <label><input name="sex" type="radio" value="2" />女</label>
                    </Form>
                </div>
            </div>);
    }
}
export default connect(({editAdmin}) => ({editAdmin}))(EditAdmin);


