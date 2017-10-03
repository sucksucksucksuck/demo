/**
 * Created by sucksuck on 2017/6/13.
 * opt=>遍历的对象
 * value=>每一个option的value
 * text=>每一个option文字在opt的对象名
 * defaultValue=>option的默认值
 * object=>为true时 数据类型是{"1":"xxx","2":"xxx"}
 * 否则是数组[{},{}]
 */

import React from 'react';


export default class extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(props) {
        this.forceUpdate();
    }

    render() {
        return (
            <select
                className={this.props.class}
                ref={this.props.name}
                value={this.props.defaultValue}
                onChange={(e) => {
                    if (this.props.onChange) {
                        this.props.onChange(e);
                    }
                }} name={this.props.name}>
                <option value="">{this.props.defaultText}</option>
                {this.props.object ? Object.keys(this.props.opts).map(function (item, index) {
                    if (this.props.opts[item]) {
                        return (<option key={index} value={item}>{this.props.opts[item]}</option>)
                    }
                }.bind(this)) : this.props.opts.length ? this.props.opts.map(function (item, index) {
                    return (<option key={index} value={item[this.props.value]}>{item[this.props.text]}</option>)
                }.bind(this)) : null}


            </select>
        );
    }
}
/*
 <Select name="director_id" opts={this.state.director_list} value="id" text="truename" defaultText="全部"/>

 <Select name="order_status" object={true} opts={order_status} defaultText="全部"/>

 */