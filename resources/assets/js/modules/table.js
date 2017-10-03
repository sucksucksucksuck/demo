/**
 * Created by s on 2017/3/7.
 */
import React from 'react'


export default class extends React.Component {
    constructor(props, orderTable) {
        super(props)
        this.state = {
            head: [],
            rows: [],
            primaryKey: props['primaryKey'] || "id",
            checkbox: props['checkbox'] || true,
            button: false,
            order: "",
            checked: {},
            checkAll: false,
            orderTable: orderTable,
            width: props['width'] || null
        }
        this.initState(props)
    }

    getColumnStyle(val, head, item) {
        if (head.type === "img") {
            return <div><img src={val}/></div>
        }
        return val
    }

    getCheckbox(item) {
        //根绝state判断是否有checkbox
        if (this.state.checkbox) {
            return (
                <td className={this.state.checked[`id_${item[this.state.primaryKey]}`] ? "checkbox checked" : "checkbox"}/>)
        }
        return null
    }

    //每点击一个checkbox都遍历一次checked数组,如果里面有元素为false,全选按钮为false,否则为true
    setChecked() {
        for (let c in this.state.checked) {
            if (!this.state.checked[c]) {
                this.state.checkAll = false
                return false
            }
        }
        this.state.checkAll = true
        return true
    }

    getChecked() {
        let ids = []
        for (let c in this.state.checked) {
            if (this.state.checked[c]) {
                ids.push(c.substr(3))
            }
        }
        return ids
    }

    getButton(item) {
        let button = []
        for (let btn of this.state.button) {
            if (btn.props.compare) {
                let compare = btn.props.compare.replace(/\$\{([\w\d]*)\}/g, function (m1, m2) {
                    return item[m2]
                })
                let result = eval(compare)
                if (!result) {
                    continue
                }
            }
            if (btn.props.action !== undefined && btn.props.module) {
                if (!window.hasPermission(btn.props.module, btn.props.action)) {
                    continue
                }
            }
            if (btn.type === 'button') {
                let props = {
                    key: btn.props.name,
                    name: btn.props.name,
                    onClick: this.onItemButtonClick.bind(this, item, btn.props.name),
                    className: btn.props.className,
                    title: btn.props.title
                }
                button.push(React.createElement(btn.type, props, btn.props.children))
            } else if (btn.type === 'a') {
                let props = {
                    ...btn.props,
                    key: btn.props.name,
                    className: btn.props.className,
                    title: btn.props.title,
                    onClick: this.onItemButtonClick.bind(this, item, btn.props.name),
                    href: window.caseUrl(btn.props.href.replace(/\$\{([\w\d]*)\}/g, function (m1, m2) {
                        return item[m2]
                    }))
                }
                button.push(React.createElement(btn.type, props, btn.props.children))
            } else {
                let props = {
                    key: btn.props.name,
                    className: btn.props.className,
                    title: btn.props.title,
                    to: window.caseUrl(btn.props.to.replace(/\$\{([\w\d]*)\}/g, function (m1, m2) {
                        return item[m2]
                    }))
                }
                button.push(React.createElement(btn.type, props, btn.props.children))
            }
        }
        return button
    }


    onItemButtonClick(item, name) {
        if (this.props.onItemButtonClick) {
            this.props.onItemButtonClick(item, name)
        }
    }

    periodsClick(item) {
        if (this.props.periodsClick) {
            this.props.periodsClick(item)
        }
    }

//初始化state
    initState(props) {
        //如果head是数组,state.head为父节点传入的head
        if (props['head'] instanceof Array) {
            this.state.head = props['head']
        }
        //该变量控制列表是否需要checkbox
        if (typeof(props['checkbox']) === "boolean") {
            this.state.checkbox = props['checkbox']
        }
        //父节点的rows为数组时 初始化rows的数据
        if (props['rows'] instanceof Array) {
            this.state.rows = props['rows']
            this.state.checked = {}
            if (this.state.checkbox) {
                for (let row of this.state.rows) {
                    this.state.checked[`id_${row[this.state.primaryKey]}`] = false
                }
            }
        }
        if (props['primaryKey']) {
            this.state.primaryKey = props['primaryKey']
        }
        if (props['order']) {
            this.state.order = props['order']
        }
        if (props['width']) {
            this.state.width = props['width']
        }
        if (props.children) {
            this.state.button = []
            if (props.children instanceof Array) {
                this.state.button.push(...props.children)
            } else {
                this.state.button.push(props.children)
            }
        } else {
            this.state.button = false
        }
    }

//已挂载的组件接收到新的props是调用该方法
    componentWillReceiveProps(props) {
        if (this.state.rows !== props['rows']) {
            this.state.checkAll = false
            this.initState(props)
            this.forceUpdate()
        } else if (props['order'] || props['width']) {
            this.state.order = props['order']
            this.state.width = props['width']
            this.forceUpdate()
        }


    }

    getRowStyle(item, index) {
        return null
    }

    getOrder(item) {
        if (item.order) {
            let className = [item.order]
            let order = this.state.order.split(" ")
            if (order[0] === item.key) {
                if (order.length === 1) {
                    className.push("active")
                } else {
                    className.push("active-" + order[1])
                }
            }
            return (<div className={className.join(' ')}/>)
        }
        return null
    }

    onOrderChange(item) {
        if (item.order && this.props.onOrderChange) {
            let type = item.order
            let orderValue = item.key
            if (type === "desc-asc") {
                let order = this.state.order.split(" ")
                if (order[0] === item.key && order[1] === "asc") {
                    orderValue = orderValue + " desc"
                } else {
                    orderValue = orderValue + " asc"
                }
            }
            if (orderValue !== item.order) {
                this.props.onOrderChange(orderValue)
            }
        }
    }

    // onPeriodsClick(item){
    //     if (this.props.onPeriodsClick) {
    //         this.props.onPeriodsClick(item);
    //     }
    // }

    render() {
        return (
            <div className="module-table" style={{width: this.state.width}}>
                <table>
                    <thead>
                    <tr>
                        {/*根据state判断是否需要checkbox全选按钮,点击时遍历state.checked数组
                         一开始checkAll=false,所以点击全选之后,state.checked数组里元素所有都切换为!checkAll
                         更新checkALl的状态为!checkAll
                         */}
                        {this.state.checkbox ?
                            <td
                                onClick={() => {
                                    for (let c in this.state.checked) {
                                        this.state.checked[c] = !this.state.checkAll
                                    }
                                    this.state.checkAll = !this.state.checkAll
                                    this.forceUpdate()
                                }}
                                className={"checkbox" + (this.state.checkAll ? " checked" : "")}/> : null}
                        {this.state.head.map(function (item, index) {
                            if (item.text) {
                                return (
                                    <td key={index}
                                        className={item.className}
                                        onClick={this.onOrderChange.bind(this, item)}
                                    >
                                        <div>{item.text}{this.getOrder(item)}</div>
                                    </td>
                                )
                            }
                        }, this)}
                        {this.state.button ?
                            <td className="button">
                                <div>操作按钮</div>
                            </td> : null}
                    </tr>
                    </thead>
                    {this.state.orderTable ? this.state.rows.map(function (item, index) {
                        return this.getRowStyle(item, index)
                    }, this) : <tbody>
                    {this.state.rows.map(function (item, index) {
                        return this.getRowStyle(item, index)
                    }, this)}
                    </tbody>}
                </table>
            </div>
        )
    }
}