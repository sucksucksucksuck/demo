/**
 * Created by sucksuck on 2017/6/12.
 */
import React from 'react';

export default class extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
    }


    render() {
        return (
            <i className="fa fa-spinner fa-pulse fa-3x fa-fw margin-bottom"/>
            );
    }
}