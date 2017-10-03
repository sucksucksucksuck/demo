/**
 * Created by sucksuck on 2017/7/28.
 */
import React from 'react';

const today = new Date().format("yyyy-MM-dd");
export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            warn: false,
            warnText: "",
            start_time: "",
            end_time: ""
        }
    }

    componentDidMount() {
    }

    componentWillReceiveProps() {
        this.forceUpdate();
    }

    dateChange(e) {
        this.state.warn = false;
        this.state.start_time = this.refs['start_time'].value;
        if (e.target.name == this.props.start) {
            if (this.state.end_time === '') {
                this.refs['end_time'].value = today;
            }
        }
        this.state.end_time = this.refs['end_time'].value;
        this.forceUpdate();
        if (Math.abs(Date.parse(this.state.start_time)) > Math.abs(Date.parse(this.state.end_time))) {
            this.state.warn = true;
            this.state.warnText = "请输入正确的时间范围";
            if (e.target.name == this.props.start) {
                this.refs['start_time'].value = "";
            } else {
                this.refs['end_time'].value = "";
            }
            this.forceUpdate();
        }
    }

    render() {
        return (
            <div key={this.props.name || ""} className="item" onChange={this.dateChange.bind(this)}>
                <div>{this.props.title || "时间"}:</div>
                <input className="date" ref='start_time' type="date" name={this.props.start}/>
                -
                <input className="date" ref='end_time' type="date" name={this.props.end}/>
                {!this.props.noWarn ?
                    <div className="date-warn">{this.state.warn ? this.state.warnText : null}</div> : null}

            </div>
        );
    }
}
