/**
 * Created by sucksuck on 2017/6/24.
 */
import React from 'react';
import {connect} from 'react-redux';
import * as platformAction from '../../../../action/platform';
import * as utilAction from '../../../../action/util';

class SinglePermission extends React.Component {
    constructor(props) {
        super(props);
        this.state = props["platformRole"];

    }

    componentDidMount() {
        platformAction.rolePermissionList({id: this.props.id});
    }

    componentWillReceiveProps(props) {
        this.state = props['platformRole'];
        this.state.check = {};
        this.forceUpdate();
    }

    onClick(type) {
        platformAction.rolePermissionList({id: this.props.id});
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    onChecked(item, subItem) {
        if (subItem) {
                //数字转换成字符串取值
                if ((this.state.check[`${item.id}`] & Math.pow(2, subItem.value)) === Math.pow(2, subItem.value)) {
                    /*如果匹配成功是已勾选的状态下干掉子集*/
                    this.state.check[`${item.id}`] = this.state.check[`${item.id}`] ^ Math.pow(2, subItem.value);
                } else {
                    /*未勾选有两种情况*/
                    if (this.state.check[`${item.id}`] === undefined) {
                        this.state.check[`${item.id}`] = 0;
                    }
                    this.state.check[`${item.id}`] = this.state.check[`${item.id}`] | Math.pow(2, subItem.value);
                }
            } else {
            if ((this.state.check[`${item.id}`] & 1) === 1) {
                    //如果匹配成功是已勾选的状态下干掉子集
                     delete this.state.check[`${item.id}`];
                } else {
                    this.state.check[`${item.id}`] = 1;
                }
            }
            this.forceUpdate();
    }

    getCheck(item, subItem) {
        if (subItem) {
            if ((this.state.check[`${item.id}`] & Math.pow(2, subItem.value)) === Math.pow(2, subItem.value)) {
                return ' checked';
            }
        } else {
            //前面第一个都被勾选
            if (this.state.check[`${item.id}`] & 1 === 1) {
                return ' checked';
            }
        }
        return "";
    }

    render() {
        return (
            <div className="set-permission">
                <div className="title">设置权限<div className="close" onClick={this.onClick.bind(this, 'cancel')}/></div>
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
                                                    let className = "checkbox" + this.getCheck(item, subItem);
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
                                            </tr>];
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
                                            }, this);
                                            trs.push(r1);
                                            return trs;
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
                    <button type="button" onClick={() => {
                        Object.keys(this.state.check).map(function(item,index){
                            this.state.check[item] = this.state.check[item] | 1;
                        }.bind(this));
                        utilAction.confirm("是否确认增加权限，请确认？", () => {
                            platformAction.setSinglePermission({
                                id: this.props.id,
                                permission: JSON.stringify(this.state.check),
                                operation: 1
                            });
                            return true;
                        });

                    }}>增加权限
                    </button>
                    <button onClick={() => {
                        utilAction.confirm("是否确认删除权限，请确认？", () => {
                            platformAction.setSinglePermission({
                                id: this.props.id,
                                permission: JSON.stringify(this.state.check),
                                operation: 2
                            });
                            return true;
                        });
                    }}>删除权限
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>
            </div>);
    }
}
export default connect(({platformRole}) => ({platformRole}))(SinglePermission);