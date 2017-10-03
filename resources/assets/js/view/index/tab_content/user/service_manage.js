/**
 * Created by lrx on 2017/6/2.
 */

import React from 'react';
import {connect} from 'react-redux';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging';
import Search from '../../../../modules/search';
import * as userManageAction from '../../../../action/user/user_manage';
import * as serviceManageAction from '../../../../action/user/service_manage';
import * as utilAction from '../../../../action/util';
import AbsTabContent from '../abs_tab_content';
import * as openWindow from '../../../../modules/open_window/user_manage_all_order';
import DateInput from '../../../../modules/date_input';
import Button from '../../../../modules/button';
import Select from '../../../../modules/select';

const head = [
    {"text": "UID", "key": "id", "type": "id", className: "pointer"},
    {"text": "昵称", "key": "nickname", className: "w200"},
    {"text": "平台", "key": "device", "type": "platform", className: "w50"},
    {"text": "推广渠道", "key": "channel", "type": "channel", className: "w80"},
    {"text": "注册方式", "key": "reg", "type": "reg"},
    {"text": "手机", "key": "phone", className: "w150"},
    {"text": "注册时间", "key": "create_at", className: "date"},
    {"text": "余额", "key": "residual_amount", className: ""},
    {"text": "总充值", "key": "recharge_amount", className: ""},
    {"text": "类型", "key": "type", "type": "type", className: "w60"},
    {"text": "状态", "key": "status", "type": "status", className: "w50"},
    {"text": "备注", "key": "remark", className: "w100"},
];
const head2 = [
    {"text": "UID", "key": "id", "type": "id", className: "pointer"},
    {"text": "昵称", "key": "nickname", className: "w200"},
    {"text": "平台", "key": "device", "type": "platform", className: "w50"},
    {"text": "推广渠道", "key": "channel", "type": "channel", className: "w80"},
    {"text": "注册方式", "key": "reg", "type": "reg"},
    {"text": "手机", "key": "phone", className: "w150"},
    {"text": "注册时间", "key": "create_at", className: "date"},
    {"text": "余额", "key": "residual_amount", className: ""},
    {"text": "总充值", "key": "recharge_amount", className: ""},
    {"text": "类型", "key": "type", "type": "type", className: "w60"},
    {"text": "状态", "key": "status", "type": "status", className: "w50"}
];
const platform = {
    1: "IOS",
    2: "安卓"
};
const type = {
    2: "测试号",
    3: "特殊用户",
    4: "客服号",
};
const status = {
    1: "正常",
    2: "禁用"
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
const module = 502;

class ServiceManage extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['serviceManage'];
    }

    componentDidMount() {
        serviceManageAction.userList(this.state.search);
    }

    componentWillReceiveProps(props) {
        this.state = props["serviceManage"];
        this.forceUpdate();
    }

    componentWillUnmount() {
        // serviceManageAction.serviceManageClear();
    }

    getColumnStyle(val, head, item) {
        if (head.type === "platform") {
            return (<div>{platform[val]}</div>)
        }
        if (head.type === "type") {
            return (<div>{type[val]}</div>)
        }
        if (head.type === "status") {
            return status[val];
        }
        if (head.type === "channel") {
            return (<div>{channel[val]}</div>);
        }
        if (head.type === "id") {
            return (window.hasPermission(509, 0) ?
                <div onClick={openWindow.serviceManageAllOrder.bind(this, item.id)}>{val}</div> : <div>{val}</div>);
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
        if (name === "recharge") {
            userManageAction.openChangeType(item, "2", this.state.search)
        }
        if (name === "type") {
            userManageAction.openChangeType(item, "4", this.state.search)
        }
        if (name === "remarks") {
            userManageAction.openChangeType(item, "3", this.state.search)
        }
        if (name === "unbundling") {
            if (!item.phone) {
                utilAction.prompt("没有可解绑的手机号", () => {
                    return true;
                })
            } else {
                utilAction.confirm("是否确定解绑用户" + item.id + "的手机号码，该操作不可恢复！", () => {
                    serviceManageAction.unbundling({id: item.id}, this.state.search);
                    return true;
                })
            }
        }
        if (name === "enable") {
            utilAction.confirm("是否确定禁用该用户，该操作不可恢复！", () => {
                serviceManageAction.enable({id: item.id}, this.state.search);
                return true;
            });
        }
        if (name === "amount") {
            openWindow.serviceAmount(item.id);
        }
        if (name == "nickname") {
            userManageAction.openChangeType(item, "5", this.state.search)
        }

    }


    render() {
        return (
            <div className="service-manage">
                <div className="navigator">
                    <Button>
                        <button key="1"
                                name="change"
                                module={module}
                                action="8"
                                onClick={serviceManageAction.openCreateService.bind(null,this.state.search)}
                        >新增客服号
                        </button>
                    </Button>
                </div>
                <Search
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                    }}
                    defaultValue={this.state.search}
                    onSubmit={() => {
                        this.state.search.page = 1;
                        serviceManageAction.userList(this.state.search);
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
                        <div>平台</div>
                        <Select name="device" object={true} opts={platform} defaultText="全部"/>
                    </div>
                    {window.hasPermission(502, 6) ? <div className="item">
                        <div>备注:</div>
                        <input type="text" name="remark"/>
                    </div> : null}

                    <div className="item">
                        <div>状态</div>
                        <Select name="status" object={true} opts={status} defaultText="全部"/>
                    </div>
                    <div className="item">
                        <div>用户类型</div>
                        <Select name="user_type" object={true} opts={type} defaultText="全部"/>
                    </div>
                    <div className="item">
                        <div>注册方式</div>
                        <Select name="reg" object={true} opts={reg} defaultText="全部"/>
                    </div>
                    <DateInput title="注册时间" name="12" start="create_start_time" end="create_end_time"/>
                    <div className="error">{this.state.uid_type}</div>
                </Search>
                <SimpleTable
                    head={window.hasPermission(502, 6) ? head : head2}
                    checkbox={false}
                    rows={this.state.rows}
                    getColumnStyle={this.getColumnStyle.bind(this)}
                    onItemButtonClick={this.onItemButtonClick.bind(this)}
                >
                    <button module={module} action="4" type="button" compare="${type}!==3" name="recharge">修改总充值金额
                    </button>
                    <button module="511" action="0" type="button" compare="${type}!==3" name="amount">金额日志</button>
                    <button module={module} action="1" type="button" compare="${type}!==3" name="type">修改类型</button>
                    <button module={module} action="3" type="button" compare="${type}!==3" name="remarks">修改备注</button>
                    <button module={module} action="2" type="button" compare="${type}!==3" name="unbundling">解绑手机
                    </button>
                    <button module={module} action="5" type="button" compare="${status}==1&&${type}!==3" name="enable">
                        禁用
                    </button>
                    <button module={module} action="7" type="button" compare="${type}==3" name="nickname">修改昵称</button>
                </SimpleTable>
                <Paging
                    total={this.state.total}
                    page={this.state.search.page}
                    onPaginate={(page, page_size) => {
                        this.state.search.page = page;
                        this.state.search.page_size = page_size;
                        serviceManageAction.userList(this.state.search)
                    }}
                />

            </div>
        )
    }
}

export default connect(({serviceManage}) => ({serviceManage}))(ServiceManage);