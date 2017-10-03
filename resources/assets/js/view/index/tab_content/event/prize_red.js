/**
 * Created by sucksuck on 2017/5/27.
 */
import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom'
import * as utilAction from '../../../../action/util';
import SimpleTable from '../../../../modules/simple_table';
import * as eventAction from '../../../../action/event/prize_red';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import AbsTabContent from '../abs_tab_content';
import Button from '../../../../modules/button';

const head = [
    {"text": "ID", "key": "id", className: "w50"},
    {"text": "个数", "key": "receive_quantity", "type": "receive_quantity", className: "w50"},
    {"text": "奖品标题", "key": "title", "type": "title"},
    {"text": "类型", "key": "type", "type": "type", className: "user w50"},
    {"text": "权重", "key": "chance", "type": "chance"},
    {"text": "金额", "key": "amount", "type": "amount"},
    {"text": "使用条件", "key": "use_amount", "type": "use_amount"},
    {"text": "有效期", "key": "expired", "type": "expired", className: "w50"},
    {"text": "延时生效(小时)", "key": "delayed", "type": "delayed"},
    {"text": "次数", "key": "count", "type": "count", className: "w50"},
    {"text": "分组", "key": "group", "type": "group", className: "w50"},
    {"text": "数量", "key": "r_count", "type": "r_count", className: "w50"},
    {"text": "已领取", "key": "all_num", "type": "all_num", className: ""},
    {"text": "已使用", "key": "use_num", "type": "use_num", className: ""},
    {"text": "未使用", "key": "no_use_num", "type": "no_use_num", className: ""},
];
const type = {
    "1": "实物",
    "2": "虚拟",
    "3": "红包",
    "4": "盘古币",
    "5": "积分"
};
const module = 707;
class PrizeRed extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['prizeRed'];
        this.state.search.id = this.props.extend;
    }

    componentWillMount() {
        eventAction.getPrizeRed(this.state.search);
    }

    componentWillReceiveProps(props) {
        this.state = props["prizeRed"];
        this.forceUpdate();
    }

    onItemButtonClick(search, item, name) {
        if (name == "edit") {
            eventAction.redPopUp(item.id, this.props.extend, search);
        }
        if (name == "del") {
            utilAction.confirm("是否删除该奖品，请确认", () => {
                eventAction.delPrizeRed({id: item.id}, this.state.search);
                return true;
            });
        }
    }

    getColumnStyle(val, head, item) {
        if (head.type == "type") {
            return type[val];
        }
        if (head.type === "r_count") {
            if (val === -1) {
                return "无限";
            }
        }
        if (head.type == "amount") {
            if (item.min_amount == item.max_amount) {
                return item.min_amount;
            } else {
                return <div>{item.min_amount}-{item.max_amount}</div>
            }
        }

    }


    render() {
        return (
            <div className="prize-red">
                <div className="navigator">
                    <div>
                        <div>{this.state.event_info.title}</div>
                        <div>活动时间：{this.state.event_info.begin_at} 至 {this.state.event_info.end_at}</div>
                    </div>
                    <Button>
                        <NavLink className="none" key="7" name="setting"
                                 to={"/event/manage/prize/setting/" + this.props.extend}>
                            &lt;返回上一页</NavLink>
                        <button module={module} action="1" key="6" name="edit" onClick={() => {
                            eventAction.redPopUp(null, this.props.extend, this.state.search);
                        }}>添加虚拟奖品
                        </button>
                    </Button>
                </div>
                {this.state.rows.length == 0 ?
                    <div className="bouns_null"/>
                    :
                    <SimpleTable
                        head={head}
                        checkbox={false}
                        ref="table"
                        rows={this.state.rows}
                        onItemButtonClick={this.onItemButtonClick.bind(this, this.state.search)}
                        getColumnStyle={this.getColumnStyle.bind(this)}
                    >
                        <button module={module} action="2" key="1" name="edit">修改</button>
                        <button module={module} action="3" key="2" name="del">删除</button>
                    </SimpleTable>}
                {this.state.rows.length == 0 ?
                    null
                    :
                    <Paging
                        total={this.state.total}
                        page={this.state.search.page}
                        onPaginate={(page, page_size) => {
                            this.state.search.page = page;
                            this.state.search.page_size = page_size;
                            this.state.search.id = this.props.extend;
                            eventAction.getPrizeRed(this.state.search);
                        }}/>}
            </div>
        );
    }
}
export default connect(({prizeRed}) => ({prizeRed}))(PrizeRed);
