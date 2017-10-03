/**
 * Created by sucksuck on 2017/4/10.
 */

import React from 'react';

export default class extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
    }

    onClick(type,e) {
        e.preventDefault();
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    render() {
        return (
            <div className="prompt">
                <div className="icon"/>
                <div className="content">{this.props.content}</div>
                <div className="button">
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>{this.props.text?this.props.text:"我知道了"}</button>
                </div>
            </div>);
    }
}