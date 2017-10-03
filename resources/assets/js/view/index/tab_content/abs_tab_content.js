/**
 * Created by sucksuck on 2017/5/17.
 */

import React from 'react';
import {history} from 'react-router-dom';
import {Route} from 'react-router-dom'
import {browserHistory} from 'react-router'
export default class extends React.Component {
    constructor(props, module) {
        super(props);
        //判断权限
        if (!window.hasPermission(module,0)) {
            window.routerHistory.go('/error');
            window.routerHistory.push('/error');
            return null;
        }

    }
}