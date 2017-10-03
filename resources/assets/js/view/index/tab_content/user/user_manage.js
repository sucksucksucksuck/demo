import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging';
import Search from '../../../../modules/search';
import * as userManageAction from '../../../../action/user/user_manage'
import * as utilAction from '../../../../action/util';
import * as openWindow from '../../../../modules/open_window/user_manage_all_order';
import AbsTabContent from '../abs_tab_content';
import DateInput from '../../../../modules/date_input';
import Select from '../../../../modules/select';

const head1 = [
    {"text": "UID", "key": "id", "type": "uid", className: "pointer"},
    {"text": "昵称", "key": "nickname",},
    {"text": "平台", "key": "device", "type": "platform", className: "w50"},
    {"text": "推广渠道", "key": "channel", "type": "channel", className: "w80"},
    {"text": "注册方式", "key": "reg", "type": "reg"},
    {"text": "手机", "key": "phone", className: "w120"},
    {"text": "注册IP", "key": "create_ip", "type": "create_ip", className: ""},
    {"text": "注册时间", "key": "create_at", className: "date"},
    {"text": "登录时间", "key": "last_login_at", className: "date"},
    {"text": "余额", "key": "residual_amount"},
    {"text": "总中奖", "key": "winning_amount"},
    {"text": "总消费", "key": "consumer_amount"},
    {"text": "总充值", "key": "recharge_amount"},
    {"text": "中奖率(%)", "key": "probability", "type": "win", className: "w80"},
    {"text": "类型", "key": "type", "type": "type", className: "w80"},
    {"text": "状态", "key": "status", "type": "status", className: "w50"},
];
const head2 = [
    {"text": "UID", "key": "id", "type": "uid", className: "pointer"},
    {"text": "昵称", "key": "nickname",},
    {"text": "平台", "key": "device", "type": "platform"},
    {"text": "推广渠道", "key": "channel", "type": "channel", className: "w80"},
    {"text": "注册方式", "key": "reg", "type": "reg"},
    {"text": "手机", "key": "phone"},
    {"text": "注册IP", "key": "create_ip", "type": "create_ip", className: ""},
    {"text": "注册时间", "key": "create_at", className: "date"},
    {"text": "登录时间", "key": "last_login_at", className: "date"},
    {"text": "余额", "key": "residual_amount", className: "w90"},
    {"text": "总充值", "key": "recharge_amount"},
    {"text": "类型", "key": "type", "type": "type", className: "w80"},
    {"text": "状态", "key": "status", "type": "status", className: "w50"},
];
const platform = {
    1: "IOS",
    2: "安卓"
};
const type = {
    0: "普通用户",
    1: "机器人",
    2: "测试号",
    4: "客服号",
};
const status = {
    1: "正常",
    2: "禁用"
};

const device = {
    "1": "IOS",
    "2": "安卓"
};

const recharge_times = {
    "1": "是",
    "2": "否"
};

const reg = {
    1: "手机",
    2: "微信",
    3: "QQ",
    4: "微博",
};
const channel = {
    pgyg: "本站推广",
    360: "360手机助手",
    txyyb: "腾讯应用宝",
    xmyysd: "小米应用商店",
    ppzs: "pp助手",
    wdj: "豌豆荚",
    mzyysd: "魅族应用商店",
    vivoyysd: "vivo应用商店",
    azsc02: "安智市场",
    mmy: "木蚂蚁",
    sgzs: "搜狗助手",
    yy: "优亿",
    lskfz: "乐视开发者",
    aqy: "爱奇艺",
    oppp: "oppo(可可)",
    bdsjzs: "百度手机助手",
    "91zs": "91助手(百度)",
    azsc01: "安卓市场(百度)",
    jfsc: "机锋市场",
};
const module = 501;

