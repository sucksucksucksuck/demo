/**
 * Created by sucksuck on 2017/6/26.
 */
import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom'
import * as dataAction from '../../../../action/data';
import AbsTabContent from '../abs_tab_content';
import Button from '../../../../modules/button';
import Paging from '../../../../modules/paging';

const module = 1004;
const day = new Date().format("dd");
const year = new Date().format("yyyy");
const month = new Date().format("MM");
const lastDay = new Date(year, month - 1, 0).format("dd");
var date = [];
if (day == 1) {//每个月一号显示上个月的数据
    for (let i = 1; i <= lastDay; i++) {
        if (i < 10) {
            if (month < 10) {
                date.push(year + "-0" + parseInt(month - 1) + "-0" + i);
            } else {
                date.push(year + "-" + parseInt(month - 1) + "-0" + i);
            }
        } else {
            if (month < 10) {
                date.push(year + "-0" + parseInt(month - 1) + "-" + i);
            } else {
                date.push(year + "-" + parseInt(month - 1) + "-" + i);
            }
        }
    }
} else {
    for (let i = 1; i <= day; i++) {
        if (i < 10) {
            date.push(year + "-" + month + "-0" + i);
        } else {
            date.push(year + "-" + month + "-" + i);
        }
    }
}

class DataMonthUser extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['dataMonthUser'];
    }

    componentWillReceiveProps(props) {
        this.state = props["dataMonthUser"];
        this.forceUpdate();
    }


    componentWillUnmount() {

    }

    componentDidMount() {

    }

    componentWillMount() {
        dataAction.getMonthUser();
    }

    onPage(page, pageSize) {
        this.state.search.page = page;
        this.state.newData = this.state.data.slice(pageSize * (page - 1), pageSize * (page - 1) + pageSize);
        this.forceUpdate();
    }

    getPage() {
        return this.state.search.page;
    }

    render() {
        return (
            <div className="month-user">
                <div className="navigator">
                    <Button>
                        <button name="export" module={module} action="1" onClick={() => {
                            dataAction.excel();
                        }}>导出
                        </button>
                    </Button>
                </div>
                <div className="hidden"/>
                {this.state.data.length ? <div ref="user_table" className="user-table">
                    <div className="table-content">
                        <table>
                            <thead>
                            <tr>
                                <td>UID</td>
                                {date.map(function (item, index) {
                                    return <td colSpan="3" key={index}>{item}</td>;
                                }.bind(this))}
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td/>
                                {date.map(function (item, index) {
                                    return [
                                        <td key={"a" + index}>充值</td>,
                                        <td key={"c" + index}>中奖</td>,
                                        <td key={"b" + index}>消费</td>
                                    ];
                                }.bind(this))}
                            </tr>
                            {this.state.newData.map(function (item, index) {
                                return (<tr key={index}>
                                    <td>{item[0]}</td>
                                    {date.map(function (sub_item, sub_index) {
                                        return [
                                            <td title={"UID：" + item[0] + "　日期：" + date[sub_index] + "　充值金额"}
                                                key={"e" + sub_index}>{item[(sub_index + 1) * 3 - 2]}</td>,
                                            <td title={"UID：" + item[0] + "　日期：" + date[sub_index] + "　中奖金额"}
                                                key={"g" + sub_index}>{item[(sub_index + 1) * 3]}</td>,
                                            <td title={"UID：" + item[0] + "　日期：" + date[sub_index] + "　消费金额"}
                                                key={"f" + sub_index}>{item[(sub_index + 1) * 3 - 1]}</td>
                                        ]
                                    })}
                                </tr>)
                            })}
                            </tbody>
                        </table>
                    </div>
                </div> : <div className="list_null"/>}
                <Paging
                    total={this.state.data.length}
                    page={this.getPage()}
                    page_size={this.state.page_size}
                    onPaginate={this.onPage.bind(this)}

                />
            </div>
        );
    }
}

export default connect(({dataMonthUser}) => ({dataMonthUser}))(DataMonthUser);
