/**
 * Created by sucksuck on 2017/7/4.
 */

import React from 'react';
import {connect} from 'react-redux';
import * as vipAction from '../../../../action/vip_manage/vip_manage';
import * as utilAction from '../../../../action/util';
import {NavLink} from 'react-router-dom';
import AbsTabContent from '../abs_tab_content';
import Button from '../../../../modules/button';
import SimpleTable from '../../../../modules/simple_table';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import Select from '../../../../modules/select';
// import * as paymentLog from './payment_log';
import SelectSearch from '../../../../modules/select_search';
const head = [
    {"text": "UID", "key": "user_id", className: ""},
    {"text": "昵称", "key": "nickname", "type": "nickname", className: " "},
    {"text": "手机号", "key": "phone", className: ""},
    {"text": "总充值金额", "key": "recharge_amount", className: "amount "},
    {"text": "今日充值", "key": "day_amount", className: "amount"},
    {"text": "当月充值", "key": "month_recharge_amount", className: "amount"},
    {"text": "上月充值", "key": "last_month_recharge_amount", className: "amount"},
    {"text": "最后充值时间", "key": "pay_create_at", className: "date"},
    {"text": "活跃度", "key": "active", "type": "active"},
    {"text": "主管", "key": "director_name", "type": "director_name"},
    {"text": "推广员", "key": "truename", "type": "truename"},
    {"text": "添加时间", "key": "create_at", className: "date"},
];

const module = 1501;

const day_pay = {
    "1": "是",
    "2": "否"
};

class TestTwo extends AbsTabContent {
    constructor(props) {
        super(props, module);
        //通过属性传递state过来
        this.state = props['vipManage'];
    }

    componentWillMount() {  //render前执行一次 以后再也不执行
        vipAction.getPromoters({type: 1, style: 2});
        vipAction.getPromoters({type: 3});
        this.initState(this.state.promoter_list);
        if (this.props.extend !== "[]") {
            this.state.search.page = 1;
            let extend = this.props.extend.split(",");
            this.state.search.promoters = extend[0];
            this.state.search.admin_status = extend[1];
            vipAction.getVipManage(this.state.search);
        } else {
            // this.state.search.promoters = "";
            vipAction.getVipManage(this.state.search);
        }
        this.forceUpdate();
    }

    initState(obj) {
        this.state.list = [];
        for (let c in obj) {
            let temp = {};
            temp[c] = obj[c];
            if (obj[c] == this.state.search.promoters) {
                this.state.search.option = c;
            }
            this.state.list.push(temp);
        }
    }

    componentWillReceiveProps(props) {
        this.state = props["vipManage"];
        this.initState(this.state.promoter_list);
        this.forceUpdate();
    }


    componentWillUnmount() {
        // vipAction.clear();
    }

    onHandleChange(hover) {
        this.state.search.option = hover;
    }


    onItemButtonClick(item, name) {
        if (name == "delete") {
            utilAction.confirm("是否确定从客户列表删除用户" + item.user_id + "，该操作不可恢复！", () => {
                vipAction.delVip({id: item.id}, this.state.search);
                return true;
            });
        } else if (name == "edit") {
            vipAction.vipInfo(this.state.promoter_list, item.id, this.state.search);
        } else if (name == "remark") {
            vipAction.remark(item, this.state.search);
        } else if (name == "recharge_log") {
            paymentLog.vipRecharge(item.user_id);
        } else if (name == "pay_log") {
            paymentLog.vipAmount(item.user_id);
        }
    }

    getColumnStyle(val, head, item) {
        if (head.type == "active") {
            if (val == 1) {
                return <div className="active"/>
            } else {
                return null;
            }
        }
        if (head.type == "truename") {
            return <div>
                <div>{val}</div>
                <div>{item.account}</div>
            </div>
        }
        if (head.type == "director_name") {
            return <div>
                <div>{val}</div>
                <div>{item.director_account}</div>
            </div>
        }
    }

