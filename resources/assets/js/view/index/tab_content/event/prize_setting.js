/**
 * Created by sucksuck on 2017/5/25.
 */

import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom'
import * as utilAction from '../../../../action/util';
import SimpleTable from '../../../../modules/simple_table';
import * as eventAction from '../../../../action/event/prize_setting';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import AbsTabContent from '../abs_tab_content';
import Button from '../../../../modules/button';
import '../../../../../image/index/bouns_null.png';
const head = [
    {"text": "ID", "key": "id"},
    {"text": "标题", "key": "title", className: "img w150"},
    {"text": "类型", "key": "type", "type": "type", className: "img w50"},
    {"text": "权重", "key": "chance", "type": "chance"},
    {"text": "次数", "key": "count", "type": "count"},
    {"text": "分组", "key": "group", "type": "group"},
    {"text": "金额", "key": "prize", "type": "prize"},
    {"text": "已领取", "key": "all_num", "type": "all_num", className: ""},


];
const type = {
    1: "实物",
    2: "虚拟",
    3: "红包",
    4: "盘古币",
    5: "积分"
};
const module = 704;
class EventPrizeSetting extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['eventPrizeSetting'];
        this.state.search.id = this.props.extend;
    }


    componentWillMount() {
        eventAction.getPrizeList(this.state.search);
    }

    componentWillUnmount() {
        eventAction.clearPrizeList();
    }

    componentWillReceiveProps(props) {
        this.state = props["eventPrizeSetting"];
        this.forceUpdate();
    }

    getColumnStyle(val, head, item) {
        if (head.type === "r_count") {
            if (val == -1) {
                return "无限";
            }
        }
        if (head.type === "amount") {
            if (item.min_amount === item.max_amount) {
                return item.min_amount;
            } else {
                return item.min_amount + "," + item.max_amount;
            }
        }
        if (head.type === "type") {
            return type[val];
        }
        if (head.type == "prize") {
            if (item.type == "3" || item.type == "1" || item.type == "2") {
                return "/";
            }
        }
        if (head.type == "chance") {
            if (val == "") {
                return 0;
            }
        }
    }


    onItemButtonClick(item, name) {
        if (name == "reissue") {
            eventAction.reissuePrizePopUp(item, this.state.event_info.title, this.state.event_info.id);
        }
        if (name === "edit") {
            if (item.type == "1" || item.type == "2") { //物品
                eventAction.goodsPopUp(item.id, this.state.search);
            } else if (item.type == "4" || item.type == "5") {   //资产
                eventAction.goodsPopUp(item.id, this.state.search);
            } else { //红包
                eventAction.redPopUp(item.id, this.props.extend, this.state.search);
            }
        }
        if (name === "delete") {
            eventAction.delPrizeGoods({id: item.id}, this.state.search);
        }
    }

    render() {
        return (
            <div className="event-setting">
                <div className="navigator">
                    <div>
                        <div/>
                        <Button>
                            <NavLink className="none" key="7" name="setting" to="/event/manage/:extend">
                                &lt;返回活动配置</NavLink>
                            <button module={module} action="2" name="add_prize" onClick={() => {
                                eventAction.goodsPopUp(null, this.state.search);
                            }}>添加奖品
                            </button>
                            <NavLink module="707" action="0" key="2" name="red"
                                     to={"/event/manage/prize/red/" + this.props.extend}>红包奖励设置</NavLink>
                            <button module="702" action="4" name="init" onClick={() => {
                                utilAction.confirm('确定初始化数据吗，该操作不可撤销！', () => {
                                    eventAction.initialization({id: this.props.extend});
                                    return true;
                                });
                            }}>初始化数据
                            </button>
                            <NavLink module="702" action="2" key="5" name="rank"
                                     to={"/event/manage/rank/" + this.props.extend}>排行榜</NavLink>
                            <button module="708" action="0" type="button" name="edit" onClick={() => {
                                eventAction.manageInfoPopUp(this.props.extend, this.state.search);
                            }}>修改活动
                            </button>
                        </Button>
                    </div>

                </div>
                <div className="info">
                    <div>
                        <div>活动ID</div>
                        <div>
                            {this.state.event_info.id}</div>
                    </div>
                    <div>
                        <div>活动标题</div>
                        <div>
                            {this.state.event_info.title}</div>
                    </div>
                    <div>
                        <div>活动时间</div>
                        <div>
                            {this.state.event_info.begin_at} 至 {this.state.event_info.end_at} </div>
                    </div>
                </div>
                {this.state.rows.length == 0 ?
                    <div className="bouns_null"/>
                    : <SimpleTable
                        head={head}
                        rows={this.state.rows}
                        checkbox={false}
                        ref="table"
                        getColumnStyle={this.getColumnStyle.bind(this)}
                        onItemButtonClick={this.onItemButtonClick.bind(this)}
                    >
                        <button module={module} action="1" name="reissue">补发</button>
                        <button module={module} action="3" name="edit">修改</button>
                        <button module={module} action="4" compare="${type}!==3" name="delete">删除</button>
                    </SimpleTable>}

                {this.state.rows.length == 0 ? null : <Paging
                    total={this.state.total}
                    page={this.state.search.page}
                    onPaginate={(page, page_size) => {
                        this.state.search.page = page;
                        this.state.search.page_size = page_size;
                        this.state.search.id = this.props.extend;
                        eventAction.getPrizeList(this.state.search);
                    }}/>}
            </div>
        );
    }
}
export default connect(({eventPrizeSetting}) => ({eventPrizeSetting}))(EventPrizeSetting);
