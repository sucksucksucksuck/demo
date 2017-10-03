/**
 * Created by sucksuck on 2017/6/1.
 */
import React from 'react';
import Form from'../../../../modules/form';
import Input from '../../../../modules/input';
import {connect} from 'react-redux';
import * as eventAction from '../../../../action/event/reissue_prize';
import * as utilAction from '../../../../action/util';

class ReissuePrize extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['prizeRedInfo'];
    }

    componentDidMount() {  //render前

    }

    componentWillMount() {  //render前
        eventAction.getPrizeRedInfo({id: this.props.item.id})
    }

    componentWillUpdate() {

    }

    componentWillUnmount() {
        eventAction.prizeInfoClear();
    }

    componentWillReceiveProps(props) {
        this.state = props['prizeRedInfo'];
        console.log(this.state);
        this.forceUpdate();
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);

        }
    }

    render() {
        return (
            <div className="reissue">
                <div className="title">补发奖品
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="prize-info">
                    <div className="item">
                        <div>活动标题</div>
                        <div>
                            {this.props.event_title}
                        </div>
                    </div>
                    <div className="item">
                        <div>奖品标题</div>
                        <div>
                            {this.props.item.title}
                        </div>
                    </div>
                    {this.props.item.type === 3 ? <div className="item">
                        <div>金额</div>
                        <div>
                            {this.state.min_amount == this.state.max_amount ? this.state.min_amount : this.state.min_amount + "至" + this.state.max_amount}
                        </div>
                    </div> : null}
                    {this.props.item.type === 3 ? <div className="item">
                        <div>使用条件(满减)</div>
                        <div>
                            {this.state.use_amount}
                        </div>
                    </div> : null}

                </div>

                <div className="wrap">
                    <Form
                        defaultValue={this.state}
                        onChange={(e) => {
                            this.state[e.target.name] = e.target.value;
                        }}>
                        <table>
                            <tbody>
                            <tr>
                                <td>用户UID</td>
                                <td><input name="user_id"/>
                                </td>
                            </tr>
                            <tr>
                                <td>数量</td>
                                <td><input name="num"/>
                                </td>
                            </tr>
                            <tr>
                                <td>备注</td>
                                <td><input name="remark"/>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </Form>
                </div>
                <div className="button">
                    <button type="button" onClick={() => {
                        eventAction.setReissuePrize({
                            id: this.props.item.id,
                            event_id: this.props.event_id,
                            user_id: this.state.user_id,
                            num: this.state.num,
                            remark: this.state.remark
                        })
                    }}>保存
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>
            </div>
        )

    }
}
export default connect(({prizeRedInfo}) => ({prizeRedInfo}))(ReissuePrize);
