/**
 * Created by Sun on 16/10/5.
 */
import React from  'react';
export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: 0,
      view: this.props.children,
      dot: true
    }
  }

  render() {
    return (
      <div  {...this.props} className={"sun-slider" + (this.props.className ? ` ${this.props.className}` : "")}>
        <div className="slider-view">
          <div className="slider-item" style={{left: this.state.active * -100 + "%"}}>
            {this.state.view}
          </div>
        </div>
        <div className={"slider-dot " + (this.state.dot ? "dot" : "num")}>
          {this.state.view.map(function (item, index) {
            return (
              <div key={index}
                   className={"dot" + (index == this.state.active ? " active" : "")}
                   onClick={this.setState.bind(this, {active: index})}
              >{index}</div>);
          }, this)}
        </div>
      </div>
    )
  }
}
