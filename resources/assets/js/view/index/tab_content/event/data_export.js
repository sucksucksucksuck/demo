/**
 * Created by sucksuck on 2017/5/26.
 */


import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom'
import * as eventAction from '../../../../action/event/data_export';
import AbsTabContent from '../abs_tab_content';
import Form from '../../../../modules/form';
import * as utilAction from '../../../../action/util';
const prize_type = [
    {
        id: 1,
        title: "实物"
    },
    {
        id: 2,
        title: "虚拟"
    }, {
        id: 3,
        title: "红包"
    }, {
        id: 4,
        title: "盘古币"
    }, {
        id: 5,
        title: "积分"
    }];
const user_type = [
    {
        id: 0,
        title: "普通用户"
    },
    {
        id: 4,
        title: "客服"
    }, {
        id: 2,
        title: "测试"
    }];
// const module = 702;
class EventDataExport extends React.Component {
    constructor(props) {
        super(props, module);
        this.state = props['eventDataExport'];
    }

    getColumnStyle(val, head, item) {
        if (head.type == "time") {
            return (<div>
                {item.begin_at} - {item.end_at}
            </div>)
        }
    }

    componentWillReceiveProps(props) {
        this.state = props["eventDataExport"];
        this.forceUpdate();
    }

    componentWillMount() {
        eventAction.getEventList({not_expired:2});
    }

    getCheck(item) {
        if (this.state.prize_type[`${item.id}`]) {
            return "checked";
        } else {
            return "";
        }
    }

    getUserCheck(item) {
        if (this.state.user_type[`${item.id}`]) {
            return "checked";
        } else {
            return "";
        }
    }

    onUserChecked(item) {
        this.state.user_type[`${item.id}`] = !this.state.user_type[`${item.id}`];
        this.forceUpdate();
    }

    onChecked(item) {
        this.state.prize_type[`${item.id}`] = !this.state.prize_type[`${item.id}`];
        this.forceUpdate();
    }

    render() {
        return (
            <div className="data-export">
                <div>
                    <div className="title">导出活动数据</div>
                    <Form onChange={(e) => {
                        this.state.export_event[e.target.name] = e.target.value;
                        this.forceUpdate();
                    }}
                          defaultValue={this.state.export_event}>
                        <table>
                            <tbody>
                            <tr>
                                <td>活动</td>
                                <td><select name="event_id">
                                    <option value="">请选择活动</option>
                                    {this.state.list.length ? this.state.list.map(function (item, index) {
                                        return <option key={index} value={item.id}>{item.title}</option>
                                    }) : null}
                                </select></td>
                            </tr>
                            <tr>
                                <td>奖品类型</td>
                                <td className="radio">
                                    {prize_type.map(function (item, index) {
                                        return <div key={index}
                                                    className={"checkbox " + this.getCheck(item) }
                                                    onClick={this.onChecked.bind(this, item)}
                                        >
                                            {item.title}
                                        </div>
                                    }, this)}

                                </td>
                            </tr>
                            <tr>
                                <td>时间</td>
                                <td>
                                    <input type="date" className="date" name="start_time"/>-
                                    <input type="date" className="date" name="end_time"/>
                                </td>
                            </tr>
                            <tr>
                                <td>用户类型</td>
                                <td className="radio">
                                    {user_type.map(function (item, index) {
                                        return <div key={index}
                                                    className={"checkbox " + this.getUserCheck(item) }
                                                    onClick={this.onUserChecked.bind(this, item)}
                                        >
                                            {item.title}
                                        </div>
                                    }, this)}</td>
                            </tr>
                            <tr>
                                <td colSpan="2" className="button">
                                    <button type="button" onClick={() => {
                                        this.state.export_event.prize_type = [];
                                        this.state.export_event.user_type = [];
                                        Object.keys(this.state.user_type).map((item, index) => {
                                            if (this.state.user_type[item]) {
                                                this.state.export_event.user_type.push(item);
                                            }
                                        }, this);
                                        Object.keys(this.state.prize_type).map((item, index) => {
                                            if (this.state.prize_type[item]) {
                                                this.state.export_event.prize_type.push(item);
                                            }
                                        }, this);
                                        if (this.state.export_event.event_id) {
                                            eventAction.exportEvent(this.state.export_event);
                                        } else {
                                            utilAction.prompt("请先选择活动ID");
                                        }
                                    }}>导出
                                    </button>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </Form>
                </div>
                <div>
                    <div className="title">导出活动排行榜</div>
                    <Form defaultValue={this.state.export_rank}
                          onChange={(e) => {
                              this.state.export_rank[e.target.name] = e.target.value;
                          }}>

                        <table>
                            <tbody>
                            <tr>
                                <td>活动</td>
                                <td><select name="event_id">
                                    <option value="">请选择活动</option>
                                    {this.state.list.map(function (item, index) {
                                        return <option key={index} value={item.id}>{item.title}</option>
                                    })}
                                </select></td>
                            </tr>
                            <tr>
                                <td colSpan="2" className="button">
                                    <button onClick={() => {
                                        if (this.state.export_rank.event_id) {
                                            eventAction.exportRank(this.state.export_rank);
                                        } else {
                                            utilAction.prompt("请先选择活动ID");

                                        }
                                    }} type="button">导出
                                    </button>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </Form>
                </div>
            </div>
        );
    }
}
export default connect(({eventDataExport}) => ({eventDataExport}))(EventDataExport);
