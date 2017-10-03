/**
 * Created by Sun on 16/10/4.
 */
import React from  'react';
// import Dialog from '../../util/dialog';
// import $ from  'jquery';
// import * as util from './../../../action/util';
export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: "thumbnail",
      order: "name",
      tag: props.tag,
      image: []
    };
  }

  componentDidMount() {
    this.searchImage();
  }

  componentWillReceiveProps(props) {
    if (this.state.tag != props.tag) {
      this.searchImage();
      this.state.tag = props.tag;
    }
  }

  searchImage() {
    // $.post(window.Config.root + "/api/image_upload/image_list", {tag: this.state.tag}, function (ret) {
    //   if (ret.errcode == 0) {
    //     this.setState({image: ret.data});
    //   } else {
    //     util.toast({msg: ret.msg, type: window.Config.prompt.error});
    //   }
    // }.bind(this));
  }

  getFileName(path) {
    return path.substr(path.lastIndexOf('/') + 1);
  }

  sortImage(n1, n2) {
    switch (this.state.order) {
      case "name":
        return this.getFileName(n1.path) < this.getFileName(n2.path) ? 1 : -1;
      case "size":
        return n1.size - n2.size;
        break;
      case "type":
        return n1.ext < n2.ext ? 1 : -1;
    }
    return 0;
  }
    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }

  render() {
    //console.log('image...',this.state.image)
    return (
        <div className="image-upload">
          <div className="title">服务器的图片
            <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
          </div>
          <div className="view-server-info">
            <div>
              {/*<button className="btn btn-default btn-xs">*/}
              {/*<i className="fa fa-arrow-up" aria-hidden="true"/>*/}
              {/*移到上级文件夹*/}
              {/*</button>*/}
            </div>
            <div>
              显示方式 :
              <select value={this.state.show} onChange={(e)=> {
                this.setState({show: e.target.value});
              }}>
                <option value="thumbnail">缩略图</option>
                <option value="details">详细信息</option>
              </select>
            </div>
            <div>
              排序方式 :
              <select value={this.state.order} onChange={(e)=> {
                this.setState({order: e.target.value});
              }}>
                <option value="name">名称</option>
                <option value="size">大小</option>
                <option value="type">类型</option>
              </select>
            </div>
          </div>
          <div className={"view-server-list " + this.state.show}>
            {this.state.image?this.state.image.sort(this.sortImage.bind(this)).map(function (item) {
              var fileName = this.getFileName(item.path);
              return (
                <div key={item.id}
                     className="item"
                     onClick={()=> {
                       if (this.props.onSelected) {
                         this.props.onSelected(item.path);
                       }
                       this.refs['dialog'].closeDialog();
                     }}
                     title={`${fileName}  (${(item.size / 1024).toFixed(2)}M,${item.create_at})`}>
                  <img src={item.path}/>
                  <div className="name">{fileName}</div>
                  <div className="size">
                    {item.size > 1024 ? (item.size / 1024).toFixed(2) + " mb" : item.size.toFixed(2) + " kb"}
                  </div>
                  <div className="time">{item.create_at}</div>
                </div>)
            }, this):null}
          </div>
          <div className="view-server-button">
            <button className="btn btn-default btn-xs" onClick={()=> {
              this.refs['dialog'].closeDialog();
            }}>关闭
            </button>
          </div>
        </div>
    )
  }
}