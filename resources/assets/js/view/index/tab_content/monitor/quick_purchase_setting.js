/**
 * Created by sucksuck on 2017/7/26.
 */

import React from 'react';
import {connect} from 'react-redux';
import * as monitorAction from '../../../../action/monitor';

class QuickPurchaseSetting extends React.Component {
    constructor(props) {
        super(props);
        this.state = props['monitorQuickPurchaseSetting'];
        //通过属性传递state过来
        // console.log(Object.keys(this.state.selected));
    }

    componentWillMount() {
        this.state.search = false;
        this.state.value = "";
        this.state.result = [];
    }

    componentWillReceiveProps(props) {
        this.state = props["monitorQuickPurchaseSetting"];
        this.forceUpdate();
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    searchGoods() {
        this.state.result = [];
        if (this.state.value) {
            var reg = new RegExp(this.state.value);
            this.state.goods.map(function (item, index) {
                if (item.title.match(reg)) {
                    this.state.result.push(item)
                }
            }.bind(this));
            this.state.search = true;
        } else {
            this.state.search = false;
        }
        this.forceUpdate();
    }

    selectedSort(n1, n2) {
        return this.state.selected[n1].index - this.state.selected[n2].index;
    }

    render() {
        return (
            <div className="monitor-goods-setting">
                <div className="title">配置一键购买的产品
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="content">
                    <div>
                        <div className="search"><input placeholder="请输入商品关键字" value={this.state.value || ""} type="text"
                                                       onKeyDown={(e) => {
                                                           if (e.keyCode == 13) {
                                                               this.searchGoods();
                                                           }
                                                       }}
                                                       onChange={(e) => {
                                                           this.state.value = e.target.value;
                                                           this.forceUpdate();
                                                       }}/>
                            <div onClick={this.searchGoods.bind(this)}/>
                        </div>
                        <div className="items">
                            {this.state.search ? this.state.result.map(function (item, index) {
                                let className = ["item", "left"];
                                if (this.state.selected[`id_${item.id}`]) {
                                    className.push('active')
                                }
                                return (<div className={className.join(' ')}
                                             onClick={monitorAction.quickSelected.bind(this, item)}
                                             key={index}>{item.title}</div>);
                            }, this) : this.state.goods.map(function (item, index) {
                                let className = ["item", "left"];
                                if (this.state.selected[`id_${item.id}`]) {
                                    className.push('active')
                                }
                                return (<div className={className.join(' ')}
                                             onClick={monitorAction.quickSelected.bind(this, item)}
                                             key={index}>{item.title}</div>);
                            }, this)}
                        </div>
                    </div>
                    <div>
                        <div className="title">已选中的产品</div>
                        <div className="items">
                            {Object.keys(this.state.selected).sort(this.selectedSort.bind(this)).map(function (key, index) {
                                this.state.selected[key].index = index * 2;
                                return (
                                    <div className="item right" key={index}>
                                        <div className="title">{this.state.selected[key].title}</div>
                                        <div className="control">
                                            <div className="close" onClick={() => {
                                                delete this.state.selected[key];
                                                this.forceUpdate();
                                            }}/>
                                        </div>
                                    </div>);
                            }, this)}
                        </div>
                    </div>
                </div>
            </div>);
    }
}

export default connect(({monitorQuickPurchaseSetting}) => ({monitorQuickPurchaseSetting}))(QuickPurchaseSetting);
