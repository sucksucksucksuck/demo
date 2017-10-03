/**
 * Created by s on 2017/3/8.
 */
import React from 'react'


export default class extends React.Component {
    constructor(props) {
        super(props)
        //通过属性传递state过来
        this.state = {
            page: 1,
            page_size: props['page_size'] || 20,
            total: 0,
            input_page: 1,
            count: 1,
            type: props['type'] || 1,
            size: props['size'],
            input_page_size: props['page_size'] || 20,
            home_page: props['home_page'] || false,
            width: props['width'] || null

        }
        this.calculateItem(props)
    }

    /**
     * 组件属性改变时候被调用
     * @param props
     */
    componentWillReceiveProps(props) {
        this.state.input_page_size = props['page_size'] || 20
        this.state.width = props['width']
        this.calculateItem(props)
        this.forceUpdate()
    }

    calculateItem(props) {
        if (props['total'] || props['total'] == 0) {
            this.state.total = props['total']
        }
        if (props['page']) {
            this.state.page = props['page']
        }
        this.state.count = Math.ceil(this.state.total / this.state.page_size)
        if (this.state.count > 6) {
            this.state.start = this.state.page - 3
        } else {
            this.state.start = 0
        }
        if (this.state.start < 0) {
            this.state.start = 0
        }
        this.state.end = this.state.start + 6
        if (this.state.end > this.state.count) {
            this.state.end = this.state.count
        }
        if (this.state.end - this.state.start < 6) {
            this.state.start = this.state.end - 6
        }
        if (this.state.start < 0) {
            this.state.start = 0
        }
        // console.log(this.state);
    }

    onPaginate(page) {
        if (!page) {
            //输入页码大于最大页数,则页码不改变
            if (this.state.input_page > this.state.count) {
                page = this.state.count
            }
            //输入页码小于1 则一直为1
            if (this.state.input_page < 1) {
                page = 1
            }
        }
        if (this.props.onPaginate && page >= 1 && page <= this.state.count && page != this.state.page) {
            this.props.onPaginate(page, this.state.page_size)
        } else if (this.props.onPaginate && page >= 1 && this.state.count == 0) {
            if (this.state.input_page < 1) {
                page = 1
            }
            this.props.onPaginate(page, this.state.input_page_size)
        }
    }

    onInputPageChange(e) {
        if (e.target.value == "") {
            this.state.input_page = ""
        } else {
            let page = parseInt(e.target.value)
            if (!page) {
                this.state.input_page = ""
            } else {
                this.state.input_page = page
            }
        }

        this.forceUpdate()
    }

    onPageSizeChange(e) {
        if (this.props.onPageSizeChange) {
            this.props.onPageSizeChange(e)
        }
    }

    onSubmit(e) {
        e.preventDefault()
        this.onPaginate(this.state.input_page)
    }

    render() {
        return (
            <form method="post" onSubmit={this.onSubmit.bind(this)} className="module-paging"
                  style={{width: this.state.width}}>
                <div className="info">{this.state.type == 2 ? null : (<span>共有{this.state.total}行数据</span>)}</div>
                {this.props.noButton ? null : <div className="button">
                    {this.state.home_page ?
                        <button className="button" onClick={this.onPaginate.bind(this, 1)}>首页</button> : null}
                    <button type="button" className={this.state.page == 1 ? "front unactive" : "front"}
                            onClick={this.onPaginate.bind(this, this.state.page - 1)}/>
                    {this.state.start > 0 ? <div className="more"/> : null}
                    {Array.from({length: this.state.end - this.state.start}).map(function (item, index) {
                        let page = index + this.state.start + 1
                        return (
                            <button type="button" key={index}
                                    className={this.state.page == page ? "active" : null}
                                    onClick={this.onPaginate.bind(this, page)}>
                                {page}
                            </button>
                        )
                    }, this)}
                    {this.state.end < this.state.count ? <div className="more"/> : null}
                    <button type="button" className="back" onClick={this.onPaginate.bind(this, this.state.page + 1)}/>
                    {this.state.type == 2 ? (<div className="input">
                        第{this.state.page}页&nbsp;
                    </div>) : (<div className="input">
                        共{this.state.count}页&nbsp;到第
                        <input type="text"
                               value={this.state.input_page}
                               onChange={this.onInputPageChange.bind(this)}/>
                        页
                    </div>)}
                    {this.state.size ? (<div className="input">&nbsp;该页显示<input type="text"
                                                                                value={this.state.input_page_size}
                                                                                onChange={this.onPageSizeChange.bind(this)}/>条
                    </div>) : null}
                    <button className="ok">确定</button>
                </div>}

            </form>
        )

    }
}