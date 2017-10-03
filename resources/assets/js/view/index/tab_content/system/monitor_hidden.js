/**
 * Created by lrx on 2017/5/19.
 */

import React from 'react';
import * as monitorConfigAction from '../../../../action/system/monitor_config'

class MonitorHidden extends React.Component {
    render() {
        return(
            <div className="off-shelf">
                <div className="warning"/>
                <div>是否确定一键隐藏 <span>产品实时监控模块</span> ，此操作不可恢复！</div>
                <div>输入登录密码确认</div>
                <div>
                    <input type="password" placeholder="输入登录密码确认"/>
                </div>
                <div className="button">
                    <button type="button" className="blue">确定
                    </button>
                    <button type="button" onClick={monitorConfigAction.monitorHiddenClose.bind(this)}>取消</button>
                </div>
            </div>
        )
    }
}
export default MonitorHidden