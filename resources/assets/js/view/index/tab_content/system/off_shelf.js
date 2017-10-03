/**
 * Created by lrx on 2017/5/18.
 */
import React from 'react';
import * as systemConfigAction from '../../../../action/system/system_config'

class OffShelf extends React.Component {
    render() {
        return(
            <div className="off-shelf">
                <div className="warning"/>
                <div>是否确定一键强制下架所有产品，此操作不可恢复！</div>
                <div>请输入密码确认</div>
                <div>
                    <input type="password" placeholder="输入登录密码确认"/>
                </div>
                <div className="button">
                    <button type="button" className="blue">保存
                    </button>
                    <button type="button" onClick={systemConfigAction.offShelfClose.bind(this)}>取消</button>
                </div>
            </div>
        )
    }
}
export default OffShelf