/**
 * Created by sun_3211 on 2017/2/16.
 */

import React from "react";
import Login_1 from "./auth/login";
import Login_2 from "./auth/login_2";
import Login_3 from "./auth/login_3";
import Index from "./index/index";
import {connect} from 'react-redux';
import * as authAction from '../action/auth';


class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = props["auth"];
    }

    componentWillMount(props) {

    }

    componentDidMount() {
        //console.log(this.state);
        if (window.config.isLogin) {
            //用来做自动登录,但是需要只能开启一个页面,所以未开启
            authAction.autoLogin();
        } else {
            authAction.logout();
        }
    }

    //接收属性改变状态
    componentWillReceiveProps(props) {
        this.setState(props["auth"]);
    }

    render() {
        if (this.state.errcode === 0) {
            return <Index/>
        } else {
            switch (parseInt(window.config.site)) {
                case 2:
                    return <Login_2/>;
                case 3:
                    return <Login_3/>;
                default:
                    return <Login_2/>;
            }
        }
    }
}
//react-redux框架固定写法，auth 是通过redux框架传递的，名称则对应 文件 \source\js\reducer\comments.js 中的值
export default connect(({auth}) => ({auth}))(Main);