/**
 * Created by lrx on 2017/7/21.
 */
import React from 'react';
import {connect} from 'react-redux';
import Search from '../../../../modules/search';
import Input from '../../../../modules/input';
import * as turntableQueryAction from '../../../../action/turntable/turntable_query'
import * as utilAction from '../../../../action/util';
import AbsTabContent from '../abs_tab_content';

const type = {
    0: "普通用户",
    1: "机器人",
    2: "测试号",
    3: "特殊用户",
    4: "客服号",
};

const module = 901;

class TurntableQuery extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['turntableQuery'];
    }

    componentDidMount() {
        // turntableQueryAction.getLogList();
    }

    componentWillReceiveProps(props) {
        this.state = props["turntableQuery"];
        this.forceUpdate();
    }

    componentWillUnmount() {
        turntableQueryAction.clearData();
    }

    onChange(value, e) {
        this.state.search[e.target.name] = value;
    }

    render() {
        return (
            <div className="turntable-query">
                <Search
                    defaultValue={this.state.search}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                    }}
                    onSubmit={() => {
                        turntableQueryAction.getLogList(this.state.search);
                    }}>
                    <div className="item">
                        <div>用户UID:</div>
                        <input type="text" name="user_id"/>
                    </div>
                </Search>
                {window.hasPermission(module, 1) ? <div className="recharge">
                    <div className="item">
                        <div>总充值金额:</div>
                        <Input verify="^[\d]*$" maxLength="9" name="recharge_amount"
                               value={this.state.search.recharge_amount}
                               onChange={this.onChange.bind(this)}/>
                    </div>
                    <div className="item">
                        <div>前三天充值:</div>
                        <Input verify="^[\d]*$" maxLength="9" name="three_days_recharge_amount"
                               value={this.state.search.three_days_recharge_amount}
                               onChange={this.onChange.bind(this)}/>
                    </div>
                    <div className="item">
                        <div>次数:</div>
                        <Input verify="^[\d]*$" name="count" maxLength="2" placeholder="最多10次"
                               value={this.state.search.count}
                               onChange={this.onChange.bind(this)}/>
                    </div>
                    <button onClick={() => {
                        if (this.state.user_info.user_id) {
                            if (this.state.search.recharge_amount == "" || this.state.search.three_days_recharge_amount == "" || this.state.search.count == "") {
                                utilAction.prompt("请输入完整信息");
                            } else {
                                turntableQueryAction.addCount(this.state.search);
                            }
                        } else {
                            utilAction.prompt("请先搜索查看用户转盘信息");
                        }
                    }}>添加
                    </button>
                </div> : null}

                <div className="table-main">
                    <table className="user-table">
                        <thead>
                        <tr>
                            <td>用户UID</td>
                            <td>总充值金额</td>
                            <td>前三天充值</td>
                            <td>当前剩余次数</td>
                            <td>转盘名称</td>
                            <td>转盘等级</td>
                            <td>类型</td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>{this.state.user_info.user_id || 0}</td>
                            <td>{this.state.user_info.recharge_amount || 0}</td>
                            <td>{this.state.user_info.three_days_recharge_amount || 0}</td>
                            <td>{this.state.user_info.count || 0}</td>
                            <td>{this.state.user_info.turntable_name || 0}</td>
                            <td>{this.state.user_info.level || 0}</td>
                            <td>{type[this.state.user_info.user_type] || 0}</td>
                        </tr>
                        </tbody>
                    </table>
                    <table className="amount-table">
                        <thead>
                        <tr>
                            <td>前三天充值金额判断条件</td>
                            <td>奖品编号</td>
                            <td>概率</td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>当3天内充值总额&lt;a</td>
                            <td>奖品1/奖品2/奖品3/奖品4/奖品5/奖品6</td>
                            <td>50%/30%/13%/7%/0%/0%</td>
                        </tr>
                        <tr>
                            <td>当3天内充值总额&ge;a，且&lt;a*1.5</td>
                            <td>奖品1/奖品2/奖品3/奖品4/奖品5/奖品6</td>
                            <td>10%/60%/18%/10%/2%/0%</td>
                        </tr>
                        <tr>
                            <td>当3天内充值总额&ge;a*1.5，且&lt;a*2</td>
                            <td>奖品1/奖品2/奖品3/奖品4/奖品5/奖品6</td>
                            <td>10%/18%/50%/16%/5%/1%</td>
                        </tr>
                        <tr>
                            <td>当3天内充值总额&ge;a*2，且&lt;a*2.5</td>
                            <td>奖品1/奖品2/奖品3/奖品4/奖品5/奖品6</td>
                            <td>3%/8%/18%/50%/13%/8%</td>
                        </tr>
                        <tr>
                            <td>当3天内充值总额&ge;a*2.5，且&lt;a*3</td>
                            <td>奖品1/奖品2/奖品3/奖品4/奖品5/奖品6</td>
                            <td>2%/8%/8%/12%/50%/20%</td>
                        </tr>
                        </tbody>
                    </table>
                    <table className="level-table">
                        <thead>
                        <tr>
                            <td>转盘等级</td>
                            <td>转盘名称</td>
                            <td>说明</td>
                            <td>奖品</td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>1</td>
                            <td>幸运大转盘</td>
                            <td>总充值0-4999，前三天充值a=100</td>
                            <td>1.满10减1红包；2.满20减2红包；3.满30减3红包；4.满50减4红包；5.3盘古币；6.5元盘古币；7.百草味 坚果组合750g；8.蒙牛特仑苏
                                低脂牛奶250ml*12 礼盒装
                            </td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>豪华大转盘</td>
                            <td>总充值5000-19999，前三天充值a=500</td>
                            <td>1.满100减5红包；2.满150减10红包；3.8盘古币；4.10盘古币；5.满200减15红包；6.20元盘古币；7.意大利费列罗(金莎)巧克力制品
                                24粒300g；8.100元话费卡
                            </td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td>至尊大转盘</td>
                            <td>总充值20000-49999，前三天充值a=500</td>
                            <td>1.满150减10红包；2.满200减15红包；3.15盘古币；4.20盘古币；5.满300减30红包；6.30元盘古币；7.荣耀手环zero，颜色随机；8.施华洛世奇天鹅项链
                                渐变色中号
                            </td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td>荣耀大转盘</td>
                            <td>总充值50000-99999，前三天充值a=1000</td>
                            <td>1.满500减10红包；2.满500减20红包；3.15盘古币；4.20盘古币；5.满500减30红包；6.40元盘古币；7.金条50g；8.iPhone 6S plus
                                128G
                            </td>
                        </tr>
                        <tr>
                            <td>5</td>
                            <td>铂金大转盘</td>
                            <td>总充值100000-199999，前三天充值a=1000</td>
                            <td>1.满800减20红包；2.满800减30红包；3.30盘古币；4.40盘古币；5.满1000减50红包；6.50元盘古币；7.Apple Macbook 12英寸 标配
                                256G闪存；8.金条100g
                            </td>
                        </tr>
                        <tr>
                            <td>6</td>
                            <td>钻石大转盘</td>
                            <td>总充值200000-399999，前三天充值a=1500</td>
                            <td>1.满1000减40红包；2.满1500减50红包；3.60盘古币；4.70盘古币；5.满2000减80红包；6.100元盘古币；7.金条100g；8.劳力士
                                潜航者系列手表1只
                            </td>
                        </tr>
                        <tr>
                            <td>7</td>
                            <td>王者大转盘</td>
                            <td>总充值400000-599999，前三天充值a=2000</td>
                            <td>1.满1500减100红包；2.满1500减120红包；3.150盘古币；4.160盘古币；5.满2000减150红包；6.200元盘古币；7.金条200g；8.周六福
                                18K金钻石戒指 1.1克拉
                            </td>
                        </tr>
                        <tr>
                            <td>8</td>
                            <td>财神大转盘</td>
                            <td>总充值&ge;600000，前三天充值a=2000</td>
                            <td>
                                1.满3000减200红包；2.满3000减230红包；3.240盘古币；4.260盘古币；5.满3000减250红包；6.300元盘古币；7.周生生18K白色黄金钻石项链全爱钻钻石项链88780N；8.凯迪拉克
                            </td>
                        </tr>
                        </tbody>
                    </table>

                </div>
            </div>
        )
    }
}

export default connect(({turntableQuery}) => ({turntableQuery}))(TurntableQuery);