/**
 * Created by sun_3211 on 2017/3/10.
 */
import Table from './table';
import React from 'react';

//simple_table继承Table
export default class extends Table {
    constructor(props) {
        super(props);
    }

    getColumnStyle(val, head, item) {
        if (head.type === "actual_amount") {
            return item.unit_price * item.total;
        }
        if (head.type === "img") {
            return (<div><img src={item.icon} onError={(e) => {
                e.target.src = window.config.root + "/image/index/index_user.png";
            }}/></div>);
        }

        if (this.props.getColumnStyle) {
            let result = this.props.getColumnStyle(val, head, item);
            if (result !== undefined) {
                return result;
            }
        }
        return super.getColumnStyle(val, head, item);
    }

    getRowStyle(item, index) {
        return (
            <tr key={index} onClick={() => {
                this.state.checked[`id_${item[this.state.primaryKey]}`] = !this.state.checked[`id_${item[this.state.primaryKey]}`];
                this.setChecked();
                this.forceUpdate();
            }}>{this.getCheckbox(item)}
                {this.state.head.map(function (h, i) {
                    return (<td key={i} className={h.className}>{this.getColumnStyle(item[h.key], h, item)}</td>);
                }, this)}
                {this.state.button ?
                    <td className="button">
                        {this.getButton(item)}
                    </td> : null}</tr>
        );
    }


}