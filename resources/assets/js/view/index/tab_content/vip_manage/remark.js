/**
 * Created by sucksuck on 2017/7/5.
 */

import React from 'react';
import {connect} from 'react-redux';
import * as userManageAction from '../../../../action/user/user_manage'
import * as serviceManageAction from '../../../../action/user/service_manage'
import * as vipAction from '../../../../action/vip_manage/vip_manage';
const module = 501;

class Remark extends React.Component {
    constructor(props) {
        super(props, module);
        this.state = props['editVip'];
    }

    componentWillMount() {
        vipAction.getVipInfo({id: this.props.item.id});

    }

    componentWillReceiveProps(props) {
        this.state = props['editVip'];
        this.forceUpdate();
    }


    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }
    componentWillUnmount() {
        vipAction.clearVipInfo();
    }

    render() {
        return (
            <div className="change-type">
                 <div className="title">修改备注
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="user-info">
                    <div>
                        <div>用户UID</div>
                        <div>{this.state.id}</div>
                    </div>
                    <div>
                        <div>昵称</div>
                        <div>{this.state.nickname}</div>
                    </div>
                    <div>
                        <div>手机</div>
                        <div>{this.state.phone}</div>
                    </div>
                </div>
                <form
                    onChange={(e) => {
                        this.state[e.target.name] = e.target.value;
                        this.forceUpdate();
                    }}
                    onSubmit={(e)=>{
                        e.preventDefault();
                        vipAction.editRemark(this.state,this.props.search)
                    }}
                >
                    <div className="type">
                        <div>备注</div>
                        <textarea name="user_remake" maxLength="200" value={this.state.user_remake}/>
                    </div>
                    <div className="button">
                        <button type="submit" className="blue">保存</button>
                        <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                    </div>
                </form>
            </div>
        )
    }
}
export default connect(({editVip}) => ({editVip}))(Remark);
