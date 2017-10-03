/**
 * Created by sucksuck on 2017/4/10.
 */

import React from 'react'
import {connect} from 'react-redux'
import SimpleTable from '../../../../modules/simple_table'
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search'
import * as platformAction from '../../../../action/platform'
import * as utilAction from '../../../../action/util'
import * as menuActive from '../../../../action/menu'
import AbsTabContent from '../abs_tab_content'
import {NavLink} from 'react-router-dom'
import SelectTree from '../../../../modules/select_tree'
import {Select, Popconfirm, message} from 'antd'
import { HashRouter as Router, Route, Switch, Link, withRouter } from 'react-router-dom';
import { Breadcrumb, Alert } from 'antd';

const Option = Select.Option
const children = []
for (let i = 10; i < 36; i++) {
    children.push(<Option key={i.toString(36) + i} value={i}>{i.toString(36) + i}</Option>)
}
const head = [
    {"text": "工号", "key": "employee_id", className: "w80"},
    {"text": "姓名", "key": "truename", className: ""},
    {"text": "账号", "key": "account", className: ""},
    {"text": "手机号码", "key": "phone", className: ""},
    {"text": "角色", "key": "title", "type": "title", className: "w150"},
    {"text": "状态", "key": "status", "type": "status", className: "w50"},
    {"text": "性别", "key": "sex", "type": "sex", className: "w50"},
    {"text": "注册时间", "key": "create_at", className: "date"},
    {"text": "最后登录", "key": "last_login_at", className: "date"}
]

const module = 1201

class Admin extends AbsTabContent {
    constructor(props) {
        super(props, module)
        //通过属性传递state过来
        this.state = props['platformAdmin']
        this.state.checkbox = false
        this.state.id = ''
        this.state.role_list = []
    }

    componentDidMount() {

    }

    componentWillMount() {  //render前执行一次 以后再也不执行
        platformAction.getRoleGroup()
        this.state.search.group_id = ""
        platformAction.getPlatformAdmin(this.state.search)
    }

    componentWillReceiveProps(props) {
        this.state = props["platformAdmin"]
        this.forceUpdate()
    }

    getColumnStyle(val, head, item) {
        if (head.type === "sex") {
            if (val === 1) {
                return "男"
            } else {
                return "女"
            }
        }
        if (head.type === "status") {
            if (val === 1) {
                return "正常"
            } else if (val === 2) {
                return "禁用"
            }
        }
    }

    onItemButtonClick(item, name) {
        if (name == "enable") {
            // if (item.status == 1) {
            //     platformAction.enableAdmin({id: item.id, status: 2}, this.state.search)
            //     // platformAction.getPlatformAdmin(this.state.search);
            // } else if (item.status == 2) {
            //     platformAction.enableAdmin({id: item.id, status: 1}, this.state.search)
            //     // platformAction.getPlatformAdmin(this.state.search);
            // }
        }
        if (name == "edit") {
            platformAction.openEditAdmin(item, this.state.search, this.state.admin_group)
        }
        if (name == "delete") {
            utilAction.confirm("是否确认删除管理员" + item.truename + "，该操作不可恢复，请确认？", () => {
                platformAction.deleteAdmin({id: item.id}, this.state.search)
                return true
            })
        }
        if (name == "reset") {
            utilAction.confirm("是否确定重置" + item.truename + "的密码？该操作不可恢复！新密码将发送到" + item.truename + "的手机号码", () => {
                platformAction.resetPsw({id: item.id})
                return true
            })
        }
        if (name == "permission") {
            this.state.id = item.id
            platformAction.setPermission()
            this.forceUpdate()
        }
        if (name === "data_permission") {
            platformAction.dataPermission(item, this.state.admin_group)
        }
        if (name == "visit_site") {
            platformAction.visitSite(item.id)
        }
    }

    handleChange(value) {
        console.log(value)
    }

    render() {
        return (
            <div className="admin-list">
                <Search
                    defaultValue={this.state.search}
                    onSubmit={() => {
                        this.state.search.page = 1
                        platformAction.getPlatformAdmin(this.state.search)
                    }}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value
                        this.forceUpdate()
                    }}
                >
                    <div>
                        <select type="text" name="status">
                            <option value="">全部</option>
                            <option value="1">在职</option>
                            <option value="2">禁用</option>
                        </select>
                        <input type="text" name="employee_id" placeholder="输入工号、姓名或账号"/>
                        <SelectTree defaultValue={this.state.search.group_id} admin_group={this.state.admin_group}
                                    defaultTitle="全部角色"/>
                        <Select
                            mode="multiple"
                            placeholder="Please select"
                            size="large"
                            style={{width: '250px', marginLeft: '8px'}}
                            onChange={this.handleChange}
                        >
                            {children}
                        </Select>
                    </div>
                    {window.hasPermission(1202, 1) ? <button className="add" type="button" onClick={() => {
                        platformAction.openCreateAdmin(this.state.search, this.state.admin_group)
                    }}>新建管理员
                    </button> : null}
                </Search>
                <SimpleTable
                    head={head}
                    rows={this.state.rows}
                    checkbox={false}
                    getColumnStyle={this.getColumnStyle.bind(this)}
                    onItemButtonClick={this.onItemButtonClick.bind(this)}
                    ref="table">
                    <button module={module} action="1" compare="${status}==2" name="enable">
                        禁用
                    </button>
                    <button module={module} action="1" compare="${status}==1" name="enable">
                        <Popconfirm placement="bottomLeft" title="确定要启用该管理员吗?" onConfirm={confirm} okText="Yes"
                                    cancelText="No">
                            启用
                        </Popconfirm></button>
                    <button module="1202" action="2" name="edit">编辑</button>
                    <button module={module} action="4" type="button" name="delete">删除</button>
                    <button module  ={module} action="2" type="button" name="reset">重置密码</button>
                    <button module="1205" type="button" action="0" name="permission">设置权限</button>
                    <button module={module} action="5" name="data_permission">数据权限</button>
                    <button module={module} action="6" name="visit_site">访问站点</button>
                    <NavLink module="1203" action="0" to={"/admin/log/${id}"} name="log">日志</NavLink>
                </SimpleTable>
                <Paging total={this.state.total}
                        page={this.state.search.page}
                        onPaginate={(page, page_size) => {
                            this.state.search.page = page
                            this.state.search.page_size = page_size
                            platformAction.getPlatformAdmin(this.state.search)
                        }}/>
            </div>
        )
    }
}


export default connect(({platformAdmin}) => ({platformAdmin}))(Admin)
