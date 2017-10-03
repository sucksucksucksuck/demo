import React from 'react'
import {connect} from 'react-redux'
import * as platformAction from './../../../../action/platform'
import * as utilAction from '../../../../action/util'
import AbsTabContent from '../abs_tab_content'
const module = 1204
class Role extends AbsTabContent {
    constructor(props) {
        super(props, module)
        this.state = props['platformRole']
        this.state.className = []
        this.state.id = this.state.selected
        this.state.pid = ''
        this.state.roleName = ''
    }

    componentWillMount() {
        platformAction.roleList()
    }

    componentWillReceiveProps(props) {
        this.state = props['platformRole']
        this.forceUpdate()
    }

    onChecked(item, subItem) {
        if (window.hasPermission(module, 6)) {
            if (subItem) {
                //数字转换成字符串取值
                if ((this.state.check[`${item.id}`] & Math.pow(2, subItem.value)) === Math.pow(2, subItem.value)) {
                    /*如果匹配成功是已勾选的状态下干掉子集*/
                    this.state.check[`${item.id}`] = this.state.check[`${item.id}`] ^ Math.pow(2, subItem.value)
                } else {
                    /*未勾选有两种情况*/
                    if (this.state.check[`${item.id}`] === undefined) {
                        this.state.check[`${item.id}`] = 0
                    }
                    this.state.check[`${item.id}`] = this.state.check[`${item.id}`] | Math.pow(2, subItem.value) | 1
                }
            } else {
                if ((this.state.check[`${item.id}`] & 1) === 1) {
                    //如果匹配成功是已勾选的状态下干掉子集
                    delete this.state.check[`${item.id}`]
                } else {
                    this.state.check[`${item.id}`] = 1
                }
            }
            this.forceUpdate()
        }

    }

    getCheck(item, subItem) {
        if (subItem) {
            if ((this.state.check[`${item.id}`] & Math.pow(2, subItem.value)) === Math.pow(2, subItem.value)) {
                return ' checked'
            }
        } else {
            //前面第一个都被勾选
            if (this.state.check[`${item.id}`] & 1 === 1) {
                return ' checked'
            }
        }

        return ""
    }

    printRole(items) {
        return items.map(function (item, index) {
            return (
                <div className="role-option" key={index}>
                    <div className={"item" + (item.id === this.state.selected ? " active" : "")} onClick={() => {
                        this.state.id = item.id
                        this.state.pid = item.pid
                        this.state.roleName = item.title
                        this.forceUpdate()
                        platformAction.rolePermissionList({id: item.id})
                    }}>
                        <div className="title">{item.title}</div>
                        {window.hasPermission(module, 3) ?
                            <div className="edit" onClick={platformAction.editRole.bind(this, item.type)}/> : null }
                        {window.hasPermission(module, 4) ? <div className="delete"
                                                                onClick={utilAction.confirm.bind(this, '是否确认要删除该角色，该操作不可恢复', platformAction.deletRole.bind(this, {id: item.id}, false))}/> : null }
                        {window.hasPermission(module, 2) ?
                            <div className="add" onClick={platformAction.createRole.bind(this, item.type)}/> : null }
                    </div>
                    {item.son ? this.printRole(item.son) : null}
                </div>
            )
        }, this)
    }

    render() {
        return (
            <div className="role-tab-content">
                <div className="role-option-wrap">
                    <div className="role-create">
                        {window.hasPermission(module, 2) ?
                            <button type="button" className="role-add"
                                    onClick={() => {
                                        this.forceUpdate()
                                        if (this.state.id) {
                                            platformAction.createRole(null, this.state.id)
                                        } else {
                                            platformAction.createRole(null, 0)
                                        }
                                    }
                                    }><span> + </span><span>新建角色</span>
                            </button> : null}
                        {window.hasPermission(module, 5) ?
                            <button type="button"
                                    onClick={ platformAction.updateAdminPermission.bind(this, {id: this.state.id})}>
                                应用到所有角色
                            </button> : null}
                        {window.hasPermission(module, 7) ?
                            <button type="button"
                                    onClick={platformAction.singlePermission.bind(this, this.state.id)}>
                                修改权限
                            </button> : null}
                    </div>
                    <div className="role-options">
                        {this.printRole(this.state.roleList)}
                    </div>
                </div>
                <div className="role-now-wrap">
                    <div className="role-now">
                        <div className="role-table">
                            <div className="role-permisson">
                                <table>
                                    <thead >
                                    <tr>
                                        <td>菜单模块</td>
                                        <td>功能权限</td>
                                    </tr>
                                    </thead>
                                    {(this.state.bigPermisson).map(function (item, index) {
                                        return (
                                            <tbody key={index}>
                                            <tr>
                                                <td className="big-td">
                                                    <div className={"checkbox" + this.getCheck(item, false)}
                                                         onClick={this.onChecked.bind(this, item, false)}>
                                                        {item.title}
                                                    </div>
                                                </td>
                                                <td>
                                                    {item.button.map(function (subItem, subIndex) {
                                                        let className = "checkbox" + this.getCheck(item, subItem)
                                                        return (
                                                            <div key={subIndex}
                                                                 className={className}
                                                                 onClick={this.onChecked.bind(this, item, subItem)}>
                                                                {subItem.title}
                                                            </div>)
                                                    }, this)}
                                                </td>
                                            </tr>
                                            {item.son.map(function (smallItem, smallIndex) {
                                                let trs = [<tr key={smallIndex}>
                                                    <td>
                                                        <div
                                                            className={"checkbox" + this.getCheck(smallItem, false)}
                                                            onClick={this.onChecked.bind(this, smallItem, false)}
                                                        >
                                                            {smallItem.title}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {smallItem.button.map(function (subSmallItem, subSmallIndex) {
                                                            return (
                                                                <div key={subSmallIndex}
                                                                     className={"checkbox" + this.getCheck(smallItem, subSmallItem, false)}
                                                                     onClick={this.onChecked.bind(this, smallItem, subSmallItem)}>
                                                                    {subSmallItem.title}
                                                                </div>)
                                                        }, this)}
                                                    </td>
                                                </tr>]
                                                let r1 = smallItem.son.map(function (subSmallItem, subSmallIndex) {
                                                    return (
                                                        <tr key={subSmallIndex}>
                                                            <td className="td-small">
                                                                <div
                                                                    className={"checkbox" + this.getCheck(subSmallItem, false)}
                                                                    onClick={this.onChecked.bind(this, subSmallItem, false)}
                                                                >
                                                                    {subSmallItem.title}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {subSmallItem.button.map(function (subSmallItemS, subSmallIndexS) {
                                                                    return (
                                                                        <div key={subSmallIndexS}
                                                                             className={"checkbox" + this.getCheck(subSmallItem, subSmallItemS, false)}
                                                                             onClick={this.onChecked.bind(this, subSmallItem, subSmallItemS)}>
                                                                            {subSmallItemS.title}
                                                                        </div>)
                                                                }, this)}
                                                            </td>
                                                        </tr>
                                                    )
                                                }, this)
                                                trs.push(r1)
                                                return trs
                                            }, this)
                                            }
                                            </tbody>
                                        )
                                    }, this)
                                    }
                                </table>
                            </div>

                        </div>
                    </div>
                    <div className="btn">
                        {window.hasPermission(module, 6) ? <button onClick={() => {
                            platformAction.savePermission({
                                id: this.state.id,
                                permission: JSON.stringify(this.state.check)
                            }, false)
                        }
                        }>保存
                        </button> : null}
                    </div>
                </div>

            </div>
        )
    }
}
export default connect(({platformRole}) => ({platformRole}))(Role)






