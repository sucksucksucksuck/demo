/**
 * Created by sun_3211 on 2017/3/31.
 */
import React from 'react';

import Paging from '../../../../modules/paging';
import OrderTable from '../../../../modules/order_table';
import Search from '../../../../modules/search'
import * as orderAction from '../../../../action/order';
import * as openWindow from '../../../../modules/open_window/all_order';
import AbsTabContent from '../abs_tab_content';

export default class extends AbsTabContent {
    constructor(props, module) {
        super(props, module);
        //通过属性传递state过来
    }

    complete() {

    }

    exportBatchChange() {
        this.state.exportAll = !this.state.exportAll;
        this.state.export = !this.state.export;
        this.forceUpdate();
    }


    exportChecked() {

    }

    exportOption() {

    }

    closeExport(e) {
        e.preventDefault();
        this.state.export = this.state.export ? false : null;
        this.state.exportAll = this.state.exportAll ? false : null;
        this.state.end_time = "";
        this.state.start_time = "";
        this.state.deliver_end_time = "";
        this.state.deliver_start_time = "";
        this.state.warn = false;
        this.state.warnText = "时间范围只能选取15天以内";
        this.forceUpdate();
    }

    getStatus() {
        return <div></div>;
    }

    getNavigator() {
        return null;
    }

    getTableButton() {
        return null;
    }


    getSearchOrder() {
        return "";
    }

    getTotal() {
        return 0;
    }

    getPage() {
        return 0;
    }

    getSearchRows() {
        return [];
    }

    onItemButtonClick() {

    }

    onPage() {


    }

    getTableButton() {
        return null;
    }

    onFormChange(e) {
        this.state.search[e.target.name] = e.target.value;
        this.forceUpdate();
    }

    onSubmit() {

    }

    getColumnStyle(val, head, item) {
        if (head.type === "user") {
            return <div>
                <div>{item.nickname}</div>
                <div>{item.user_id}</div>
            </div>;
        }
    }

    dateChange(e) {
        this.state[e.target.name] = e.target.value;
        let result = Math.abs((Date.parse(this.state.start_time) / 1000 - Date.parse(this.state.end_time) / 1000) / (3600 * 24));
        let result_deliver = Math.abs((Date.parse(this.state.deliver_start_time) / 1000 - Date.parse(this.state.deliver_end_time) / 1000) / (3600 * 24));

        if ((result <= 15 && Math.abs(Date.parse(this.state.start_time)) < Math.abs(Date.parse(this.state.end_time))) ||
            (result_deliver <= 15 && Math.abs(Date.parse(this.state.deliver_start_time)) < Math.abs(Date.parse(this.state.deliver_end_time)))) {
            this.state.warn = false;
            this.state.warnText = "时间范围只能选取15天以内";
            this.forceUpdate();
        }
        if (Math.abs(Date.parse(this.state.start_time)) > Math.abs(Date.parse(this.state.end_time))) {
            this.refs[e.target.name].value = "";
            this.state.warn = true;
            this.state.warnText = "请输入正确的时间范围";
            this.state[e.target.name] = "";
            this.forceUpdate();
        }
        if (Math.abs(Date.parse(this.state.deliver_start_time)) > Math.abs(Date.parse(this.state.deliver_end_time))) {
            this.refs[e.target.name].value = "";
            this.state.warn = true;
            this.state.warnText = "请输入正确的时间范围";
            this.state[e.target.name] = "";
            this.forceUpdate();
        }
        if (result > 14 && Math.abs(Date.parse(this.state.start_time)) < Math.abs(Date.parse(this.state.end_time))) {
            this.state.warn = true;
            this.state.warnText = "购买时间范围不能超过15天";
            this.forceUpdate();
            this.refs[e.target.name].value = "";
            this.state[e.target.name] = "";

        }
        if (result_deliver > 14 && Math.abs(Date.parse(this.state.deliver_start_time)) < Math.abs(Date.parse(this.state.deliver_end_time))) {
            this.state.warn = true;
            this.state.warnText = "发货时间范围不能超过15天";
            this.forceUpdate();
            this.refs[e.target.name].value = "";
            this.state[e.target.name] = "";
        }
    }

    onPageSizeChange() {

    }

    periodsClick(item) {
        if (window.hasPermission(216, 0)) {
            openWindow.allOrder(item.id);
        }
    }

    getSearch() {
        return null;
    }

    render() {
        return (
            <div className="list-control order-list">
                {this.getNavigator()}
                <Search
                    split={false}
                    onSubmit={this.onSubmit.bind(this)}
                    onChange={this.onFormChange.bind(this)}
                    defaultValue={this.state.search}
                >
                    {this.getSearch()}
                </Search>
                <OrderTable head={this.getTableHead()}
                            onItemButtonClick={this.onItemButtonClick.bind(null, this.state.search)}
                            getColumnStyle={this.getColumnStyle.bind(this)}
                            ref="table"
                            rows={this.getSearchRows()}
                            order={this.getSearchOrder()}
                            periodsClick={this.periodsClick.bind(this)}
                            checkbox={this.state.checkbox}
                >
                    {this.getTableButton()}
                </OrderTable>
                <Paging total={this.getTotal()}
                        page={this.getPage()}
                        onPaginate={this.onPage.bind(this)}
                        type={this.state.type ? this.state.type : 1}
                        size={this.state.size ? this.state.size : false}
                        onPageSizeChange={this.onPageSizeChange.bind(this)}
                        page_size={this.state.page_size}
                        home_page={this.state.home_page}
                />
            </div>);
    }
}