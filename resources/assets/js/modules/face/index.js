/**
 * Created by Sun on 16/10/5.
 */
import React from 'react';
import config from './config';
import Slider from '../slider';
export default class  extends React.Component {
  constructor(props) {
    super(props);
    this.state = {className: "sun-face-panel" + (this.props.className ? ` ${this.props.className}` : "")}
  }

  onSelectFace(image, e) {
    if (image && this.props.onSelectFace) {
      this.props.onSelectFace(image, e);
    }
  }

  setClassName(className) {
    if (className) {
      this.setState({className: "sun-face-panel " + className});
    }
  }

  componentWillReceiveProps(props) {
    this.setState({className: "sun-face-panel" + (props.className ? ` ${props.className}` : "")});
  }

  render() {
    let face = config.face;
    let page = Math.ceil(face.length / 50.0);
    return (
      <div className={this.state.className}>
        <Slider className="sun-face" onMouseOver={(e) => {
          let src = e.target.dataset["src"];
          if (src) {
            this.refs["magnifier-image"].src = src;
            this.refs["magnifier"].className = "face-magnifier " + e.target.dataset["align"];
          } else {
            this.refs["magnifier"].className = "face-magnifier";
          }
        }}>
          {Array.from({length: page}, function (item, pageIndex) {
            return (
              <div key={pageIndex} className="sun-face-page">
                {Array.from({length: 50}, function (item, index) {
                  let faceIndex = index + pageIndex * 50;
                  let hasFace = faceIndex < face.length;
                  return (
                    <div key={faceIndex} className="sun-face-item"
                         data-src={hasFace ? face[faceIndex] : null}
                         data-align={index % 10 < 5 ? "right" : "left"}
                         style={{
                           backgroundImage: hasFace ? `url("${face[faceIndex]}")` : ""
                         }}
                         onClick={this.onSelectFace.bind(this, hasFace ? face[faceIndex] : null)}
                    />
                  );
                }, this)}
              </div>
            );
          }, this)}
        </Slider>
        <div ref="magnifier" className="face-magnifier">
          <img ref="magnifier-image" src=""/>
        </div>
      </div>
    )
  }
}