/**
 * Created by sun_3211 on 2017/3/31.
 */
import React from 'react'


export default class extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            value: props.defaultValue || "",
        }
        let verify = this.props.verify
        if (typeof(verify) === 'string') {
            let reg = new RegExp(verify)
            this.verify = reg.test.bind(reg)
        } else if (typeof(verify) === 'function') {
            this.verify = verify
        } else {
            this.verify = false
        }
    }

    componentDidMount() {  //render前
        let input = this.refs['input']
        Object.defineProperty(input, "defaultValue", {
            get: function () {
                return this.state.value
            }.bind(this),
            set: function (v) {
                if (this.props.allowNull !== false && v === "") {
                    this.state.value = ""
                } else if (this.verify && this.verify(v)) {
                    this.state.value = v
                }
                if (this.props.allowZero) {
                    if (v) {
                        this.state.value = v
                    } else {
                        this.state.value = 0
                    }
                }
                this.forceUpdate()
            }.bind(this)
        })
    }

    componentWillReceiveProps(props) {
    }

    onChange(e) {
        e.preventDefault()
        let v = e.target.value
        if (this.props.allowNull === false && v === "") {
            return
        }
        if (this.props.allowNull !== false && v === "") {
            this.state.value = ""
        } else if (this.verify && this.verify(v)) {
            this.state.value = v
        }
        this.forceUpdate()
        if (this.props.onChange) {
            this.props.onChange(this.state.value, e)
        }
    }

    render() {
        return <input ref="input"
                      type={this.props.type || "text"}
                      className={this.props.className}
                      value={this.state.value}
                      maxLength={this.props.maxLength}
                      name={this.props.name}
                      placeholder={this.props.placeholder}
                      onChange={this.onChange.bind(this)}/>
    }
}