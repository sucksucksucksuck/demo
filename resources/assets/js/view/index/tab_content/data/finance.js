/**
 * Created by sucksuck on 2017/5/9.
 */

import React from 'react'
import Form from'../../../../modules/form'
import Input from '../../../../modules/input'
import {connect} from 'react-redux'
// import echarts from 'echarts';
import * as dataAction from '../../../../action/data'
import Search from '../../../../modules/search'
import AbsTabContent from '../abs_tab_content'
var echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/line')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
require('echarts/lib/component/legend')
require('echarts/lib/component/toolbox')
const today = new Date().format("yyyy-MM-dd")
const time = new Date().format("yyyy-MM-dd hh:mm")
const option = {
    title: {
        text: '每日财务统计',
        y: 'top',
        x: 'center'
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data: ['消费金额', '总发放奖励', '订单确认总奖励', '订单确认虚拟奖励', '订单确认实物奖励', '实际发放总奖励', '实际发放虚拟奖励', '实际发放实物奖励'],
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
            saveAsImage: {},
        },

    },
    xAxis: {
        type: 'category',
        axisTick: {
            alignWithLabel: true
        },
        axisLine: {
            onZero: false,
            lineStyle: {}
        },


    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            name: '消费金额',
            type: 'line',
            stack: '总量1',
            smooth: true,
            symbol: 'rect',
            showSymbol: true,
            lineStyle: {
                normal: {
                    width: 3,
                }
            }
        },
        {
            name: '总发放奖励',
            type: 'line',
            stack: '总量2',
            smooth: true,
            symbol: 'rect',
            showSymbol: true,
            lineStyle: {
                normal: {
                    width: 3,
                }
            }

        },
        {
            name: '订单确认总奖励',
            type: 'line',
            stack: '总量3',
            smooth: true,
            symbol: 'triangle',
            showSymbol: true,
            lineStyle: {
                normal: {
                    width: 3,
                }
            }

        },
        {
            name: '订单确认虚拟奖励',
            type: 'line',
            stack: '总量4',
            smooth: true,
            symbol: 'circle',
            showSymbol: true,
            lineStyle: {
                normal: {
                    width: 3,
                }
            }

        },
        {
            name: '订单确认实物奖励',
            type: 'line',
            stack: '总量5',
            smooth: true,
            symbol: 'roundRect',
            showSymbol: true,
            lineStyle: {
                normal: {
                    width: 3,
                }
            }

        },
        {
            name: '实际发放总奖励',
            type: 'line',
            stack: '总量6',
            smooth: true,
            symbol: 'pin',
            showSymbol: true,
            lineStyle: {
                normal: {
                    width: 3,
                }
            }

        },
        {
            name: '实际发放虚拟奖励',
            type: 'line',
            stack: '总量7',
            smooth: true,
            symbol: 'arrow',
            showSymbol: true,
            lineStyle: {
                normal: {
                    width: 3,
                }
            }

        },
        {
            name: '实际发放实物奖励',
            type: 'line',
            stack: '总量8',
            smooth: true,
            showSymbol: true,
            lineStyle: {
                normal: {
                    width: 3,
                }
            }

        }
    ]
}
const module = 1003
class DataFinance extends AbsTabContent {
    constructor(props) {
        super(props, module)
        //通过属性传递state过来
        this.state = props['dataFinance']
        // this.resize = function () {
        //     if (this.chart) {
        //         this.chart.resize();
        //     }
        // }.bind(this);
        this.state.start_time = ''
        this.state.end_time = ''
        this.state.warnText = ''
    }

    componentDidMount() {
        this.chart = echarts.init(this.refs['line'])
        // window.addEventListener('resize', this.resize, true);
        // console.log(this.state);
    }

    componentWillMount() {  //render前
        dataAction.getFinanceStatistics()
    }

    componentDidUpdate() {
        let option1 = cloneObject(option)
        option1.xAxis.data = this.state.data.date
        option1.series[0].data = this.state.data.consumer_amount//消费金额
        option1.series[1].data = this.state.data.winning_amount//总发放奖励
        option1.series[2].data = this.state.amount//订单确认总奖励*
        option1.series[3].data = this.state.fictitious//订单确认虚拟奖励
        option1.series[4].data = this.state.data.entity_amount//订单确认实物奖励
        option1.series[5].data = this.state.data.real_payment_amount//实际发放总奖励*
        option1.series[6].data = this.state.real_fictitious//实际发放虚拟奖励
        option1.series[7].data = this.state.data.real_entity_amount//实际发放实物奖励
        this.chart.setOption(option1)
        window.onresize = this.chart.resize
    }


    componentWillUnmount() {
        window.onresize = ""
        try {
            this.chart.dispose()
        } catch (e) {
        }
    }

    componentWillReceiveProps(props) {
        this.state = props['dataFinance']
        this.forceUpdate()
        console.log(this.state)
    }

    dateChange(e) {
        this.state.warn = false
        this.state.start_time = this.refs['start_time'].value
        if (this.refs['end_time'].value === '') {
            this.refs['end_time'].value = today
        }
        this.state.search.end_time = this.refs['end_time'].value
        this.state.end_time = this.refs['end_time'].value
        this.forceUpdate()
        if (Math.abs(Date.parse(this.state.start_time)) > Math.abs(Date.parse(this.state.end_time))) {
            this.state.warn = true
            this.state.warnText = "请输入正确的时间范围"
            this.forceUpdate()
        }
    }

    onSubmit() {
        // console.log(this.state.search);
        dataAction.getFinanceStatistics(this.state.search)
        this.forceUpdate()
    }

    render() {
        return (
            <div className="daily-statistics">
                <Search
                    onChange={(e) => {
                        this.state.search[e.target.name] = e.target.value
                        this.dateChange(e)
                    }}
                    onSubmit={this.onSubmit.bind(this)}
                >
                    <div className="item">
                        <div>时间</div>
                        <input type="date" ref="start_time" className="date" name="start_time"/>-
                        <input type="date" ref="end_time" className="date" name="end_time"/>
                        <div className="tips">默认统计一周,统计截止时间为
                            {time}</div>
                        <div className="fixed">{this.state.warn ? this.state.warnText : null}</div>
                    </div>
                </Search>
                <div className="line-chart">
                    <div ref="line" style={{width: "auto", height: 650}}/>
                </div>

            </div>
        )
    }
}
export default connect(({dataFinance}) => ({dataFinance}))(DataFinance)
