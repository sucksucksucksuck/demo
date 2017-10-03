/**
 * Created by sucksuck on 2017/6/2.
 */
import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom'
import * as utilAction from '../../../../action/util';
import SimpleTable from '../../../../modules/simple_table';
import * as eventAction from '../../../../action/event/rank';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import AbsTabContent from '../abs_tab_content';

const head = [
    {"text": "名次", "key": "id", "type": "id", className: "img w80"},
    {"text": "用户UID", "key": "user_id", "type": "user_id", className: "img w150"},
    {"text": "用户昵称", "key": "nickname", "type": "nickname", className: "w100"},
    {"text": "用户类型", "key": "type", "type": "type", className: "user w150"},
    {"text": "数值", "key": "sort", "type": "sort", className: "w100"},
    {"text": "额外数据", "key": "extend", "type": "extend"},
    {"text": "操作", "key": "operation", "type": "operation", className: "w150"},
];
const type = {
    "0": "用户",
    "1": "机器人",
    "2": "测试",
    "3": "特殊",
    "4": "客服"
};
const btns = [
    <button key="2" name="save" className="save">✔</button>,
    <button key="3" name="edit" className="close">✘</button>
];
const module = 702;
class Rank extends React.Component {
    constructor(props) {
        super(props, module);
        this.state = props['rank'];
        this.state.search.id = this.props.extend;
        this.initState(props);
    }

    initState(props) {
        if (props.rank.rows instanceof Array) {
            this.state.edit = {};
            this.state.item = {};
            this.state.rank = {};
            for (let row of props.rank.rows) {
                this.state.edit[`id_${row.id}`] = false;
            }
            for (let row of props.rank.rows) {
                this.state.item[`id_${row.id}`] = row.sort;
            }
            for (let row in props.rank.rows) {
                this.state.rank[`${props.rank.rows[row].id}`] = ++row;
            }
        }
    }

    componentWillMount() {
        eventAction.getEventList({son: 2, id: this.state.search.id});
        eventAction.getRankList(this.state.search);
    }

    componentWillReceiveProps(props) {
        this.state = props["rank"];
        this.initState(props);
        this.forceUpdate();
    }

    onItemButtonClick(search, item, name) {
        if (name == "edit") {
            this.state.btn = !this.state.btn;
            this.forceUpdate();
        }
    }

    getColumnStyle(val, head, item) {
        if (head.type == "type") {
            return type[val];
        }
        if (head.type === "sort") {
            if (this.state.edit[`id_${item.id}`]) {
                return <input name="sort" value={this.state.item[`id_${item.id}`]} onChange={(e) => {
                    this.state.item[`id_${item.id}`] = e.target.value;
                    this.forceUpdate();
                }
                }/>;
            } else {
                return val;
            }
        }
        if (head.type === "id") {
            return this.state.rank[val];
        }
        if (head.type === "operation" && window.hasPermission("702", "3")) {
            if (item.type !== 0) {
                if (!this.state.edit[`id_${item.id}`]) {
                    return (<div className="edit" onClick={() => {
                        this.state.edit[`id_${item.id}`] = !this.state.edit[`id_${item.id}`];
                        this.forceUpdate();
                    }
                    }>修改</div>);
                } else {
                    return <div className="operation">
                        <div className="save" onClick={() => {
                            eventAction.setRank({
                                id: item.id,
                                sort: this.state.item[`id_${item.id}`]
                            }, this.state.search);
                        }
                        }/>
                        <div className="close" onClick={() => {
                            this.state.edit[`id_${item.id}`] = !this.state.edit[`id_${item.id}`];
                            this.forceUpdate();
                        }
                        }/>
                    </div>;
                }
            }
        }
    }


    render() {
        return (
            <div className="rank">
                <div className="navigator">
                    <div>
                        <div>{this.state.event_info.title}</div>
                        <div>活动时间：{this.state.event_info.begin_at} 至 {this.state.event_info.end_at}</div>
                    </div>
                    <div className="button">
                        <NavLink className="none" key="7" name="setting"
                                 to={"/event/manage/prize/setting/" + this.props.extend}>
                            &lt;返回上一页</NavLink>
                    </div>
                </div>
                {this.state.event_list.length ? <Search
                    defaultValue={this.state.search}
                    onSubmit={() => {
                        if (this.state.search.event_id) {
                            eventAction.getRankList({id: this.state.search.event_id});
                        } else {
                            eventAction.getRankList({id: this.props.extend});
                        }
                    }}
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                    }}>
                    <div>
                        周期:
                        <select name="event_id">
                            <option value="">请选择周期</option>
                            {this.state.event_list.length ? this.state.event_list.map(function (item, index) {
                                return <option key={index} value={item.id}>{item.title}</option>
                            }) : null}
                        </select>
                    </div>
                </Search> : null}

                {this.state.rows.length == 0 ?
                    <div className="rank_null"/>
                    :
                    <SimpleTable
                        head={head}
                        ref="table"
                        checkbox={false}
                        rows={this.state.rows}
                        onItemButtonClick={this.onItemButtonClick.bind(this, this.state.search)}
                        getColumnStyle={this.getColumnStyle.bind(this)}
                    >
                    </SimpleTable>}
            </div>
        );
    }
}
export default connect(({rank}) => ({rank}))(Rank);
