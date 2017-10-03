/**
 * Created by sucksuck on 2017/8/2.
 */

import React from 'react';
import Input from '../../../../modules/input';

const module = 501;

class EditService extends React.Component {
    constructor(props) {
        super(props, module);
        this.state = {};
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
            <div className="edit-vip">
                <div className="title">新增客服号成功
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
                                <td>客服UID</td>
                                <td className="disable">
                                    {this.props.data.user_id || ""}
                                </td>
                            </tr>
                            <tr>
                                <td>登录账号</td>
                                <td className="disable">
                                    {this.props.data.phone || ""}
                                </td>
                            </tr>
                            <tr>
                                <td/>
                                <td>默认密码：88888888</td>
                            </tr>
                            <tr>
                                <td>昵称</td>
                                <td className="disable">
                                    {this.props.data.nickname || ""}
                                </td>
                            </tr>
                            <tr>
                                <td>盘古币</td>
                                <td className="disable">
                                    {this.props.data.residual_amount || ""}
                                </td>
                            </tr>
                            <tr>
                                <td>备注</td>
                                <td className="disable">
                                    {this.props.data.idaf || ""}
                                </td>
                            </tr>

                            </tbody>
                        </table>
                    </form>
                    <div className="button">
                        <button type="button" onClick={this.onClick.bind(this, 'cancel')}>我知道了</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default EditService;