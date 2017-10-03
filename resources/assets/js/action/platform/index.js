/**
 * Created by sucksuck on 2017/4/10.
 */
import React from 'react'
import * as utilAction from '../util'
import CreateAdmin from '../../view/index/tab_content/platform/create_admin'
import CreateRole from "../../view/index/tab_content/platform/create_role"
import EditAdmin from '../../view/index/tab_content/platform/edit_admin'
import EditRole from "../../view/index/tab_content/platform/edit_role"
import SetPermission from "../../view/index/tab_content/platform/set_permission"
import SinglePermission from '../../view/index/tab_content/platform/single_permission'
import * as authAction from "../auth"
import DataPermission from '../../view/index/tab_content/platform/data_permission'
import AdminLog from '../../view/index/tab_content/platform/admin_log'
import VisitSite from '../../view/index/tab_content/platform/visit_site'


export function getPlatformAdmin(id) {
    // console.log(id);
    window.ajax.post(window.config.root + '/platform/admin', id, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'PLATFORM_ADMIN_INIT',
                payload: ret.data
            })
        } else {
            utilAction.prompt(ret.msg)
        }
    })
}

export function getRoleGroup(form) {
    window.ajax.post(window.config.root + '/platform/admin/role_list', form, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'ADMIN_ROLE_GROUP_INIT',
                payload: ret.data
            })
        } else {
            console.log(ret.msg)
        }
    })
}
//创建管理员
export function createAdmin(form, search) {
    window.ajax.post(window.config.root + '/platform/admin_info/create', form, function (ret) {
        if (ret.errcode == 0) {
            utilAction.close("createAdmin")
            utilAction.prompt(ret.msg)
            getPlatformAdmin(search)
        } else {
            utilAction.prompt(ret.msg)
        }
    })
}

export function clear() {
    window.store.dispatch({
        type: "ADMIN_INFO_CLEAR"
    })
}
//修改密码
export function changePwd(form) {
    window.ajax.post(window.config.root + '/platform/admin/changepwd', form, function (ret) {
        if (ret.errcode == 0) {
            utilAction.prompt(ret.msg)
            window.store.dispatch({
                type: 'PASSWORD_CHANGE',
                payload: ret.data
            })
        } else {
            utilAction.prompt(ret.msg)
        }
    })
}

//登出
export function logOut() {
    window.ajax.post(window.config.root + '/auth/logout', function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'LOGOUT',
                payload: ret.data
            })
        } else {
            utilAction.prompt(ret.msg)
        }
    })
}

//打开新建管理员
export function openCreateAdmin(search, role_list) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("createAdmin")
        }
    }
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "createAdmin",
            // slide: true,
            fade: true,
            view: <CreateAdmin onClick={call} search={search} role_list={role_list}/>
        }
    })
}
//打开编辑管理员
export function openEditAdmin(item, search, role_list) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("editAdmin")
        }
    }
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "editAdmin",
            fade: true,
            view: <EditAdmin onClick={call} extend={item} role_list={role_list} search={search}/>
        }
    })
}


//启用 管理员
export function enableAdmin(form, search) {
    window.ajax.post(window.config.root + '/platform/admin/status', form, function (ret) {
        if (ret.errcode == 0) {
            getPlatformAdmin(search)
        } else {
            utilAction.prompt(ret.msg)
        }
    })
}

//编辑管理员信息
export function editAdminInfo(form, search) {
    window.ajax.post(window.config.root + '/platform/admin_info/edit', form, function (ret) {
        if (ret.errcode == 0) {
            utilAction.prompt(ret.msg)
            utilAction.close("editAdmin")
            getPlatformAdmin(search)
        } else {
            utilAction.prompt(ret.msg)
        }
    })
}

//编辑个人信息
export function editMyInfo(form,) {
    window.ajax.post(window.config.root + '/platform/admin_info/my_info', form, function (ret) {
        if (ret.errcode == 0) {
            utilAction.prompt(ret.msg)
            utilAction.close("adminInfo")
            authAction.autoLogin()
        } else {
            utilAction.prompt(ret.msg)
        }
    })
}


//获取管理员信息
export function adminInfo(id) {
    window.ajax.post(window.config.root + '/platform/admin_info', id, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'ADMIN_INFO_INIT',
                payload: ret.data
            })
        } else {
            utilAction.prompt(ret.msg)
        }
    })

}

//删除管理员
export function deleteAdmin(id, search) {
    window.ajax.post(window.config.root + '/platform/admin/del', id, function (ret) {
        if (ret.errcode == 0) {
            utilAction.prompt(ret.msg)
            getPlatformAdmin(search)
        } else {
            utilAction.prompt(ret.msg)
        }
    })
}

//重置密码
export function resetPsw(id) {
    window.ajax.post(window.config.root + '/platform/admin/resetPwd', id, function (ret) {
        if (ret.errcode == 0) {
            utilAction.prompt(ret.msg)
        } else {
            utilAction.prompt(ret.msg)
        }
    })
}
//设置权限*/
export function setPermission() {
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "setPermission",
            fade: true,
            view: <SetPermission/>
        }
    })
}
//设置权限关窗*/
export function permissionClose() {
    window.store.dispatch({
        type: "DIALOG_CLOSE",
        payload: "setPermission"
    })
}
//管理员角色权限列表

