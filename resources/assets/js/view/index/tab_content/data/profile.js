/**
 * Created by sucksuck on 2017/4/25.
 */

import React from 'react';
import Form from'../../../../modules/form';
import Input from '../../../../modules/input';
import {connect} from 'react-redux';
// import echarts from 'echarts';
var echarts = require('echarts/lib/echarts');
require('echarts/lib/chart/line');
require('echarts/lib/component/tooltip');
require('echarts/lib/component/title');
require('echarts/lib/component/legend');
require('echarts/lib/component/toolbox');
import * as dataAction from '../../../../action/data';
import AbsTabContent from '../abs_tab_content';

const option = {
    baseOption: {
        tooltip: {
            trigger: 'item',
            formatter: "{b} : {d}% {c}人"
        },
        title: {
            y: 'bottom',
            x: 'center'
        },
        series: [
            {
                type: 'pie',
                radius: '80%',
                center: ['50%', '50%'],
                data: [
                    {
                        name: 'IOS',
                        itemStyle: {
                            normal: {
                                color: '#bae4f1'
                            }
                        }
                    },
                    {
                        name: 'Android',
                        itemStyle: {
                            normal: {
                                color: '#22b7e5'
                            }
                        }
                    }
                ],
                label: {
                    normal: {
                        formatter: '{b} {d}%',
                        textStyle: {
                            color: '#ec3e27',
                            fontSize: 16,
                        }
                    }
                },
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    }

};
const chart = [];
const module = 1001;
class DataProfile extends AbsTabContent {
    constructor(props) {
        super(props,module);
        //通过属性传递state过来
        this.state = props['dataProfile'];
        // console.log(this.state);
        this.state.info = [];
        this.resize = function () {
            if (chart[0]) {
                chart[0].resize();
                chart[1].resize();
            }
        }.bind(this);
    }

    componentDidMount() {
        chart[0] = echarts.init(this.refs['main0']);
        chart[1] = echarts.init(this.refs['main1']);
        // window.addEventListener('resize', this.resize, true);
    }

    componentWillMount() {  //render前
        dataAction.getDataProfile();
    }

    componentDidUpdate() {
        let option1 = cloneObject(option);
        option1.baseOption.title.text = this.state.data[0].date;
        option1.baseOption.series[0].data[0].value = this.state.data[0].register_ios;
        option1.baseOption.series[0].data[1].value = this.state.data[0].register_android;
        let option2 = cloneObject(option);
        option2.baseOption.title.text = this.state.data[1].date;
        option2.baseOption.series[0].data[0].value = this.state.data[1].register_ios;
        option2.baseOption.series[0].data[1].value = this.state.data[1].register_android;
        chart[0].setOption(option1);
        chart[1].setOption(option2);
        window.addEventListener('resize', this.resize,true);
        // window.onresize = chart[0].resize;
        // window.onresize = chart[1].resize;


    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize,true);
        try {
            chart[0].dispose();
            chart[1].dispose();
        } catch (e) {
            console.log(e);
        }
    }

    componentWillReceiveProps(props) {
        this.state = props['dataProfile'];
        this.forceUpdate();

    }


    render() {
        return (
            <div className="data-profile">
                <table cellSpacing="0">
                    <thead>
                    <tr>
                        <td/>
                        {this.state.data.map((item, index) => {
                            return (<td key={index}>{item.date}</td>);
                        })}
                    </tr>
                    </thead>
                    <tbody>
                    <tr className="people">
                        <td>注册</td>
                        {this.state.data.map((item, index) => {
                            let total = parseInt(item.register_ios) + parseInt(item.register_android);
                            return (<td key={index}>{total}</td>);
                        })}
                    </tr>
                    <tr className="people">
                        <td>登录</td>
                        {this.state.data.map((item, index) => {
                            return (<td key={index}>{item.login}</td>);
                        })}

                    </tr>
                    <tr className="money">
                        <td>充值</td>
                        {this.state.data.map((item, index) => {
                            return (<td key={index}>{item.recharge_amount}</td>);
                        })}
                    </tr>
                    <tr className="money">
                        <td>消费</td>
                        {this.state.data.map((item, index) => {
                            return (<td key={index}>{item.consumer_amount}</td>);
                        })}
                    </tr>
                    <tr className="money">
                        <td>总发放奖励</td>
                        {this.state.data.map((item, index) => {
                            return (<td key={index}>{item.winning_amount}</td>);
                        })}
                    </tr>
                    <tr className="red">
                        <td rowSpan="2">订单确认奖励</td>
                        {this.state.data.map((item, index) => {
                            let total = parseInt(item.virtual_amount) + parseInt(item.duiba_amount) + parseInt(item.entity_amount);
                            return (<td key={index}>{total}</td>);
                        })}

                    </tr>
                    <tr className="scatter">
                        {this.state.data.map((item, index) => {
                            return ( <td key={index}>
                                <div className="group">
                                    <div>
                                        <div>{item.virtual_amount}</div>
                                        <div>虚拟</div>
                                    </div>
                                    <div>
                                        <div>{item.duiba_amount}</div>
                                        <div>自动</div>
                                    </div>
                                    <div>
                                        <div>{item.entity_amount}</div>
                                        <div>实物</div>
                                    </div>
                                </div>
                            </td>);
                        })}
                    </tr>
                    <tr className="red">
                        <td rowSpan="2">实际发放奖励</td>
                        {this.state.data.map((item, index) => {
                            let total = parseInt(item.real_virtual_amount) + parseInt(item.real_duiba_amount) + parseInt(item.real_entity_amount);

                            return (<td key={index}>{total}</td>);
                        })}
                    </tr>
                    <tr className="scatter">
                        {this.state.data.map((item, index) => {
                            return ( <td key={index}>
                                <div className="group">
                                    <div>
                                        <div>{item.real_virtual_amount}</div>
                                        <div>虚拟</div>
                                    </div>
                                    <div>
                                        <div>{item.real_duiba_amount}</div>
                                        <div>自动</div>
                                    </div>
                                    <div>
                                        <div>{item.real_entity_amount}</div>
                                        <div>实物</div>
                                    </div>
                                </div>
                            </td>);
                        })}
                    </tr>
                    </tbody>
                </table>
                <div className="contrast">
                    <div className="title">注册对比图</div>
                    <div className="cake-item">
                        <div className="item">
                            <div ref="main0" style={{width: "auto", height: 280}}/>
                        </div>
                        <div className="item">
                            <div ref="main1" style={{width: "auto", height: 280}}/>
                        </div>
                    </div>
                </div>
            </div>
        )

    }
}
export default connect(({dataProfile}) => ({dataProfile}))(DataProfile);
