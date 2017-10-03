/**
 * Created by sucksuck on 2017/7/11.
 * 晒单详情
 */
import React from 'react';
import Form from'../../../../modules/form';
import Input from '../../../../modules/input';
import {connect} from 'react-redux';
import * as robotAction from '../../../../action/share_order/robot';
import * as shareAction from '../../../../action/share_order/share_order_list';

import * as utilAction from '../../../../action/util';
import CountDown from '../../../../modules/count_down';
import Button from '../../../../modules/button';

class ShareInfo extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['shareInfo'];

    }

    componentWillReceiveProps(props) {
        this.state = props['shareInfo'];
        this.forceUpdate();
    }

    componentDidMount() {  //render前
        if(this.props.item.periods_id){
            //要请求
            shareAction.getShareInfo({id:this.props.item.id});
        }
    }


    componentWillUnmount() {
        shareAction.clearShareInfo();
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    render() {
        return (
            <div className="share-order">
                <div className="title">晒单详情
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="goods-title">
                    <div>{this.props.item.title}</div>
                    <div>
                        <div>购买时间：{this.props.item.o_create_at}</div>
                        <div>揭晓时间：{this.props.item.lottery_show_at}</div>
                        {this.props.item.periods_id?<div>晒单时间：{this.state.data.s_create_at}</div>:null}

                    </div>
                </div>
                <div className="info">
                    <div>
                        <img src={this.props.item.icon} onError={(e) => {
                            e.target.src = window.config.root + "/image/index/index_user.png";
                        }}/>
                    </div>
                    <div>
                        <div>期数</div>
                        <div>{this.props.item.periods}</div>
                    </div>
                    <div>
                        <div>产品ID</div>
                        <div>{this.props.item.goods_id}</div>
                    </div>
                    <div>
                        <div>购买人次</div>
                        <div>{this.props.item.num}</div>
                    </div>
                    <div>
                        <div>总需人次</div>
                        <div>{this.props.item.total}</div>
                    </div>
                    <div>
                        <div>商品原价</div>
                        <div>{this.props.item.amount}</div>
                    </div>
                    <div>
                        <div>订单编号</div>
                        <div>{this.props.item.order_id}</div>
                    </div>
                    <div>
                        <div>单价</div>
                        <div>{this.props.item.unit_price}</div>
                    </div>
                </div>
                <div className="wrap">
                    <div className="item-title">晒单内容</div>
                    <div className="lucky">
                        {this.state.content}
                    </div>
                    <div className="item-title">晒单图片</div>
                    {this.state.image.map(function(item,index){
                        return <img className="img" key={index} src={item}/>
                    })}
                </div>

            </div>
        )

    }
}
export default connect(({shareInfo}) => ({shareInfo}))(ShareInfo);
