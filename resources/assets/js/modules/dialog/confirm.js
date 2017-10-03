/**
 * Created by sun_3211 on 2017/4/1.
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
    onClose(){
        window.store.dispatch({
            type: "DIALOG_CLOSE",
            payload: "confirm"
        });
    }

    render() {
        return (
            <div className="confirm">
                <div className="icon"/>
                <div className="content">{this.props.content}</div>
                <div className="button">
                    <button onClick={this.onClick.bind(this, 'ok')} className="blue">确定</button>
                   <button onClick={this.onClose.bind(this)}>取消</button>

                </div>
            </div>);
    }
}