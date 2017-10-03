/**
 * Created by sun_3211 on 2017/4/7.
 */
import React from 'react';


export default class extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillReceiveProps() {
        this.forceUpdate();
    }

    componentDidMount() {
        this.componentDidUpdate();
    }

    componentDidUpdate() {
        if (this.props.onDrawing) {
            this.refs['canvas'].height = this.refs['canvas'].clientHeight;
            this.refs['canvas'].width = this.refs['canvas'].clientWidth;
            this.props.onDrawing(this.refs['canvas']);
        }
    }

    render() {
        return <canvas ref="canvas" onClick={this.props.onClick}/>
    }
}