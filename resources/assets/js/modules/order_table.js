/**
 * Created by s on 2017/3/7.
 */
import Table from './table';
import React from 'react';
const orderTable = true;
//订单列表每行外面都包裹tbody 其他simpleTable每行都只有tr 继承Table 要把该变量回传到Table里 判断该列表是否为OrderTable
export default class extends Table {
    constructor(props) {
        super(props,orderTable);
    }

    getColumnStyle(val, head, item) {
        if (this.props.getColumnStyle) {
            let result = this.props.getColumnStyle(val, head, item);
            if (result !== undefined) {
                return result;
            }
        }
        switch (head.type) {
            case "img":
                return (<div><img src={item.icon} onError={(e) => {
                    e.target.src = window.config.root + "/image/index/index_user.png";
                }}/></div>);
        }
        return super.getColumnStyle(val, head, item);
    }

    getRowStyle(item, index) {
        return (
            <tbody key={index}
                //根据state里的primarykey主键的值 返回一个{id_1:false}的键值对放进state.checked数组里
                   onClick={() => {
                       this.state.checked[`id_${item[this.state.primaryKey]}`] = !this.state.checked[`id_${item[this.state.primaryKey]}`];
                       this.setChecked();
                       this.forceUpdate();
                   }}>
            <tr>
                <td colSpan="99"/>
            </tr>
            <tr>
                <td colSpan="99">
                    <div>编号：{item.order_id}</div>
                    <div>商品ID：{item.goods_id}</div>
                    <div>商品期数：{item.periods}</div>
                    {item.order_no ? <div>支付单号：{item.order_no}</div> : null}
                    <div className={window.hasPermission(216, 0) ? "periods" : null}>期数ID：
                        <div onMouseUp={this.periodsClick.bind(this, item)}>{item.id}</div>
                    </div>
                    <div>购买时间：{item.o_create_at}</div>
                    {item.lottery_show_at == null ? null : <div>开奖时间：{item.lottery_show_at}</div>}
                    {item.payment_no == "" ? <div>流水号：{item.payment_no}</div> : null}
                    {item.confirm_at == null ? null : <div>确认时间:{item.confirm_at}</div>}
                    {item.deliver_at == null && (item.winning == 0 || item.winning == undefined) ? null :
                        <div>发货时间:{item.deliver_at}</div>}
                </td>
            </tr>
            <tr>
                {this.getCheckbox(item)}
                {this.state.head.map(function (h, i) {
                    return (
                        <td key={i} className={h.className}>
                            {this.getColumnStyle(item[h.key], h, item)}
                        </td>);
                }, this)}
                {this.state.button ?
                    <td className="button">
                        {this.getButton(item)}
                    </td> : null}
            </tr>
            </tbody>
        );
    }
}