    statusChange(admin_ststus) {
        this.state.search.admin_status = admin_ststus;
        this.state.search.page = 1;
        vipAction.getVipManage(this.state.search);
        this.forceUpdate();
    }

    render() {
        return (
            <div className="vip-list" onClick={(e) => {
                if (e.target.id !== "select" && e.target.id !== "span") {
                    this.state.show = false;
                    this.forceUpdate();
                }
            }}>
                <div className="navigator">
                    <div className="status">
                        <span className={this.state.search.admin_status == "1" ? "active" : null}
                              onClick={this.statusChange.bind(this, 1)}>正常客户</span>
                        <span className={this.state.search.admin_status == "2" ? "active" : null}
                              onClick={this.statusChange.bind(this, 2)}>公共客户</span>
                    </div>
                    <Button>
                        <button key="1"
                                name="change"
                                module={module}
                                action="5"
                                onClick={() => {
                                    let ids = this.refs['table'].getChecked();
                                    if (!ids.length) {
                                        utilAction.prompt("请先选择用户！");
                                    } else {
                                        vipAction.changePromoter(this.state.promoter_list, ids, this.state.search);
                                    }
                                }}
                        >更改推广员
                        </button>
                        <button key="2"
                                name="down"
                                module={module}
                                action="1"
                                type="create"
                                onClick={() => {
                                    vipAction.vipInfo(this.state.promoter_list, null, this.state.search);
                                }}
                        >添加客户
                        </button>
                    </Button>
                </div>
                <Search
                    defaultValue={this.state.search}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;

                    }}
                    onSubmit={() => {
                        this.state.search.page = 1;
                        if (this.state.search.option) {
                            if (this.state.search.option == "全部") {
                                this.state.search.promoters = "";
                            } else {
                                this.state.search.promoters = this.state.promoter_list[this.state.search.option];
                            }
                        } else {
                            this.state.search.promoters = "";
                        }
                        vipAction.getVipManage(this.state.search);
                    }}
                >
                    <div className="item">
                        <div>用户UID</div>
                        <input type="text" name="user_id"/>
                    </div>
                    <div className="item">
                        <div>用户昵称</div>
                        <input type="text" name="nickname"/>
                    </div>
                    <div className="item">
                        <div>手机</div>
                        <input type="text" name="phone"/>
                    </div>
                    <div className="item">
                        <div>今日是否充值</div>
                        <Select name="day_pay" object={true} opts={day_pay} defaultText="全部"/>
                    </div>
                    <div className="item">
                        <div>推广员</div>
                        <SelectSearch list={this.state.list} defaultValue={this.state.search.option}
                                      promoter_list={this.state.promoter_list}
                                      onHandleChange={this.onHandleChange.bind(this)}/>
                    </div>

                    <div className="item">
                        <div>主管</div>
                        <Select name="director" opts={this.state.director_list} value="id" text="truename"
                                defaultText="全部"/>
                    </div>
                </Search>
                <SimpleTable
                    head={head}
                    rows={this.state.rows}
                    ref="table"
                    getColumnStyle={this.getColumnStyle.bind(this)}
                    onItemButtonClick={this.onItemButtonClick.bind(this)}
                >
                    <button name="recharge_log"
                            module="1502"
                            action="0">充值记录
                    </button>
                    <button name="pay_log"
                            module="1503"
                            action="0">购买记录
                    </button>
                    <button name="remark"
                            module={module}
                            action="4">备注
                    </button>
                    <button name="edit"
                            module={module}
                            action="2">编辑
                    </button>
                    <button name="delete"
                            module={module}
                            action="3">删除
                    </button>
                </SimpleTable>
                <Paging
                    total={this.state.total}
                    page={this.state.search.page}
                    onPaginate={(page, page_size) => {
                        this.state.search.page = page;
                        this.state.search.page_size = page_size;
                        vipAction.getVipManage(this.state.search);
                    }}
                />
            </div>
        )
    }
}

export default connect(({vipManage}) => ({vipManage}))(TestTwo);