/**
 * Created by sun_3211 on 2017/3/17.
 */

import React from 'react'
import {connect} from 'react-redux'


export class Dialog extends React.Component {
    constructor(props) {
        super(props)
        this.state = props['dialog']
        //通过属性传递state过来
    }

    componentWillReceiveProps(props) {
        this.state = props["dialog"]
        this.forceUpdate()
    }

    closeAll(e) {
        e.stopPropagation()
        window.store.dispatch({
            type: "DIALOG_CLOSE_ALL",
        })
    }

    render() {
        if (this.state.count > 0) {
            return (
                <div className="dialog-modules">
                    {Object.keys(this.state.dialog).map(function (key) {
                        let className = ["panel"]
                        let item = this.state.dialog[key]
                        if (item.fade) {
                            className.push('fade')
                        }
                        if (item.slide) {
                            className.push('slide')
                        }
                        return <div onClick={item.close ? this.closeAll.bind(this) : null} key={key}
                                    className={className.join(' ')}>{item.view}</div>
                    }, this)}
                </div>
            )
        }
        return null
    }
}
export default connect(({dialog}) => ({dialog}))(Dialog)