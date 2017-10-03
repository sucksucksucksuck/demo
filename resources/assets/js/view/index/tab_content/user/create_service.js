/**
 * Created by sucksuck on 2017/8/2.
 */

import React from 'react';
import Input from '../../../../modules/input';
import * as serviceManageAction from '../../../../action/user/service_manage';

const module = 501;

class CreateService extends React.Component {
    constructor(props) {
        super(props, module);
        this.state = {nickname: "", residual_amount: "", idaf: ""};
    }

    componentDidMount() {

    }

    componentWillReceiveProps(props) {

    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    render() {
        return (
            <div className="dialog-form">
                <div className="title">新增客服号
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="wrap">
                    <form
                        onChange={(e) => {
                            this.state[e.target.name] = e.target.value;
                            this.forceUpdate()
                        }}
                    >
                        <table>
                            <tbody>
                            <tr>
                                <td>昵称</td>
                                <td>
                                    <Input verify="" maxLength="50" name="nickname"/>
                                </td>
                            </tr>
                            <tr>
                                <td>盘古币</td>
                                <td>
                                    <Input verify="^[\d]*$" maxLength="10" name="residual_amount"/>
                                </td>
                            </tr>
                            <tr>
                                <td>备注</td>
                                <td><textarea name="idaf" maxLength="64"/>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </form>

                </div>
                <div className="button">
                    <button type="submit" className="blue"
                            onClick={serviceManageAction.createService.bind(null, this.state,this.props.search)}>新增
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>
            </div>
        )
    }
}

export default CreateService;