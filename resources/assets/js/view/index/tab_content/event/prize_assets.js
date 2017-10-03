/**
 * Created by sucksuck on 2017/5/27.
 */
import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom'
import * as utilAction from '../../../../action/util';
import SimpleTable from '../../../../modules/simple_table';
import * as eventAction from '../../../../action/event/prize_assets';
import Paging from '../../../../modules/paging'
import Search from '../../../../modules/search';
import AbsTabContent from '../abs_tab_content';

const head = [
    {"text": "ID", "key": "id", className: "img w80"},
    {"text": "奖品标题", "key": "title", "type": "title"},
    {"text": "类型", "key": "type", "type": "type", className: "user w150"},
    {"text": "权重", "key": "chance", "type": "chance"},
    {"text": "次数", "key": "count", "type": "count"},
    {"text": "已领取", "key": "all_num", "type": "all_num"},
];
const type = {
    "1": "实物",
    "2": "虚拟",
    "3": "红包",
    "4": "盘古币",
    "5": "积分"
};
const module = 701;
class PrizeAssets extends AbsTabContent {
    constructor(props) {
        super(props, module);
        this.state = props['prizeAssets'];
        this.state.search.id = this.props.extend;
        console.log(this);
    }

    componentWillMount() {
        eventAction.getPrizeAssets(this.state.search);
    }

    componentWillReceiveProps(props) {
        this.state = props["prizeAssets"];
        this.forceUpdate();
    }

    getColumnStyle(val, head, item) {
        if (head.type == "type") {
            return type[val];
        }

    }

    onItemButtonClick(search, item, name) {
        if (name == "edit") {
            eventAction.assetsPopUp(item.id,this.props.extend, search);
        }
        if (name == "del") {
            utilAction.confirm("是否删除该奖品，请确认", () => {
                eventAction.delPrizeAssets({id: item.id}, this.state.search);
                return true;
            });
        }
    }

    render() {
        return (
            <div className="event-setting">
                <div className="navigator">
                    <div>
                        <div>
                            <div>{this.state.event_info.title}</div>
                            <div>活动时间：{this.state.event_info.begin_at} 至 {this.state.event_info.end_at}</div>
                        </div>
                        <div className="button">
                            <NavLink className="none" key="7" name="setting"
                                     to={"/event/manage/prize/setting/" + this.props.extend}>
                                &lt;返回上一页</NavLink>
                            <button key="6" name="edit" onClick={() => {
                                eventAction.assetsPopUp(null,this.props.extend, this.state.search);
                            }}>添加资产奖品
                            </button>
                        </div>
                    </div>
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
                    <button key="1" name="edit">修改</button>
                    <button key="2" name="del">删除</button>
                </SimpleTable>}
                {this.state.rows.length == 0 ?
                    null
                    : <Paging
                    total={this.state.total}
                    page={this.state.search.page}
                    onPaginate={(page, page_size) => {
                        this.state.search.page = page;
                        this.state.search.page_size = page_size;
                        this.state.search.id = this.props.extend;
                        eventAction.getPrizeAssets(this.state.search);
                    }}/>}
            </div>
        );
    }
}

export default connect(({prizeAssets}) => ({prizeAssets}))(PrizeAssets);
