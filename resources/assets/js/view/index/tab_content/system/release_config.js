/**
 * Created by lrx on 2017/5/19.
 */

import React from 'react';
import * as releaseConfigAction from '../../../../action/system/release_config'

export default class extends React.Component {
    constructor(props) {
        super(props);
        // this.state = props['systemConfig'];
        this.state = {
            composer: false,
            npm: false,
            build: false,
            build_360: false,
            dev: false,
            zip: false,
            show: false,
            up_click: true,
            message: [],
            bar_left: 0
        };
        this.xhr = new XMLHttpRequest();
    }

    componentDidUpdate() {
        this.refs["msg"].scrollTop = this.refs["msg"].scrollHeight;
    }

    releaseSystem() {
        this.state.up_click = false;
        this.state.message = [];
        this.forceUpdate();
        this.xhr.previous_text = '';
        this.xhr.onerror = function (e) {
            console.error(e);
        };
        this.xhr.onreadystatechange = function () {
            if (this.xhr.readyState > 2) {
                let new_response = this.xhr.responseText.substring(this.xhr.previous_text.length);
                new_response = new_response.trim();
                if (new_response) {
                    try {
                        let data = new_response.split('\n');
                        data.forEach(function (json) {
                            let result = JSON.parse(json.trim());
                            if (result.type === 2) {
                                this.state.show = true;
                                this.state.bar_left = result.value;
                            } else {
                                this.state.message.push(new Date().format('hh:mm:ss') + " => " + result.value + "\n");
                            }
                            this.forceUpdate()
                        }, this);
                    } catch (e) {
                        console.error(e, new_response);
                    }
                    this.setState({});
                }
                this.xhr.previous_text = this.xhr.responseText;
            }
            if (this.xhr.readyState === 4) {
                this.xhr.previous_text = '';
                this.setState({up_click: true})
            }
        }.bind(this);
        let p = "";
        let params = [];
        if (this.state.composer) {
            p += "c";
        }
        if (this.state.npm) {
            p += "n";
        }
        if (this.state.build) {
            p += "b";
        }
        if (p) {
            p = "-" + p;
            params.push(p);
        }
        if (this.state.build_360) {
            params.push('360');
        }
        if (this.state.dev) {
            params.push('dev');
        }
        if (this.state.zip) {
            params.push('zip');
        }
        this.xhr.open("GET", window.config.root + "/notify/update_online_code/update?" + params.join('&'), true);
        this.xhr.send();
    }

    render() {
        return (
            <div className="release-config">
                <div className="section">
                    <div>
                        <div className="title">发布配置</div>
                        <div className="config-left">
                            <div>
                                <div>
                                    更新composer包
                                </div>
                                <div>
                                    <div className={this.state.composer ? "open" : "close"}
                                         onClick={() => {
                                             this.state.composer = !this.state.composer;
                                             this.forceUpdate()
                                         }}>
                                        <div className="switch"/>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div>
                                    更新nodejs包
                                </div>
                                <div>
                                    <div className={this.state.npm ? "open" : "close"}
                                         onClick={() => {
                                             this.state.npm = !this.state.npm;
                                             this.forceUpdate()
                                         }}>
                                        <div className="switch"/>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div>
                                    编译js
                                </div>
                                <div>
                                    <div className={this.state.build ? "open" : "close"}
                                         onClick={() => {
                                             this.state.build = !this.state.build;
                                             this.forceUpdate()
                                         }}>
                                        <div className="switch"/>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div>
                                    不编译360浏览器
                                </div>
                                <div>
                                    <div className={this.state.build_360 ? "open" : "close"}
                                         onClick={() => {
                                             this.state.build_360 = !this.state.build_360;
                                             this.forceUpdate()
                                         }}>
                                        <div className="switch"/>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div>
                                    开发模式
                                </div>
                                <div>
                                    <div className={this.state.dev ? "open" : "close"}
                                         onClick={() => {
                                             this.state.dev = !this.state.dev;
                                             this.forceUpdate()
                                         }}>
                                        <div className="switch"/>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div>
                                    压缩代码
                                </div>
                                <div>
                                    <div className={this.state.zip ? "open" : "close"}
                                         onClick={() => {
                                             this.state.zip = !this.state.zip;
                                             this.forceUpdate()
                                         }}>
                                        <div className="switch"/>
                                    </div>
                                </div>
                            </div>
                            {this.state.up_click ?
                                <div className="release-system"
                                    // onClick={this.releaseSystem.bind(this)}
                                     onClick={releaseConfigAction.releaseSystem.bind(this, this.releaseSystem.bind(this))}
                                >发布系统
                                </div> : <div className="release-system">发布系统</div>
                            }
                        </div>
                    </div>
                    <div>
                        <div className="title">控制台信息</div>
                        {this.state.show ? <div className="progress">
                            <div className="bar" style={{width: this.state.bar_left + "%"}}/>
                            <div className="count">{this.state.bar_left + "%"}</div>
                        </div> : null}
                        <div className="message" ref="msg">
                            <div>{this.state.message}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}