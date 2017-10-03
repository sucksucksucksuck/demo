/**
 * Created by sucksuck on 2017/6/16.
 */
import React from 'react';
import * as utilAction from '../action/util';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {get_code_second: props.second};
    }

    componentWillReceiveProps(props) {
        this.state = {get_code_second: props.second};
        this.forceUpdate();
    }

    componentWillMount() {
        this.setIntervalId = window.setInterval(this.countDown.bind(this), 1000);
    }
    componentWillUnmount() {
        window.clearTimeout(this.setIntervalId);

    }
    countDown() {
        this.state.get_code_second--;
        if (this.state.get_code_second == 0) {
            utilAction.close("delivery");
        }
        this.forceUpdate();
    }

    render() {
        return (
            <div className="second"> {this.state.get_code_second}秒 </div>
        );
    }
}