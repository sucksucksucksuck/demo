/**
 * Created by lrx on 2017/5/19.
 */

import React from 'react';
import * as releaseConfigAction from '../../../../action/system/release_config'

class ReleaseSystem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
           value:''
        };

    }
    render() {
        return (
            <form className="off-shelf"
                  method="post"
                  onSubmit={(e) => {
                      e.preventDefault();
                      releaseConfigAction.pwdSure({password:this.state.value},this.props.onConfirm);
                      releaseConfigAction.releaseClose();
                  }}>
                <div className="warning"/>
                <div>是否确定发布系统，此操作不可恢复！</div>
                <div>输入登录密码确认</div>
                <div>
                    <input autoFocus type="password" name="pwd" placeholder="输入登录密码确认" value={this.state.value}
                        onChange={(e)=>{this.state.value=e.target.value;this.forceUpdate()}}
                    />
                </div>
                <div className="button">
                    <button className="blue" type="submit"
                    >
                        确定
                    </button>
                    <button type="button" onClick={releaseConfigAction.releaseClose.bind(this)}>取消</button>
                </div>
            </form>
        )
    }
}
export default ReleaseSystem;