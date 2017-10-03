/**
 * Created by sucksuck on 2017/3/8.
 */

import React from 'react';
import * as validity from './form_validity';


export default class extends React.Component {
    constructor(props) {
        super(props);
    }

    onFormChange(e) {
        if (this.props.onChange) {
            this.props.onChange(e);
        }
    }

    getValue(extend) {
        let data = new FormData(this.refs['form']);
        if (extend) {
            Object.keys(extend).forEach(function (key) {
                let value = extend[key];
                if (typeof( value) === "object" && value instanceof Array) {
                    try {
                        for (let i = 0; i < value.length; i++) {
                            data.append(key + "[]", extend[key][i]);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    data.append(key, extend[key]);
                }
            }, this);
        }
        return data;

    }

    setValue(data) {
        if (!data) {
            return;
        }
        for (let i = 0; i < this.refs["form"].length; i++) {
            let el = this.refs["form"].elements[i];
            if (!el.name) {
                continue;
            }
            let name = el.name;
            let val = false;
            if (name.indexOf("[]") > 1) {
                name = name.substr(0, name.length - 2);
            }
            try {
                if (data[name].length > 17) {
                    val = data[name];
                } else {
                    val = JSON.parse(data[name]);
                }
            } catch (e) {
                val = data[name];
            }
            if (el.setValue) {
                el.setValue(val);
            } else {
                switch (el.type) {
                    case 'radio':
                        if (el.value == val || (!val && el.dataset.default)) {
                            el.checked = true;
                        }
                        break;
                    case "select-multiple":
                        for (let j = 0; j < el.options.length; j++) {
                            if (data[name] instanceof Array) {
                                el.options[j].selected = (val.indexOf(el.options[j].value) >= 0 || val.indexOf(parseInt(el.options[j].value)) >= 0);
                            } else {
                                el.options[j].selected = !!val;
                            }
                        }
                        break;
                    case "checkbox":
                        try {
                            if (val instanceof Array) {
                                el.checked = (val.indexOf(el.value) >= 0 || val.indexOf(parseInt(el.value)) >= 0);
                            } else {
                                el.checked = el.value === val;
                            }
                        } catch (e) {
                            el.checked = el.value === val;
                        }

                        break;
                    case "file":
                        break;
                    case "datetime-local":
                        if (val) {
                            el.value = val;
                        }
                    case "text":
                        if (val) {
                            el.value = val;
                        }
                    case "textarea":
                        if (val) {
                            el.value = val;
                        }
                    default:
                        if (typeof (el.defaultValue) !== "undefined") {
                            el.defaultValue = val || el.dataset["default"] || "";
                        } else {
                            el.value = val || el.dataset["default"] || "";
                        }
                        break;
                }
            }
        }
        if (this.props.onReset) {
            this.props.onReset(this.refs["form"].elements);
        }
    }

    componentDidMount() {
        this.setValue(this.props.defaultValue);
    }

    componentDidUpdate() {
        this.setValue(this.props.defaultValue);
    }

    componentWillReceiveProps() {
        this.setValue(this.props.defaultValue);
        this.forceUpdate(function () {
            this.setValue(this.props.defaultValue);
        });
    }

//this.props 调用父组件的onSubmit方法
    onSubmit(e) {
        e.preventDefault();
        for (let i = 0; i < this.refs["form"].length; i++) {
            let el = this.refs["form"].elements[i];
            validity.setCustomValidity(el, this.refs["form"]);
        }
        if (this.props.onValidity) {
            this.props.onValidity(this.refs["form"]);
        }
        if (this.refs["form"].reportValidity() && this.props.onSubmit) {
            this.props.onSubmit();
        }
    }

    delivery() {
        if (this.props.delivery) {
            this.props.delivery();
        }

    }

    refuse() {
        if (this.props.refuse) {
            this.props.refuse();
        }
    }

    onCancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        } else {
            window.history.back();
        }
    }


    render() {
        return (
            <form className="module-form"
                  ref="form"
                  method="post"
                  onChange={this.onFormChange.bind(this)}
                  onSubmit={this.onSubmit.bind(this)}
            >
                {this.props.children}
                <div className="button">
                    {this.props.deliveryBtn == 3 || this.props.deliveryBtn == 4 ?
                        null : <button type="button" className="delivery" onClick={this.refuse.bind(this)}>
                            拒绝</button>}
                    {this.props.deliveryBtn == 3 || this.props.deliveryBtn == 4 ?
                        null : <button type="button" className="delivery" onClick={this.delivery.bind(this)}>
                            发货</button>}
                    {this.props.save ? <button>保存</button> : null}
                    {this.props.cancel ? null : <button type="button" onClick={this.onCancel.bind(this)}>取消</button> }

                </div>
            </form>
        )

    }
}