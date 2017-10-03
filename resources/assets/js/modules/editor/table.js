/**
 * Created by SUN on 2016/11/14.
 */
import React from  'react';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {row: 0, col: 0, className: props.className};
        this.onTableMouseMove = this.onTableMouseMove.bind(this);
    }

    componentDidMount() {
        window.addEventListener('mousemove', this.onTableMouseMove, true);
    }

    setClassName(className) {
        if (className) {
            this.setState({className: "table-select " + className});
        }
    }

    componentWillReceiveProps(props) {
        this.setState({row: 0, col: 0, className: props.className});
    }

    onTableMouseMove(e) {
        if (e.target.dataset && e.target.dataset.row !== undefined && e.target.dataset.col !== undefined) {
            this.setState({row: e.target.dataset.row, col: e.target.dataset.col});
        } else if (!this.unmount) {
            this.setState({row: 0, col: 0});
        }
    }

    onSelected(e) {
        if (this.props.onSelectTable) {
            this.props.onSelectTable({row: e.target.dataset.row, col: e.target.dataset.col}, e);
        }
    }

    componentWillUnmount() {
        this.unmount = true;
        window.removeEventListener('mousemove', this.onTableMouseMove);
    }

    render() {
        return (
            <div className={this.state.className}>
                <div className="info">{this.state.col}列&times;{this.state.row}行</div>
                <table onClick={this.onSelected.bind(this)}>
                    <tbody>
                    {Array.from({length: 7}).map(function (item, index) {
                        return (<tr key={index}>
                            {Array.from({length: 10}).map(function (subItem, subIndex) {
                                return (
                                    <td data-row={index + 1} data-col={subIndex + 1}
                                        key={subIndex}
                                        className={this.state.row > index && this.state.col > subIndex ? "active" : null}/>
                                )
                            }, this)}
                        </tr>)
                    }, this)}
                    </tbody>
                </table>
            </div>
        )
    }
}