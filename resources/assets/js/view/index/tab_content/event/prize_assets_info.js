/**
 * Created by sucksuck on 2017/5/27.
 */

import React from 'react';
import Form from'../../../../modules/form';
import Input from '../../../../modules/input';
import {connect} from 'react-redux';
import * as eventAction from '../../../../action/event/prize_assets_info';
import * as utilAction from '../../../../action/util';

class AssetsInfo extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['prizeAssetsInfo'];
    }

    componentDidMount() {  //render前

    }

    componentWillMount() {  //render前
        if (this.props.id) {
            eventAction.getPrizeAssetsInfo({id: this.props.id})
        }
    }

    componentWillUpdate() {

    }

    componentWillUnmount() {
        eventAction.prizeInfoClear();
    }

    componentWillReceiveProps(props) {
        this.state = props['prizeAssetsInfo'];
        this.forceUpdate();
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    render() {
        return (
            <div className="delivery">
                <div className="title">{this.props.id ? "编辑资产奖品" : "添加资产奖品"}
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="wrap">
                    <Form
                        defaultValue={this.state}
                        onChange={(e) => {
                            this.state[e.target.name] = e.target.value;
                            this.forceUpdate();
                        }}>
                        <table>
                            <tbody>
                            {this.props.id ? <tr>
                                <td>ID</td>
                                <td className="disable">{this.state.id}
                                </td>
                            </tr> : null}
                            <tr>
                                <td>奖品标题</td>
                                <td><Input verify="" name="title"/>
                                </td>
                            </tr>
                            <tr>
                                <td>类型</td>
                                <td>
                                    <label >
                                        <input name="type"
                                               type="radio"
                                               value="4"/>
                                        盘古币
                                    </label>
                                    <label >
                                        <input name="type"
                                               type="radio"
                                               value="5"/>
                                        积分
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <td>分组</td>
                                <td><Input verify="" name="group"/>
                                </td>
                            </tr>
                            <tr>
                                <td>权重</td>
                                <td><Input verify="" name="chance"/>
                                </td>
                            </tr>
                            <tr>
                                <td>次数</td>
                                <td><Input verify="" name="count"/>
                                </td>
                            </tr>
                            <tr className="red">
                                <td/>
                                <td>*为空表示无限</td>
                            </tr>
                            </tbody>
                        </table>
                    </Form>
                </div>
                <div className="button">
                    <button type="button" onClick={() => {
                        if (this.props.id) {
                            eventAction.setPrizeAssetsInfo(this.state, this.props.search);
                        } else {
                            this.state.event_id = this.props.event_id;
                            eventAction.createPrizeAssetsInfo(this.state, this.props.search);
                        }
                    }}>保存
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>
            </div>
        )

    }
}
export default connect(({prizeAssetsInfo}) => ({prizeAssetsInfo}))(AssetsInfo);
