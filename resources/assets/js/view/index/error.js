/**
 * Created by sucksuck on 2017/5/17.
 */

import React from 'react';

class Error extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<div className="error_page">
            <div className="icon"/>
            <div className="text">对不起，您没有权限哦，如有需要请联系管理员</div>
        </div>);

    }
}
export default Error;
