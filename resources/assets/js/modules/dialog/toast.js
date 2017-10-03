/**
 * Created by sucksuck on 2017/4/22.
 */

import React from 'react';
import * as utilAction from '../../action/util';
export default class extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
    }

    // onClick(type) {
    //     if (this.props.onClick) {
    //         this.props.onClick(type);
    //     }
    // }

    componentWillMount(){

    }

    componentDidMount() {
        if(!this.props.type){
            window.setTimeout(()=>{
                document.getElementsByClassName("alert")[0].style.opacity = 0;
            },1500);
            window.setTimeout(()=>{
                utilAction.close("toast");
            },2000);
        }
    }

    render() {
        return (
            <div className="alert bounceIn">
                <div className="icon"/>
                <div className="content">{this.props.content}</div>
            </div>);
    }
}