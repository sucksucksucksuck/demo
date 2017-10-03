/**
 * Created by sucksuck on 2017/6/27.
 */
import React from 'react';
import {connect} from 'react-redux';
import * as platformAction from '../../../../action/platform';
import * as utilAction from '../../../../action/util';
import Form from '../../../../modules/form';

class VisitSite extends React.Component {
    constructor(props) {
        super(props);
        this.state = props["dataPermission"];
    }

    componentDidMount() {
        platformAction.getAdminInfo({id: this.props.id});

    }

    componentWillReceiveProps(props) {
        this.state = props['dataPermission'];
        this.state.check = {};
        this.forceUpdate();
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    render() {
        return (
            <div className="visit-site">
                <div className="title">访问站点
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <Form
                    defaultValue={this.state.info}
                    save={true}
                    onCancel={this.onClick.bind(this, 'cancel')}
                    onSubmit={() => {
                        this.state.info.id = this.props.id;
                        platformAction.setVisitSite(this.state.info);
                    }}>
                    <table>
                        <tbody>
                        <tr>
                            <td>站点名字</td>
                            <tr>
                                <td><label onClick={() => {
                                    this.state.info.site = "1";
                                }}>
                                    <input name="site"
                                           type="radio"
                                           value="1"/>
                                    璞思科技
                                </label>
                                    <label onClick={() => {
                                        this.state.info.site = "3";
                                    }}>
                                        <input name="site"
                                               type="radio"
                                               value="3"/>
                                        联品科技
                                    </label></td>
                            </tr>
                            <tr>
                                <td>
                                    <label onClick={() => {
                                        this.state.info.site = "2";
                                    }}>
                                        <input name="site"
                                               type="radio"
                                               value="2"/>
                                        监控系统
                                    </label>
                                    <label onClick={() => {
                                        this.state.info.site = "0";
                                    }}>
                                        <input name="site"
                                               type="radio"
                                               value="0"/>
                                        全部
                                    </label></td>
                            </tr>
                        </tr>
                        </tbody>
                    </table>
                </Form>


            </div>);
    }
}

export default connect(({dataPermission}) => ({dataPermission}))(VisitSite);