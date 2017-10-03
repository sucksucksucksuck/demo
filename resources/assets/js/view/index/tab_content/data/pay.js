/**
 * Created by sucksuck on 2017/5/9.
 */
/**
 * Created by sucksuck on 2017/4/25.
 */

import React from 'react';
import Form from'../../../../modules/form';
import Input from '../../../../modules/input';
import Search from '../../../../modules/search';
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

const module = 1002;

const option = {
    title: {
        text: '每日充值统计',
        y: 'top',
        x: 'center'
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data: ['充值人数', '充值次数', '充值金额'],
        bottom: 0,
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '7%',
        containLabel: true
    },
    toolbox: {
        right: '3%',
        feature: {
            saveAsImage: {}
        }
    },
    xAxis: {
        type: 'category',
        axisTick: {
            alignWithLabel: false
        },
        axisLine: {
            onZero: true,
            lineStyle: {

            }
        },


    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            name: '充值人数',
            type: 'line',
            stack: '总量1',
            smooth: true,
            symbol: 'rect',
            showSymbol:true,
            lineStyle:{
                normal:{
                    width:3,
                }
            }
        },
        {
            name: '充值次数',
            type: 'line',
            stack: '总量2',
            smooth: true,
            symbol:'diamond',
            showSymbol:true,
            lineStyle:{
                normal:{
                    width:3,
                }
            }

        },
        {
            name: '充值金额',
            type: 'line',
            stack: '总量3',
            smooth: true,
            symbol:'triangle',
            showSymbol:true,
            lineStyle:{
                normal:{
                    width:3,
                }
            }

        }
    ]
};
const today = new Date().format("yyyy-MM-dd");
const time = new Date().format("yyyy-MM-dd hh:mm");

class DataPay extends AbsTabContent {
    constructor(props) {
        super(props,module);
        this.state = props['dataPay'];
        // this.resize = function () {
        //     if (this.chart) {
        //         this.chart.resize();
        //     }
        // }.bind(this);
        this.state.start_time = '';
        this.state.end_time = '';
        this.state.warnText = '';
    }

    componentDidMount() {
        this.chart = echarts.init(this.refs['line']);
        // window.addEventListener('resize', this.resize, true);
    }

    componentWillMount() {  //render前
        dataAction.getPayStatistics();

    }

    componentDidUpdate() {
        let option1= cloneObject(option);
        option1.xAxis.data=this.state.data.date;
        option1.series[0].data=this.state.data.recharge_people;
        option1.series[1].data=this.state.data.recharge_times;
        option1.series[2].data=this.state.data.recharge_amount;
        this.chart.setOption(option1);
        window.onresize = this.chart.resize;

    }

    componentWillUnmount() {
        window.onresize = "";
        try {
            this.chart.dispose();
        } catch (e) {
        }
    }

    componentWillReceiveProps(props) {
        this.state = props['dataPay'];
        this.forceUpdate();
    }
    dateChange(e) {
        this.state.warn = false;
        this.state.start_time = this.refs['start_time'].value;
        if( this.refs['end_time'].value === ''){
            this.refs['end_time'].value= today;
        }
        this.state.search.end_time = this.refs['end_time'].value;
        this.state.end_time = this.refs['end_time'].value;
        this.forceUpdate();
        if (Math.abs(Date.parse(this.state.start_time)) > Math.abs(Date.parse(this.state.end_time))) {
            this.state.warn = true;
            this.state.warnText = "请输入正确的时间范围";
            this.forceUpdate();
        }
    }
    onSubmit() {
        dataAction.getPayStatistics(this.state.search);
        this.forceUpdate();
    }
    render() {
        return (
            <div className="daily-statistics">
                <Search
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value;
                        this.dateChange(e)
                    }}
                    onSubmit={this.onSubmit.bind(this)}
                   >
                    <div className="item">
                        <div>时间</div>
                        <input type="date" ref="start_time" className="date" name="start_time" />-
                        <input type="date" ref="end_time" className="date" name="end_time"  />
                        <div className="tips">默认统计一周,统计截止时间为
                            {time}</div>
                        <div className="fixed">{this.state.warn ? this.state.warnText: null}</div>
                    </div>
                </Search>
                <div className="line-chart">
                    <div ref="line" style={{width: "auto", height: 650}}/>
                </div>

            </div>
        )

    }
}
export default connect(({dataPay}) => ({dataPay}))(DataPay);
