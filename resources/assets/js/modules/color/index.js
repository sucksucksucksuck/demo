/**
 * Created by Sun on 16/10/2.
 */

import React from  'react';
import Tool from './tool';
export default class extends React.Component {

    constructor(props) {
        super(props);
        if (typeof(this.props.onClick) !== "function") {
            console.error("请传递onClick事件!")
        }
        let color = props['color'] || "fff";
        this.state = Tool.getState(color);
        this.onMouseMove = function (e) {
            if (this.state.sliderState) {
                Tool.moveSlider(e, true, this);
            }
            if (this.state.overlayState) {
                Tool.moveOverlay(e, true, this);
            }
        }.bind(this);
        this.onMouseUp = function (e) {
            if (this.state.sliderState) {
                Tool.moveSlider(e, false, this);
            }
            if (this.state.overlayState) {
                Tool.moveOverlay(e, false, this);
            }
        }.bind(this);
    }

    componentDidMount() {
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
    }

    onButtonClick(type, value) {
        if (this.props.onClick) {
            this.props.onClick(type, value);
        }
    }

    render() {
        return (
            <div className="sun-color">
                <div className="color-panel">
                    <div className="overlay"
                         ref="overlay"
                         style={{backgroundColor: `#${this.state.overlayColor}`}}
                         onMouseDown={() => {
                             this.setState({overlayState: true});
                         }}>
                        <div className="color">
                            <div className="button"
                                 style={{top: this.state.overlay.y - 3, left: this.state.overlay.x - 3}}>
                                <div/>
                            </div>
                        </div>
                    </div>
                    <div className="slider" ref="slider" onMouseDown={() => {
                        this.setState({sliderState: true});
                    }}>
                        <div className="color"/>
                        <div className="button" style={{top: this.state.slider}}>
                            <div className="circle"/>
                            {/*<i className="fa fa-caret-right" aria-hidden="true"/>*/}
                            {/*<i className="fa fa-caret-left" aria-hidden="true"/>*/}
                        </div>
                    </div>
                </div>
                <div className="color-info">
                    <div className="color-number" style={{
                        backgroundColor: `#${this.state.value}`
                    }}/>
                    <div className="color-value">
                        #<input type="text"
                                value={this.state.value}
                                onChange={(e) => {
                                    this.setState({value: e.target.value});
                                }}
                                onBlur={(e) => {
                                    this.setState(Tool.getState(e.target.value));
                                }}/>
                    </div>
                </div>
                <div className="button">
                    <button onClick={this.onButtonClick.bind(this, "clear")}>清除</button>
                    <button onClick={this.onButtonClick.bind(this, "cancel")}>取消</button>
                    <button onClick={this.onButtonClick.bind(this, "submit", this.state.value)}>确定</button>
                </div>
            </div>
        )
    }
}