/**
 * Created by sucksuck on 2017/7/5.
 */

import React from 'react';
import * as vipAction from '../../../../action/vip_manage/vip_manage';
import * as utilAction from '../../../../action/util';
import Form from '../../../../modules/form';
import Select from '../../../../modules/select';
import SelectSearch from '../../../../modules/select_search';

class ChangePromoters extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            promoter_list: props.promoterList,
            list: [],
            option: "",
            filter_list: []
        };
    }

    onClick(type, e) {
        e.preventDefault();
        if (this.props.onClick) {
            this.props.onClick(type);
        }

    }

    initState(obj) {
        this.state.list = [];
        for (let c in obj) {
            let temp = {};
            temp[c] = obj[c];
            this.state.list.push(temp);
        }
    }


    componentWillMount() {
        this.initState(this.state.promoter_list);
    }

    componentWillReceiveProps(props) {

        this.forceUpdate();
    }

    onSubmit(e) {
        e.preventDefault();
        if (this.state.option) {
            this.state.admin_id = this.state.promoter_list[this.state.option];
        } else {
            this.state.promoters = "";
        }
        vipAction.editPromoter({id: this.props.ids, admin_id: this.state.admin_id}, this.props.search);
    }

    componentWillUnmount() {
    }

    onHandleChange(hover) {
        this.state.option = hover;
    }

    render() {
        return (
            <div className="change-order-status">
                <div className="title">更改推广员
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <Form className="wrap"
                      defaultValue={this.state}>
                    <span className="item-title">推广员:</span>
                    <SelectSearch list={this.state.list} promoter_list={this.state.promoter_list} defaultValue="请选择"
                                  onHandleChange={this.onHandleChange.bind(this)}/>
                </Form>
                <div className="button">
                    <button type="button"
                            className="blue"
                            onClick={this.onSubmit.bind(this)}>保存
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>

            </div>);
    }
}

export default ChangePromoters;