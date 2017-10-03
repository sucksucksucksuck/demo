/**
 * Created by sucksuck on 2017/7/4.
 */
import React from 'react';
import {connect} from 'react-redux';
import Form from '../../../../modules/form';
import Input from '../../../../modules/input';
import Select from '../../../../modules/select';
import * as vipAction from '../../../../action/vip_manage/vip_manage';
import SelectSearch from '../../../../modules/select_search';

class EditVip extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['editVip'];
    }

    componentDidMount() {  //render前

    }

    componentWillMount() {  //render前
        if (this.props.id) {
            vipAction.getVipInfo({id: this.props.id});
        }
        vipAction.getPromoters({type: 1, style: 2});
        this.initState(this.state.promoter_list);

    }

    componentWillUpdate() {

    }

    componentWillUnmount() {
         vipAction.clearVipInfo();
    }

    initState(obj) {
        this.state.list = [];
        for (let c in obj) {
            let temp = {};
            temp[c] = obj[c];
            this.state.list.push(temp);
            if (obj[c] == this.state.admin_id) {
                this.state.option = c;
            }
        }
    }

    componentWillReceiveProps(props) {
        this.state = props['editVip'];
        this.initState(this.state.promoter_list);
        this.forceUpdate();
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

    onHandleChange(hover) {
        this.state.option = hover;
    }

    render() {
        return (
            <div className="edit-vip dialog-form" onClick={(e) => {
                if (e.target.id !== "select" && e.target.id !== "span") {
                    this.state.show = false;
                    this.forceUpdate();
                }
            }}>
                <div className="title">{this.props.id ? "编辑客户" : "添加客户"}
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="wrap">
                    <Form
                        defaultValue={this.state}
                        onChange={(e) => {
                            this.state[e.target.name] = e.target.value;
                        }}
                    >
                        <table>
                            <tbody>
                            <tr>
                                <td>用户UID</td>
                                <td className={this.props.id ? "disable" : null}>{this.props.id ? this.state.user_id :
                                    <Input verify="^[\d]*$" maxLength="10" name="user_id"/>}
                                </td>
                            </tr>
                            <tr>
                                <td>手机号</td>
                                <td>
                                    <Input verify="^[\d]*$" maxLength="20" name="phone"/>
                                </td>
                            </tr>
                            <tr>
                                <td>推广员</td>
                                <td className="select-wrap">
                                    <SelectSearch list={this.state.list} promoter_list={this.state.promoter_list} defaultValue={this.props.id ? this.state.group_id : "请选择"}
                                                  onHandleChange={this.onHandleChange.bind(this)}/>
                                </td>
                            </tr>
                            <tr>
                                <td>微信号</td>
                                <td><Input verify="" maxLength="50" name="wechat"/>
                                </td>
                            </tr>
                            <tr>
                                <td>备注</td>
                                <td><textarea name="user_remake" maxLength="200"/>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </Form>
                </div>
                <div className="button">
                    <button type="button" onClick={() => {
                        if (this.state.option) {
                            this.state.admin_id = this.state.promoter_list[this.state.option];
                        } else {
                            this.state.admin_id = "";
                        }
                        if (this.props.id) {
                            vipAction.setVipInfo(this.state, this.props.search);
                        } else {
                            vipAction.createVipInfo(this.state, this.props.search);
                        }
                    }}>保存
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>
            </div>
        )

    }
}

export default connect(({editVip}) => ({editVip}))(EditVip);