class UserManage extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['userManage'];
    }

    componentDidMount() {
        userManageAction.userList(this.state.search);
    }

    componentWillReceiveProps(props) {
        this.state = props["userManage"];
        this.forceUpdate();
    }

    componentWillUnmount() {
        // userManageAction.userManageClear();
    }

    getColumnStyle(val, head, item) {
        //判断列改样式
        if (head.type === "platform") {
            return (<div>{platform[val]}</div>);
        }
        if (head.type === "type") {
            return (<div>{type[val]}</div>);
        }
        if (head.type === "channel") {
            return (<div>{channel[val]}</div>);
        }
        if (head.type === "win") {
            return (<div>{val + "%"}</div>);
        }
        if (head.type === "uid") {
            return (window.hasPermission(508, 0) ?
                <div onClick={openWindow.userManageAllOrder.bind(this, item.id)}>{val}</div> : <div>{val}</div>);
        }
        if (head.type === "status") {
            return status[val];
        }
        if (head.type === "reg") {
            return reg[val];
        }
        if (head.type === "create_ip") {
            return (<div>
                <div>{val}</div>
                <div>{item.Address}</div>
            </div>);
        }

    }

    onItemButtonClick(item, name) {
        if (name === "change_type") {
            userManageAction.openChangeType(item, "1", this.state.search);
        }
        if (name === "amount") {
            openWindow.userAmount(item.id);
        }
        if (name === "recharge") {
            openWindow.userRecharge(item.id);
        }
        if (name === "unbundling") {
            if (!item.phone) {
                utilAction.prompt("没有可解绑的手机号", () => {
                    return true;
                });
            } else {
                utilAction.confirm("是否确定解绑用户" + item.id + "的手机号码，该操作不可恢复！", () => {
                    userManageAction.unbundling({id: item.id}, this.state.search);
                    return true;
                });
            }
        }
        if (name === "enable") {
            utilAction.confirm("是否确定禁用该用户，该操作不可恢复！", () => {
                userManageAction.enable({id: item.id}, this.state.search);

                return true;
            });
        }

    }


    render() {
        return (
            <div className="user-manage">
                <Search
                    defaultValue={this.state.search}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                    }}
                    onSubmit={() => {
                        this.state.search.page = 1;
                        userManageAction.userList(this.state.search);
                    }}>
                    <div className="item">
                        <div>用户UID:</div>
                        <input type="text" name="id"/>
                    </div>
                    <div className="item">
                        <div>用户昵称:</div>
                        <input type="text" name="nickname"/>
                    </div>
                    <div className="item">
                        <div>手机:</div>
                        <input type="text" name="phone"/>
                    </div>
                    <div className="item">
                        <div>注册IP:</div>
                        <input type="text" name="create_ip"/>
                    </div>
                    <div className="item">
                        <div>状态</div>
                        <Select name="status" object={true} opts={status} defaultText="全部"/>
                    </div>
                    <div className="item">
                        <div>推广渠道</div>
                        <Select name="channel" object={true} opts={channel} defaultText="全部"/>
                    </div>
                    <div className="item">
                        <div>平台</div>
                        <Select name="device" object={true} opts={device} defaultText="全部"/>
                    </div>
                    <div className="item">
                        <div>充值</div>
                        <Select name="recharge_times" object={true} opts={recharge_times} defaultText="全部"/>
                    </div>
                    <div className="item">
                        <div>注册方式</div>
                        <Select name="reg" object={true} opts={reg} defaultText="全部"/>
                    </div>
                    <DateInput title="注册时间" noWarn={true} start="create_start_time" end="create_end_time"/>
                    <DateInput title="登录时间" noWarn={true} start="login_start_time" end="login_end_time"/>
                    <div className="error">{this.state.uid_type}</div>
                </Search>
                <SimpleTable
                    head={window.hasPermission(module, 1) ? head1 : head2}
                    checkbox={false}
                    rows={this.state.rows}
                    getColumnStyle={this.getColumnStyle.bind(this)}
                    onItemButtonClick={this.onItemButtonClick.bind(this)}
                >
                    <button module={module} action="2" type="button" name="change_type">修改类型</button>
                    <button module="506" action="0" type="button" name="amount">金额日志</button>
                    <button module="507" action="0" type="button" name="recharge">充值日志</button>
                    <button module={module} action="3" type="button" name="unbundling">解绑手机</button>
                    <button module={module} action="4" type="button" compare="${status}==1" name="enable">禁用</button>
                </SimpleTable>
                <Paging
                    total={this.state.total}
                    page={this.state.search.page}
                    onPaginate={(page, page_size) => {
                        this.state.search.page = page;
                        this.state.search.page_size = page_size;
                        userManageAction.userList(this.state.search);
                    }}
                />
            </div>
        )
    }
}

export default connect(({userManage}) => ({userManage}))(UserManage);