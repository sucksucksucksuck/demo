/**
 * Created by sucksuck on 2017/9/30 17:53.
 */
import React from 'react'
import {connect} from 'react-redux'
import * as eventAction from '../../../../action/event/count'
import Form from "../../../../modules/form"
class Rechange extends React.Component {
    constructor(props) {
        super(props)
        // this.state = props['systemConfig'];
        /*获取数据*/
        this.state = {recharge: {}, consume: {}}


    }

    onChange(name, e) {
        this.state[name][e.target.name] = e.target.value
        this.forceUpdate()
    }

    search() {

    }


    render() {
        return (
            <div className="agency-details">
                <div className="wrap">
                    <div className="content">
                        <div className="title"><span className="iconfont">&#xe620;</span>充值</div>
                        <div className="tip">提示：你当前剩余 <span className="red">xxx金币</span>，最多可代理充值 <span className="red">4598.00</span>元，如金币不足请及时向平台充值。
                        </div>
                        <div className="recharge">
                            <div>
                                <div><span>游戏ID</span>
                                    <div><input type="text"/>
                                        <button onClick={this.search.bind(this)}>查询</button>
                                    </div>
                                </div>
                                <div><span>充值金额</span>
                                    <div><input type="text"/></div>
                                </div>
                            </div>
                            <div>
                                <div>昵称：xxxx</div>
                                <div>金币：123个</div>
                            </div>
                        </div>
                        <div className="button">
                            <button>保存</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default connect(({}) => ({}))(Rechange)
