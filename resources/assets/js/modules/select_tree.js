/**
 * Created by sucksuck on 2017/7/31.
 */
import React from 'react'

export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            id: '',
            role_list: [],
            level: 0,
            option: [],
            admin_group: this.props.admin_group || [],
            defaultValue: this.props.defaultValue || "",
            obj: []
        }
    }

    componentWillMount() {
        if (this.state.admin_group.length) {
            this.createObj()
        }
    }

    componentDidMount() {
    }

    componentWillReceiveProps(props) {
        this.state.admin_group = props.admin_group
        this.state.defaultValue = props.defaultValue
        if (this.state.admin_group.length) {
            this.createObj()
        }
        this.forceUpdate()
    }

    createObj() {
        this.add(this.state.admin_group, this.state.obj)
        this.state.role_list = []
        var tag = []
        this.state.option = []
        this.push(this.state.obj, tag)
        this.setOption(this.state.obj, this.state.option)
        // console.log(this.state.obj)
    }

    add(data, obj) {
        var parent
        for (let c in data) {
            parent = data[c].id
            obj[parent] = {}
            obj[parent].id = data[c].id
            obj[parent].pid = data[c].pid
            obj[parent].title = data[c].title
            obj[parent].isLast = false
            // console.log(data)
            if (data[c].son) {
                if (data[c].son.length) {
                    obj[parent].son = {}
                    this.add(data[c].son, obj[parent].son)
                }
            }
        }
        obj[parent].isLast = true
    }

    push(obj, tag) {
        for (let c in obj) {
            let a = tag
            a.push(obj[c].isLast)
            if (obj[c].son) {
                this.push(obj[c].son, a)
            }
            a.pop()
            obj[c].tag = []
            for (let i = 0; i < a.length; i++) {
                obj[c].tag.push(a[i])
            }
        }
    }

    setOption(obj, arr) {
        for (let c in obj) {
            if (obj[c].tag.length) {
                let blank = ""
                for (let i = 0; i < obj[c].tag.length; i++) {
                    if (obj[c].tag[i]) {
                        blank += "　"
                    } else {
                        blank += "|　"
                    }
                }
                if (obj[c].isLast) {
                    blank += "└"
                } else {
                    blank += "├"
                }
                this.state.role_list.push(<option key={c} value={c}>
                    {blank + obj[c].title}</option>)
            } else {
                let blank = ""
                if (obj[c].isLast) {
                    blank += "└"
                } else {
                    blank += "├"
                }
                this.state.role_list.push(<option key={c} value={c}>
                    {blank + obj[c].title}</option>)
            }
            if (obj[c].son) {
                this.setOption(obj[c].son, arr)
            }
        }
    }

    setDefaultOption(obj, arr) {
        for (let c in obj) {
            if (obj[c].tag.length) {
                this.state.role_list.push(<option key={c} value={c}>
                    {obj[c].title}</option>)
            } else {
                this.state.role_list.push(<option key={c} value={c}>
                    {obj[c].title}</option>)
            }
            if (obj[c].son) {
                this.setDefaultOption(obj[c].son, arr)
            }
        }
    }

    onHandleChange(e) {
        if (this.props.onHandleChange) {
            this.props.onHandleChange(e)
        }
    }


    render() {
        return (
            <select ref="role_list" name="group_id" id="select"
                    value={this.state.defaultValue}
                    className="role"
                    onMouseDown={(e) => {
                        if (this.state.index) {
                            e.target.options[this.state.index].text = this.state.selectedText
                        }
                    }} onChange={(e) => {
                if (this.state.index) {
                    e.target.options[this.state.index].text = this.state.selectedText
                }
                this.state.index = e.target.options.selectedIndex
                this.state.selectedText = e.target.options[e.target.options.selectedIndex].text
                let text = e.target.options[e.target.options.selectedIndex].text.replace(/[│├└(^\s+)|(\s+$)]/g, "")
                e.target.options[e.target.options.selectedIndex].text = text
                this.forceUpdate()
                this.onHandleChange(e)
            }}>
                <option value="">{this.props.defaultTitle}</option>
                {this.state.role_list}
            </select>
        )
    }
}