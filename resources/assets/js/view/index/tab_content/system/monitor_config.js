/**
 * Created by lrx on 2017/5/19.
 */

import React from 'react';
import * as monitorConfigAction from '../../../../action/system/monitor_config'

class ReleaseSystem extends React.Component {
    render() {
        return(
                <div className="monitor-config">
                    <div className="section">
                        <div>
                            <div className="title">监控配置</div>
                            <div>
                                <div>
                                    <div>产品实时监控模块</div>
                                    <div>
                                        <div onClick={monitorConfigAction.monitorHidden.bind(this)}>一键隐藏</div>
                                    </div>
                                </div>
                                <div>
                                    <div>联品管理模块
                                    </div>
                                    <div>
                                        <div>一键隐藏</div>
                                    </div>
                                </div>
                                <div>
                                    <div>朗趣管理模块</div>
                                    <div>
                                        <div className="hidden">已隐藏</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        )
    }
}
export default ReleaseSystem