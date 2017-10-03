/**
 * Created by lrx on 2017/5/31.
 */

import React from 'react';
import * as userManageAction from '../../../../action/user/user_manage'
import * as serviceManageAction from '../../../../action/user/service_manage'
import * as utilAction from '../../../../action/util';
import Input from '../../../../modules/input';
const module = 501;
class ChangeType extends React.Component {
    constructor(props) {
        super(props,module);
        this.state={
            type : this.props.item.type,
            recharge_amount: this.props.item.recharge_amount,
            remark:this.props.item.remark||'',
            nickname:this.props.item.nickname || ''
        };
    }

    componentDidMount() {

    }

    componentWillReceiveProps(props) {

    }

    onTypeSubmit(e){
        e.preventDefault();
        utilAction.confirm("是否确定修改",()=>{
            userManageAction.typeClose();
            userManageAction.getType({id:this.props.item.id,type:this.state.type},this.props.search);
            return true;
        })
    }
    onServiceTypeSubmit(e){
        e.preventDefault();
        utilAction.confirm("是否确定修改",()=>{
            userManageAction.typeClose();
            serviceManageAction.changeType({id:this.props.item.id,type:this.state.type},this.props.search);
            return true;
        })
    }
    onAmountSubmit(e){
        e.preventDefault();
        utilAction.confirm("是否确定修改",()=>{
            userManageAction.typeClose();
            serviceManageAction.changeAmount({id:this.props.item.id,recharge_amount:this.state.recharge_amount},this.props.search);
            return true;
        })
    }
    onRemarksSubmit(e){
        e.preventDefault();
        utilAction.confirm("是否确定修改",()=>{
            userManageAction.typeClose();
            serviceManageAction.changeRemark({id:this.props.item.id,remark:this.state.remark},this.props.search);
            return true;
        })
    }
    onNicknameSubmit(e){
        e.preventDefault();
        utilAction.confirm("是否确定修改",()=>{
            userManageAction.typeClose();
            serviceManageAction.changeNickname({id:this.props.item.id,nickname:this.state.nickname},this.props.search);
            return true;
        })
    }
    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }
    render() {
        return (
            <div className="change-type">
                {this.props.changes ==="1"?<div className="title">修改类型<div className="close" onClick={this.onClick.bind(this, 'cancel')}/></div>:null}
                {this.props.changes ==="2"?<div className="title">修改总充值金额<div className="close" onClick={this.onClick.bind(this, 'cancel')}/></div>:null}
                {this.props.changes ==="3"?<div className="title">修改备注<div className="close" onClick={this.onClick.bind(this, 'cancel')}/></div>:null}
                {this.props.changes ==="4"?<div className="title">修改类型<div className="close" onClick={this.onClick.bind(this, 'cancel')}/></div>:null}
                {this.props.changes ==="5"?<div className="title">修改昵称<div className="close" onClick={this.onClick.bind(this, 'cancel')}/></div>:null}
                <div className="user-info">
                    <div>
                        <div>用户UID</div>
                        <div>{this.props.item.id}</div>
                    </div>
                    <div>
                        <div>昵称</div>
                        <div>{this.props.item.nickname}</div>
                    </div>
                    <div>
                        <div>手机</div>
                        <div>{this.props.item.phone}</div>
                    </div>
                    <div>
                        <div>余额</div>
                        <div>{this.props.item.residual_amount}</div>
                    </div>
                    {window.hasPermission(module, 1)?
                        <div>
                            <div>总充值</div>
                            <div>{this.props.item.recharge_amount}</div>
                    </div>:null}
                </div>
                {this.props.changes === "1" ?
                    <form
                        onChange={(e) => {
                            this.state[e.target.name] = e.target.value;
                            this.forceUpdate()
                        }}
                        onSubmit={this.onTypeSubmit.bind(this)}
                    >
                        <div className="type">
                            <div>类型</div>
                            <select value={this.state.type} name="type">
                                <option value="0">普通用户</option>
                                <option value="2">测试号</option>
                                <option value="4">客服号</option>
                            </select>
                        </div>
                        <div className="button">
                            <button type="submit" onClick={this.onTypeSubmit.bind(this)} className="blue">保存</button>
                            <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                        </div>
                    </form>:null
                }
                {this.props.changes === "4" ?
                    <form
                        onChange={(e) => {
                            this.state[e.target.name] = e.target.value;
                            this.forceUpdate()
                        }}
                        onSubmit={this.onServiceTypeSubmit.bind(this)}
                    >
                        <div className="type">
                            <div>类型</div>
                            <select value={this.state.type} name="type">
                                <option value="0">普通用户</option>
                                <option value="2">测试号</option>
                                <option value="4">客服号</option>
                            </select>
                        </div>
                        <div className="button">
                            <button type="submit" onClick={this.onServiceTypeSubmit.bind(this)} className="blue">保存</button>
                            <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                        </div>
                    </form>:null
                }
                {this.props.changes === "2" ?
                    <form
                        onChange={(e) => {
                            this.state[e.target.name] = e.target.value;
                            this.forceUpdate()
                        }}
                        onSubmit={this.onAmountSubmit.bind(this)}
                    >
                        <div className="type">
                            <div>总充值金额</div>
                            <Input maxLength="10" name="recharge_amount" verify="^[\d]*$" />
                        </div>
                        <div className="button">
                            <button type="submit" onClick={this.onAmountSubmit.bind(this)} className="blue">保存</button>
                            <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                        </div>
                    </form>:null
                }
                {this.props.changes === "3" ?
                    <form
                        onChange={(e) => {
                            this.state[e.target.name] = e.target.value;
                            this.forceUpdate()
                        }}
                        onSubmit={this.onRemarksSubmit.bind(this)}
                    >
                        <div className="type">
                            <div>备注</div>
                            <textarea  value={this.state.remark} name="remark"/>
                        </div>
                        <div className="button">
                            <button type="submit" onClick={this.onRemarksSubmit.bind(this)} className="blue">保存</button>
                            <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                        </div>
                    </form>:null
                }
                {this.props.changes === "5" ?
                    <form
                        onChange={(e) => {
                            this.state[e.target.name] = e.target.value;
                            this.forceUpdate()
                        }}
                        onSubmit={this.onRemarksSubmit.bind(this)}
                    >
                        <div className="type">
                            <div>昵称</div>
                            <input value={this.state.nickname}  name="nickname"/>
                        </div>
                        <div className="button">
                            <button type="submit" onClick={this.onNicknameSubmit.bind(this)} className="blue">保存</button>
                            <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                        </div>
                    </form>:null
                }
            </div>
        )
    }
}
export default ChangeType;