/**
 * Created by sucksuck on 2017/4/16.
 */
import React from 'react';

export default class extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    render() {
        return (
            <div className="permission">
                <div className="icon"/>
                <div className="content">{this.props.content}</div>
                <div className="button">
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>关闭</button>
                </div>
            </div>);
    }
}