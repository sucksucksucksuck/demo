/**
 * Created by sucksuck on 2017/4/21.
 */
import React from 'react';
import {connect} from 'react-redux';
import * as platformAction from '../../../../action/platform';
import * as utilAction from '../../../../action/util';
import Paging from '../../../../modules/paging';
import SimpleTable from '../../../../modules/simple_table';
const head = [
    {"text": "时间", "key": "create_at", "type": "create_at", className: "img w150"},
    {"text": "操作", "key": "log", "type": "log", className: "w400"},
    {"text": "IP", "key": "ip", "type": "user", className: "user w150"},


];
class AdminLog extends React.Component {
    constructor(props) {
        super(props);
        this.state = props["adminLog"];
        this.state.search.id = this.props.extend;
        //通过属性传递state过来
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    componentWillMount() {
        platformAction.getAdminLog(this.state.search);
    }

    componentWillReceiveProps(props) {
        this.state = props["adminLog"];
        this.forceUpdate();

    }
    getColumnStyle(val, head, item) {


    }
    getTotal() {
        return null;
    }

    getPage() {
        return this.state.search.page;
    }


    onPage(page, pageSize) {
        this.state.search.page = page;
        this.state.search.page_size = pageSize;
        platformAction.getAdminLog(this.state.search);
        this.forceUpdate();
    }
    onPageSizeChange(e) {
        if (e.target.value == "") {
            this.state.page_size = "";
        } else {
            let page = parseInt(e.target.value);
            if (!page) {
                this.state.page_size = "";
            } else {
                if (page > 100) {
                    this.state.page_size = 100;
                } else {
                    this.state.page_size = page;
                }
            }
            this.forceUpdate();
        }
    }
    render() {
        return (
            <div className="log">
                <div className="user-info">
                    <div className="details">
                        <div className="user-item">
                            <div className="sub-item">
                                <img src="" onError={(e) => {
                                    e.target.src = window.config.root + "/image/index/index_user.png";
                                }}/>
                            </div>
                            <div className="border"/>
                            <div className="sub-item">
                                <div>工号</div>
                                <div>{this.state.user_info.employee_id} </div>
                            </div>
                            <div className="border"/>
                            <div className="sub-item">
                                <div>姓名</div>
                                <div>{this.state.user_info.truename}</div>
                            </div>
                            <div className="border"/>
                            <div className="sub-item">
                                <div>账号</div>
                                <div>{this.state.user_info.account}</div>
                            </div>
                            <div className="border"/>
                            <div className="sub-item">
                                <div>手机号码</div>
                                <div>{this.state.user_info.phone}</div>
                            </div>
                            <div className="border"/>
                            <div className="sub-item">
                                <div>性别</div>
                                <div>{this.state.user_info.sex=="1"?"男":"女"}</div>
                            </div>
                            <div className="border"/>
                            <div className="sub-item">
                                <div>角色</div>
                                <div>{this.state.user_info.title}</div>
                            </div>
                            <div className="border"/>
                            <div className="sub-item">
                                <div>状态</div>
                                <div>{this.state.user_info.status == "1"?"正常":"禁用"}</div>
                            </div>
                            <div className="border"/>
                            <div className="sub-item">
                                <div>注册时间</div>
                                <div>{this.state.user_info.create_at}</div>
                            </div>
                        </div>
                    </div>

                </div>
                {this.state.rows.length ?  <SimpleTable head={head}
                                                        getColumnStyle={this.getColumnStyle.bind(this)}
                                                        ref="table"
                                                        rows={this.state.rows}
                                                        checkbox={false}/>: <div className="list_null"/>}

                <Paging total={this.getTotal()}
                        page={this.getPage()}
                        onPaginate={this.onPage.bind(this)}
                        type="2"
                        size={this.state.size}
                        onPageSizeChange={this.onPageSizeChange.bind(this)}
                        page_size={this.state.page_size}
                        home_page={this.state.home_page}
                />
            </div>);
    }
}
export default connect(({adminLog}) => ({adminLog}))(AdminLog);

