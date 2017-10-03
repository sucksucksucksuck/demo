/**
 * Created by Sun on 16/10/2.
 */
import React from  'react';
import config from './config';
import * as utilAction from '../../action/util';
import Face from '../face';
import EditorResize from './editor_resize';
import Table from './table';
import * as eventAction from '../../action/event/display';
export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            html: true,
            fullScreen: false,
            content: props["content"] || "",
            tag: props['tag'] || "tag_" + new Date().getTime(),
            selectImage: false
        };
        this.editor = false;
        this.drop_down_event = {
            onClick: function (e) {
                if (this.state.html) {
                    let el = this.refs[e.currentTarget.dataset["target"]];
                    if (el instanceof React.Component) {
                        el.setClassName(el.props["data-class"]);
                    } else {
                        el.className = el.dataset.class;
                    }
                }
            }.bind(this),
            onMouseLeave: function (e) {
                let el = this.refs[e.currentTarget.dataset["target"]];
                if (el instanceof React.Component) {
                    el.setClassName("hide");
                } else {
                    el.className = "hide";
                }
            }.bind(this)
        };
        this.resizeEditor = function (e) {
            if (e.target.tagName === "IMG") {
                this.state.selectImage = e.target;
                this.refs['resize'].setTarget(e.target);
            } else {
                this.state.selectImage = "";
            }
        }.bind(this);
        this.onContentChange = this.onContentChange.bind(this);
    }

    componentWillReceiveProps(props) {
        this.setState({
            html: true,
            fullScreen: false,
            content: props["content"] || "",
            tag: props['tag'] || "tag_" + new Date().getTime()
        });
        this.state.content = props.content || "";
        this.forceUpdate();
    }

    setRange() {
        //var sel = window.getSelection();
        //console.log("sel =", sel);
        //this.range = {start: sel.focusOffset, end: sel.anchorOffset}
        // console.log(this.range);
    }

    onContentChange(type) {
        if (typeof(type) === 'boolean') {
            this.state.selectImage = false;
        }
        if (this.state.html) {
            // this.state.content = this.editor.body.innerHTML;
            // this.forceUpdate();
            this.setState({content: this.editor.body.innerHTML});
        } else {
            //console.log("value", e.target.value);
            this.setState({content: this.refs['input'].value}, function () {
                this.editor.body.innerHTML = this.state.content;
            }.bind(this));
        }
    }

    componentDidMount() {
        this.editor = this.refs["editor"].contentDocument;
        console.log("innerHTML", this.editor);
        this.editor.write(`<!DOCTYPE html><html><head><link rel="stylesheet" type="text/css" href="${window.config.root}/css/editor.css"/></head><body contentEditable='true' autofocus="autofocus">${this.state.content}</body></html>`);
        this.editor.addEventListener("input", this.onContentChange, true);
        this.editor.body.focus();
        this.editor.addEventListener('click', this.resizeEditor, true);
        this.refs['input'].setValue = function (val) {
            this.setState({content: val || ""}, function () {
                this.editor.body.innerHTML = this.state.content;
            }.bind(this));
        }.bind(this);
    }

    componentWillUnmount() {
        this.editor.removeEventListener('click', this.resizeEditor);
        this.editor.removeEventListener("input", this.onContentChange);
    }

    getImageList(path){
        if(this.props.getImageList){
            this.props.getImageList(path);
        }
    }

    onExecuteCmd(params, e) {
        if (typeof (params) === "string") {
            params = {cmd: params};
        }
        this.refs["editor"].focus();
        // console.log("params =", params);
        if (!this.state.html && params.cmd !== "source" && params.cmd !== "full-screen") {
            return;
        }
        let ret = false;
        switch (params.cmd) {
            case "source":
                this.setState({html: !this.state.html});
                break;
            case "associateGoods":
            case "associateUrl":
            case "associateEventId":
            case "full-screen":
                this.setState({fullScreen: !this.state.fullScreen});
                break;
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
                ret = this.editor.execCommand('formatBlock', false, `<${params.cmd}>`);
                break;
            case "paste":
                this.editor.body.focus();
                ret = this.editor.execCommand("paste");
                break;
            case "font-family":
                ret = this.editor.execCommand('fontName', false, params.value);
                break;
            case "insertImage":
                if (params.value.length) {
                    for (let c in params.value) {
                        ret = this.editor.execCommand(params.cmd, false, params.value[c]);
                    }
                }
                break;
            case "fontSize":
            default:
                // this.editor.execCommand('CreateLink', false, 'http://www.abcd9.com/');
                ret = this.editor.execCommand(params.cmd, false, params.value);
                break;
        }
        if (params.target) {
            e.stopPropagation();
            let el = this.refs[params.target];
            if (el instanceof React.Component) {
                el.setClassName("hide");
            } else {
                el.className = "hide";
            }
        }
        //console.log(params, "=", ret);
    }

    render() {
        return (
            <div className={"sun-editor" + (this.state.fullScreen ? " full" : "")}>
                <div className={"button" + (this.state.html ? "" : " active")}>
                    <div className="row">
                        <div className={"btn global" + (this.state.html ? "" : " active")}
                             onClick={this.onExecuteCmd.bind(this, "source")}
                             title="HTML代码">
                            <i className="fa fa-code"/>
                        </div>
                        <div className="separator"/>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "undo")}
                             title="后退(Ctrl + Z)">
                            <i className="fa fa-undo"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "redo")}
                             title="前进(Ctrl + Y)">
                            <i className="fa fa-repeat"/>
                        </div>
                        <div className="separator"/>
                        <div className="btn drop-down"
                             onClick={this.onExecuteCmd.bind(this, "code")}
                             title="插入程序代码">
                            <i className="fa fa-terminal"/>
                            <i className="fa fa-caret-down"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "cut")}
                             title="剪切(Ctrl + X)">
                            <i className="fa fa-scissors"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "copy")}
                             title="复制(Ctrl + C)">
                            <i className="fa fa-files-o"/>
                        </div>
                        <div className="separator"/>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "justifyLeft")}
                             title="左对齐">
                            <i className="fa fa-align-left"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "justifyCenter")}
                             title="居中">
                            <i className="fa fa-align-center"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "justifyRight")}
                             title="右对齐">
                            <i className="fa fa-align-right"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "justifyFull")}
                             title="两端对齐">
                            <i className="fa fa-align-justify"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "insertUnorderedList")}
                             title="项目编号">
                            <i className="fa fa-list-ol"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "insertOrderedList")}
                             title="项目符号">
                            <i className="fa fa-list-ul"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "indent")}
                             title="增加缩进">
                            <i className="fa fa-indent"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "outdent")}
                             title="减少缩进">
                            <i className="fa fa-outdent"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "subscript")}
                             title="下标">
                            <i className="fa fa-subscript"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "superscript")}
                             title="上标">
                            <i className="fa fa-superscript"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "removeFormat")}
                             title="清理HTML代码">
                            <i className="fa fa-trash-o"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "selectAll")}
                             title="全选(Ctrl + A)">
                            <i className="fa fa-mouse-pointer"/>
                        </div>
                        <div className="separator"/>
                        <div
                            className={"btn global" + (this.state.fullScreen ? " active" : "")}
                            onClick={this.onExecuteCmd.bind(this, "full-screen")}
                            title="全屏显示">
                            <i className="fa fa-arrows-alt"/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="btn drop-down"
                             data-target="header"
                             {...this.drop_down_event}
                             title="段落">
                            <i className="fa fa-header"/>
                            <i className="fa fa-caret-down"/>
                            <div ref="header" data-class="body" className="hide">
                                <h1 onClick={this.onExecuteCmd.bind(this, {cmd: "h1", target: "header"})}>h1 标题1</h1>
                                <h2 onClick={this.onExecuteCmd.bind(this, {cmd: "h2", target: "header"})}>h2 标题2</h2>
                                <h3 onClick={this.onExecuteCmd.bind(this, {cmd: "h3", target: "header"})}>h3 标题3</h3>
                                <h4 onClick={this.onExecuteCmd.bind(this, {cmd: "h4", target: "header"})}>h4 标题4</h4>
                                <h5 onClick={this.onExecuteCmd.bind(this, {cmd: "h5", target: "header"})}>h5 正文</h5>
                            </div>
                        </div>
                        <div className="btn drop-down" data-target="family"
                             {...this.drop_down_event}
                             title="字体">
                            <i className="fa fa-facebook"/>
                            <i className="fa fa-caret-down"/>
                            <div ref="family" data-class="body" className="hide">
                                {Object.keys(config.family).map(function (key, index) {
                                    return (<div key={index} onClick={this.onExecuteCmd.bind(this, {
                                        cmd: "font-family",
                                        value: config.family[key],
                                        target: 'family'
                                    })}>{config.family[key]}</div>)
                                }, this)}
                            </div>
                        </div>
                        <div className="btn drop-down" data-target="font-size"
                             {...this.drop_down_event}
                             title="文字大小">
                            <i className="fa fa-text-height"/>
                            <i className="fa fa-caret-down"/>
                            <div ref="font-size" data-class="body" className="hide">
                                {config['font-size'].map(function (item, index) {
                                    return (<div key={index} style={{"fontSize": item}}
                                                 onClick={this.onExecuteCmd.bind(this, {
                                                     cmd: "fontSize",
                                                     value: index,
                                                     target: "font-size"
                                                 })}
                                    >{item}</div>)
                                }, this)}
                            </div>
                        </div>
                        <div className="separator"/>
                        <div className="btn drop-down font-color"
                             onClick={(e) => {
                                 if (this.state.html) {
                                     eventAction.color(function (type, value) {
                                         switch (type) {
                                             case "submit":
                                                 this.onExecuteCmd({cmd: "ForeColor", value: "#" + value}, e);
                                                 window.store.dispatch({
                                                     type: "DIALOG_CLOSE",
                                                     payload: "color"
                                                 });
                                                 break;
                                             case "clear":
                                                 this.onExecuteCmd({cmd: "ForeColor", value: "#000"}, e);
                                                 window.store.dispatch({
                                                     type: "DIALOG_CLOSE",
                                                     payload: "color"
                                                 });
                                                 break;
                                             case "cancel":
                                                 window.store.dispatch({
                                                     type: "DIALOG_CLOSE",
                                                     payload: "color"
                                                 });
                                                 break;
                                         }
                                     }.bind(this));
                                 }
                             }}
                             title="文字颜色">
                            <i className="fa fa-font"/>
                            <i className="fa fa-caret-down"/>
                        </div>
                        <div className="btn drop-down bg-color"
                             onClick={(e) => {
                                 if (this.state.html) {
                                     eventAction.color(function (type, value) {
                                         switch (type) {
                                             case "submit":
                                                 this.onExecuteCmd({cmd: "backColor", value: "#" + value}, e);
                                                 window.store.dispatch({
                                                     type: "DIALOG_CLOSE",
                                                     payload: "color"
                                                 });
                                                 break;
                                             case "clear":
                                                 this.onExecuteCmd({cmd: "backColor", value: "#000"}, e);
                                                 window.store.dispatch({
                                                     type: "DIALOG_CLOSE",
                                                     payload: "color"
                                                 });
                                                 break;
                                             case "cancel":
                                                 window.store.dispatch({
                                                     type: "DIALOG_CLOSE",
                                                     payload: "color"
                                                 });
                                                 break;
                                         }
                                     }.bind(this));
                                     // util.color(function (type, color) {
                                     //     switch (type) {
                                     //         case "submit":
                                     //             this.onExecuteCmd({cmd: "backColor", value: "#" + color}, e);
                                     //             break;
                                     //         case "clear":
                                     //             this.onExecuteCmd({cmd: "backColor", value: "#000"}, e);
                                     //             break;
                                     //     }
                                     // }.bind(this));
                                 }
                             }}
                             title="文字背景">
                            <i className="fa fa-font"/>
                            <i className="fa fa-caret-down"/>
                        </div>
                        <div className="separator"/>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "bold")}
                             title="粗体(Ctrl + B)">
                            <i className="fa fa-bold" unselectable="on"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "italic")}
                             title="斜体(Ctrl + I)">
                            <i className="fa fa-italic"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "underline")}
                             title="下划线(Ctrl + U)">
                            <i className="fa fa-underline"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "strikeThrough")}
                             title="删除线">
                            <i className="fa fa-strikethrough"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "removeFormat")}
                             title="删除格式">
                            <i className="fa fa-eraser"/>
                        </div>
                        <div className="separator"/>
                        <div className="btn drop-down"
                             onClick={() => {
                                 if (this.state.html) {
                                     eventAction.imageUpload(function (path) {
                                         this.getImageList(path);
                                         this.onExecuteCmd({cmd: "insertImage", value: path});
                                     }.bind(this), this.props.event_id,this.props.url);
                                 }
                             }}
                             title="图片">
                            <i className="fa fa-picture-o"/>
                            <i className="fa fa-caret-down"/>
                        </div>
                        <div className="separator"/>
                        <div className="btn drop-down"
                             data-target="table"
                             {...this.drop_down_event}
                             title="表格">
                            <i className="fa fa-table"/>
                            <i className="fa fa-caret-down"/>
                            <Table ref="table"
                                   data-class="table"
                                   className="hide"
                                   onSelectTable={(table, e) => {
                                       let html = `<table><tbody>${Array.from({length: table.row}).map(function () {
                                           return `<tr>${Array.from({length: table.col}).map(function () {
                                               return `<td></td>`;
                                           }).join("")}</tr>`
                                       }).join("")}</tbody></table>`;
                                       this.onExecuteCmd({cmd: "insertHTML", value: html}, e);
                                   }}/>
                        </div>
                        <div className="btn drop-down" data-target="face"
                             {...this.drop_down_event}
                             title="插入表情">
                            <i className="fa fa-meh-o"/>
                            <i className="fa fa-caret-down"/>
                            <Face ref="face"
                                  data-class="body-face"
                                  className="hide"
                                  onSelectFace={(img, e) => {
                                      this.onExecuteCmd({cmd: "insertImage", value: img}, e);
                                  }}/>
                        </div>
                        <div className="btn drop-down"
                             onClick={(e) => {
                                 if (this.state.html) {
                                     // util.prompt({
                                     //     msg: "请输入锚点名字",
                                     //     btn: {
                                     //         "确定": function (ret) {
                                     //             if (!ret) {
                                     //                 util.toast({msg: "请输入锚点名字!", type: window.Config.prompt.error});
                                     //                 return false;
                                     //             }
                                     //             this.onExecuteCmd({
                                     //                 cmd: "insertHTML",
                                     //                 value: `<a name="${ret}"></a>`
                                     //             }, e);
                                     //             return true;
                                     //         }.bind(this),
                                     //         "取消": null
                                     //     }
                                     // });
                                 }
                             }}
                             title="锚点">
                            <i className="fa fa-anchor"/>
                            <i className="fa fa-caret-down"/>
                        </div>
                        <div className="btn" onClick={(e) => {
                            if (this.state.html) {
                                // util.prompt({
                                //     msg: "请输入连接地址",
                                //     btn: {
                                //         "确定": function (ret) {
                                //             if (!ret) {
                                //                 util.toast({msg: "请输入连接地址!", type: window.Config.prompt.error});
                                //                 return false;
                                //             }
                                //             this.onExecuteCmd({cmd: "createLink", value: ret}, e);
                                //             return true;
                                //         }.bind(this),
                                //         "取消": null
                                //     }
                                // });
                            }
                        }}
                             title="超级链接">
                            <i className="fa fa-link"/>
                        </div>
                        <div className="btn"
                             onClick={this.onExecuteCmd.bind(this, "unlink")}
                             title="取消超级链接">
                            <i className="fa fa-chain-broken"/>
                        </div>
                        <div className="btn"
                             onClick={() => {
                                 if (this.state.html) {
                                     this.onExecuteCmd.bind(this, "associateGoods");
                                     if (this.state.selectImage) {
                                         eventAction.associateGoods(null, null, function (ret) {
                                             if (this.state.selectImage) {
                                                 this.state.selectImage.setAttribute("tapmode", 'active');
                                                 if(ret.item==1){
                                                     this.state.selectImage.setAttribute(
                                                         "onclick", "api.openWin({'url': 'widget://html/new_win.html', 'name': 'goods_sort_win', 'delay': 400, 'bounces': false, 'pageParam': {'active': "+ ret.category_checked +", 'script': './lib/snatch/sort/index.js'}})");
                                                 }else if(ret.item==2){
                                                     this.state.selectImage.setAttribute(
                                                         "onclick", "api.openWin({'url': 'widget://html/new_win.html', 'name': 'goods_detail_"+ ret.good_checked +"', 'delay': 400, 'pageParam': {'script': './lib/snatch/detail/goods_detail_win.js', 'goods_id': "+ret.good_checked+"}, 'scrollEnabled': false, 'vScrollBarEnabled': false})");

                                                 }else if(ret.item==3){
                                                     this.state.selectImage.setAttribute(
                                                         "onclick", "api.openWin({'url': 'widget://html/new_win.html', 'name': 'search', 'bgColor': '#fff', 'pageParam': {'script': './lib/snatch/search/search_list_win.js', 'keyword': '"+ret.search_text+"'}, 'vScrollBarEnabled': false})");

                                                 }
                                                 this.onContentChange();
                                             }
                                         }.bind(this));
                                     } else {
                                         utilAction.prompt("请先选择图片");
                                     }
                                 }
                             }}
                             title="关联商品">
                            <i className="fa fa-gift"/>
                        </div>
                        <div className="btn"
                             title="关联链接"
                             onClick={() => {
                                 if (this.state.html) {
                                     this.onExecuteCmd.bind(this, "associateUrl");
                                     if (this.state.selectImage) {
                                         eventAction.associateUrl(null, null, function (ret) {
                                             if (this.state.selectImage) {
                                                 this.state.selectImage.setAttribute("tapmode", 'active');
                                                 this.state.selectImage.setAttribute("onclick", "location='"+ret+"'");
                                                 this.onContentChange();
                                             }
                                         }.bind(this));
                                     } else {
                                         utilAction.prompt("请先选择图片");
                                     }
                                 }
                             }}
                        >
                            <i className="fa fa-paperclip"/>
                        </div>
                        <div className="btn"
                             title="关联活动"
                             onClick={() => {
                                 if (this.state.html) {
                                     this.onExecuteCmd.bind(this, "associateEventId");
                                     if (this.state.selectImage) {
                                         eventAction.associateEventId(null, null, function (ret) {
                                             let data = JSON.parse(ret);
                                             let url = JSON.stringify(data.url).replace(/^\"|\"$/g,'');
                                             if (this.state.selectImage) {
                                                 this.state.selectImage.setAttribute("tapmode", 'active');
                                                 this.state.selectImage.setAttribute("onclick", "api.openWin({'name': 'event_detail_win12', 'url': 'widget://html/new_win.html','bounces': false,'vScrollBarEnabled': false,'delay':100,'pageParam': {'script': './lib/util/win.js','title': '"+ data.title +"','page':{'name':'event_detail_page','url': '"+ url +"','bounces': false, 'vScrollBarEnabled': false}}})");
                                                 this.onContentChange();
                                             }
                                         }.bind(this));
                                     } else {
                                         utilAction.prompt("请先选择图片");
                                     }
                                 }

                             }}
                        >
                            <i className="fa fa-calendar-plus-o"/>
                        </div>
                    </div>
                </div>
                <div className="content">
                    <iframe ref="editor"
                            style={{display: this.state.html ? "" : "none"}}/>
                    <textarea className="input"
                              ref="input"
                              name={this.props.name}
                              style={{display: this.state.html ? "none" : ""}}
                              onChange={this.onContentChange.bind(this)}
                              value={this.state.content}/>
                    <EditorResize ref="resize" onChange={this.onContentChange.bind(this)}/>
                </div>
            </div>
        );
    }
}