export function adminPermissionList(form) {
    window.ajax.post(window.config.root + '/platform/admin_permission', form, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'ADMIN_PERMISSION_LIST',
                payload: ret.data,
            })
        } else {
            console.log(ret.msg)
        }
    })
}
//保存权限*/
export function saveAdminPermission(form) {
    window.ajax.post(window.config.root + '/platform/admin_permission/edit_permission', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg)
        } else {
            permissionClose()
        }
    })
    return true
}


//角色权限列表
export function rolePermissionList(form) {
    window.ajax.post(window.config.root + '/platform/role/permission', form, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'PERMISSION_LIST',
                payload: {...ret.data, select: form.id}
            })
        } else {
            console.log(ret.msg)
        }
    })
}
//保存权限*/
export function savePermission(form) {
    // console.log(form.permission);
    window.ajax.post(window.config.root + '/platform/role/edit_permission', form, function (ret) {
        if (ret.errcode == 0) {
            utilAction.prompt(ret.msg)
        } else {
            utilAction.prompt(ret.msg)
        }
    })
}
//角色列表*/
export function roleList() {
    window.ajax.post(window.config.root + '/platform/role/execute', function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'ROLE_LIST',
                payload: ret.data
            })
        } else {
            console.log(ret.msg)
        }
    })
}
//创建角色弹框*/
export function createRole(type, id) {
    console.log(id)
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "createRole",
            fade: true,
            view: <CreateRole type={type} id={id}/>
        }
    })
}
//关窗*/
export function creatClose() {
    window.store.dispatch({
        type: "DIALOG_CLOSE",
        payload: "createRole"
    })
}
//保存角色*/
export function saveRole(form) {
    if (!form.pid) {
        form = {title: form.title}
    }
    window.ajax.post(window.config.root + '/platform/role/create', form, function (ret) {
        // console.log(form);
        if (ret.errcode) {
            utilAction.prompt(ret.msg)
        } else {
            creatClose()
            roleList()
        }
    })
    return true
}
//编辑角色弹窗*/
export function editRole(type) {
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "editRole",
            fade: true,
            view: <EditRole type={type}/>
        }
    })
}
//编辑关窗*/
export function editClose() {
    window.store.dispatch({
        type: "DIALOG_CLOSE",
        payload: "editRole"
    })
}
//保存编辑角色*/
export function saveEdit(form) {
    window.ajax.post(window.config.root + '/platform/role/edit', form, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: "DIALOG_CLOSE",
                payload: "editRole"
            })
            editClose()
            roleList()
        } else {
            utilAction.prompt(ret.msg)
        }
    })
    return true
}
//删除角色*/
export function deletRole(id) {
    window.ajax.post(window.config.root + '/platform/role/del', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg)
        } else {
            roleList()
        }
    })
    return true
}
//应用到所有角色更新管理员权限*/
export function updateAdminPermission(id) {
    window.ajax.post(window.config.root + '/platform/role/update_admin_permission', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg)
        } else {
            utilAction.prompt(ret.msg)
            roleList()
        }
    })
    return true
}

//打开设置权限
export function singlePermission(id) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("singlePermission")
        }
    }
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "singlePermission",
            fade: true,
            view: <SinglePermission onClick={call} id={id}/>
        }
    })
}
//修改设置权限
export function setSinglePermission(form) {
    window.ajax.post(window.config.root + '/platform/role/single_permission', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg)
        } else {
            utilAction.prompt(ret.msg)
            rolePermissionList({id: form.id})
            utilAction.close("singlePermission")
        }
    })
}

//打开数据权限
export function dataPermission(item, admin_list) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("dataPermission")
        }
    }
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "dataPermission",
            fade: true,
            view: <DataPermission onClick={call} admin_list={admin_list} item={item}/>
        }
    })
}
//获取数据权限/访问站点
export function getAdminInfo(id) {
    window.ajax.post(window.config.root + '/platform/admin/get_admin_info', id, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'DATA_PERMISSION_INIT',
                payload: ret.data
            })
        } else {
            utilAction.prompt(ret.msg)
        }
    })

}
//保存数据权限
export function setDataPermission(form) {
    window.ajax.post(window.config.root + '/platform/admin/data_permission', form, function (ret) {
        if (ret.errcode == 0) {
            utilAction.close("dataPermission")
        } else {
            utilAction.prompt(ret.msg)
            utilAction.close("dataPermission")
        }
    })

}
//保存访问站点
export function setVisitSite(form) {
    window.ajax.post(window.config.root + '/platform/admin/visit_site', form, function (ret) {
        if (ret.errcode == 0) {
            utilAction.close("visitSite")
        } else {
            utilAction.prompt(ret.msg)
        }
    })

}

//打开访问站点
export function visitSite(id) {
    let call = function (type) {
        if (type === "cancel") {
            utilAction.close("visitSite")
        }
    }
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "visitSite",
            fade: true,
            view: <VisitSite onClick={call} id={id}/>
        }
    })
}

//管理员平台 日志
export function getAdminLog(id) {
    window.ajax.post(window.config.root + '/platform/log', id, function (ret) {
        if (ret.errcode == 0) {
            window.store.dispatch({
                type: 'ADMIN_LOG_INIT',
                payload: ret.data
            })
        } else {
            utilAction.prompt(ret.msg)
        }
    })
}

