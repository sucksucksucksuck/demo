/**
 * Created by sucksuck on 2017/6/27.
 */
import React from 'react';
import {connect} from 'react-redux';
import * as platformAction from '../../../../action/platform';
import * as utilAction from '../../../../action/util';
import SelectTree from '../../../../modules/select_tree';

class DataPermission extends React.Component {
    constructor(props) {
        super(props);
        this.state = props["dataPermission"];

    }

    componentDidMount() {

    }

    componentWillMount() {
        platformAction.getAdminInfo({id: this.props.item.id});

    }

    componentWillReceiveProps(props) {
        this.state = props['dataPermission'];
        this.state.check = {};
        this.forceUpdate();
    }

    componentWillUnmount() {
        platformAction.clear();
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    onchecked(id) {
        this.state.info.type = id;
        if (id == 4) {
            this.state.info.lock[0] = this.state.info.group_id;
        }
        this.forceUpdate();
    }

    onDefaultChange(e) {
        if (this.state.lock[0]) {
            this.state.lock.splice(0, 1);
            this.state.lock[0] = e.target.value;
        } else {
            this.state.lock[0] = e.target.value;
        }
        this.forceUpdate();
    }

    onAddchange(index, e) {
        this.state.lock[index] = e.target.value;
        this.forceUpdate();
    }

    render() {
        return (
            <div className="data-permission">
                <div className="title">数据权限
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="user-info">
                    <div>
                        <div>姓名</div>
                        <div>{this.props.item.truename}</div>
                    </div>
                    <div>
                        <div>角色</div>
                        <div>{this.props.item.title}</div>
                    </div>
                    <div>
                        <div>账号</div>
                        <div>{this.props.item.account}</div>
                    </div>
                    <div>
                        <div>手机</div>
                        <div>{this.props.item.phone}</div>
                    </div>
                </div>
                <div className="content">
                    <button className={this.state.info.type == "1" ? "blue" : ""} onClick={this.onchecked.bind(this, 1)}
                            type="button">本人的数据
                    </button>
                    <button className={this.state.info.type == "2" ? "blue" : ""} onClick={this.onchecked.bind(this, 2)}
                            type="button">下级的数据
                    </button>
                    <button className={this.state.info.type == "3" ? "blue" : ""} onClick={this.onchecked.bind(this, 3)}
                            type="button">下级及本组的数据
                    </button>
                    <div className={this.state.info.type == "4" ? "all-data" : "mgl"}>
                        <button className={this.state.info.type == "4" ? "blue" : ""}
                                onClick={this.onchecked.bind(this, 4)}
                                type="button">全部的数据
                        </button>
                    </div>

                    {this.state.info.type == "4" && this.state.lock.length == 0 ?
                        <div className="select">查询节点
                            <SelectTree admin_group={this.props.admin_list}
                                        defaultValue={this.state.lock[0]}
                                        defaultTitle="查询节点"
                                        onHandleChange={this.onDefaultChange.bind(this)}/>
                            <span className="add" onClick={() => {
                                this.state.lock.push(0);
                                this.forceUpdate();
                            }}> +</span></div> : null}
                    {this.state.info.type == "4" && this.state.lock.length !== 0 ? this.state.lock.map(function (item, index) {
                        if (!index) {
                            return <div key={index} className="select">查询节点
                                <SelectTree admin_group={this.props.admin_list} defaultValue={this.state.lock[index]}
                                            defaultTitle="查询节点" onHandleChange={this.onAddchange.bind(this, index)}/>
                                <span className="add" onClick={() => {
                                    this.state.info.lock.push(0);
                                    this.forceUpdate();
                                }}> +</span></div>
                        } else {
                            return <div key={index} className="select">　　　　<SelectTree admin_group={this.props.admin_list}
                                                                                   defaultValue={this.state.lock[index]}
                                                                                   defaultTitle="查询节点"
                                                                                   onHandleChange={this.onAddchange.bind(this, index)}/>
                                <span onClick={() => {
                                    this.state.lock.splice(index, 1);
                                    this.forceUpdate();
                                }}> x</span></div>
                        }
                    }.bind(this)) : null}
                </div>
                <div className="button">
                    <button type="button" onClick={() => {
                        this.state.info.id = this.props.item.id;
                        let arr = [];
                        for (let c in this.state.lock) {
                            if (this.state.lock[c]) {
                                arr.push(this.state.info.lock[c]);
                            }
                        }
                        this.state.info.lock = JSON.stringify(arr);
                        platformAction.setDataPermission(this.state.info);
                    }}>保存
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>
            </div>);
    }
}

export default connect(({dataPermission}) => ({dataPermission}))(DataPermission);