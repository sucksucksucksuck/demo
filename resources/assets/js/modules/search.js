/**
 * Created by sucksuck on 2017/3/8.
 */

import React from 'react';


export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            split: props.split || false,
            show: true
        };
        if (this.state.split) {
            this.state.show = false;
        }
    }

    onFormChange(e) {
        if (this.props.onChange) {
            this.props.onChange(e);
        }
    }

    componentDidMount() {
        console.log(this)
        if (this.props.defaultValue) {
            let els = this.refs['form'].elements;
            for (let i = 0; i < els.length; i++) {
                els[i].value = this.props.defaultValue[els[i].name] || "";
            }
        }
        this.forceUpdate();

    }

    componentWillReceiveProps() {
        this.forceUpdate();
    }

//this.props 调用父组件的onSubmit方法
    onSubmit(e) {
        e.preventDefault();
        if (this.props.onSubmit) {
            this.props.onSubmit();
        }
    }


    render() {
        return (
            <form className="module-search"
                  ref="form"
                  method="post"
                  onChange={this.onFormChange.bind(this)}
                  onSubmit={this.onSubmit.bind(this)}
                // defaultValue={this.state.search}
            >
                <div className="block">
                    <div className={"condition" + (this.state.show ? "" : " hide")}>
                        {this.props.children}
                    </div>
                    <button className="search">搜索</button>
                    {this.state.split ? (
                        <div className="split">
                            <button type="button" className={this.state.show ? "hide" : "show"} onClick={() => {
                                this.setState({show: !this.state.show});
                            }}/>
                        </div>) : null}
                </div>
            </form>
        )
    }
}