/**
 * Created by SUN on 2016/11/11.
 */
import React from  'react';
// resize context
let minWidth = 12;
let minHeight = 12;
export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            target: null,
            position: {
                x: 0, y: 0
            },
            width: 0,
            height: 0,
            startPosition: {
                x: 0, y: 0
            },
            curPosition: {
                x: 0, y: 0
            }
        };
        this.closeDialog = function (e) {
            if (this.state.show) {
                let tag = e.target;
                while (tag) {
                    if (tag === this.refs['block']) {
                        return;
                    }
                    tag = tag.parentNode;
                }
                this.setState({show: false});
            }
        }.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

    }

    componentDidMount() {
        window.addEventListener("click", this.closeDialog, false);
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.closeDialog);
    }

    stopPropagation(e) {
        if (e.stopPropagation)
            e.stopPropagation();
        else
            e.cancelBubble = true;
    }

    getOffsetRootParentPosition(target, root) {
        let position = {x: 0, y: 0, w: 0, h: 0};
        position.w = target.offsetWidth;
        position.h = target.offsetHeight;
        position.x = target.offsetLeft;
        position.y = target.offsetTop;
        let offsetParent = target.offsetParent;
        while (offsetParent && offsetParent !== root && offsetParent.offsetParent !== root.offsetParent) {
            position.x += offsetParent.offsetLeft;
            position.y += offsetParent.offsetTop;
            position.y -= target.offsetParent.scrollTop;
            offsetParent = offsetParent.offsetParent;

        }
        if (offsetParent === root) {
            position.x = position.x - parseFloat(offsetParent.style.paddingLeft || 0);
            position.y = position.y - parseFloat(offsetParent.style.paddingTop || 0);
        }
        return position;
    }

    setTarget(target) {
        // console.log(target);
        let root = this.refs.root;
        let position = this.getOffsetRootParentPosition(target, root.parentElement);
        position.w = target.offsetWidth;
        position.h = target.offsetHeight;
        position.x = target.offsetLeft;
        position.y = target.offsetTop - target.offsetParent.scrollTop;
        let width = position.w;
        let height = position.h;
        let offsetPosition = {x: position.x, y: position.y};
        this.setState({
            target: target,
            width: width,
            height: height,
            show: true,
            position: offsetPosition
        })
    }

    getTarget() {
        return this.state.target;
    }

    clearTarget() {
        this.setState({
            target: null,
            show: false
        })
    }

    clearSelect(e) {
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else {
            document.selection.empty();
        }
    }

    getMousePosition(e) {
        e = e || window.event;
        let scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
        let scrollY = document.documentElement.scrollTop || document.body.scrollTop;

        let x = parseFloat(e.pageX || e.clientX + scrollX);
        let y = parseFloat(e.pageY || e.clientY + scrollY);

        return {x: x, y: y};
    }

    render() {
        let style = {
            width: this.state.width,
            height: this.state.height,
            left: this.state.position.x,
            top: this.state.position.y,
            display: this.state.show ? "block" : "none",
            positoin: "absolute"
        };
        return (
            <div className={"editor-resize-container " + (this.state.show ? "show" : "hide")} ref="root">
                <div ref="block" className="editor-resize" style={style}>
                    <div className="block-resize nw-resize" onMouseDown={this.handleMouseDown}
                         onMouseMove={this.handleMouseMove}
                         onMouseUp={this.handleMouseUp}/>
                    <div className="block-resize ne-resize" onMouseDown={this.handleMouseDown}
                         onMouseMove={this.handleMouseMove}
                         onMouseUp={this.handleMouseUp}/>
                    <div className="block-resize sw-resize" onMouseDown={this.handleMouseDown}
                         onMouseMove={this.handleMouseMove}
                         onMouseUp={this.handleMouseUp}/>
                    <div className="block-resize se-resize" onMouseDown={this.handleMouseDown}
                         onMouseMove={this.handleMouseMove}
                         onMouseUp={this.handleMouseUp}/>
                </div>
            </div>)
    }

    handleMouseDown(e) {
        let target = e.target || e.srcElement;
        let className = target.className;
        let startPosition = this.getMousePosition(e);
        this.clearSelect();
        if (className.indexOf("nw-resize") != -1) {
            this.setState({
                direction: "nw-resize",
                startPosition: startPosition
            })
        }
        if (className.indexOf("ne-resize") != -1) {
            this.setState({
                direction: "ne-resize",
                startPosition: startPosition
            })
        }
        if (className.indexOf("sw-resize") != -1) {
            this.setState({
                direction: "sw-resize",
                startPosition: startPosition
            })
        }
        if (className.indexOf("se-resize") != -1) {
            this.setState({
                direction: "se-resize",
                startPosition: startPosition
            })
        }

        window.removeEventListener("mouseup", this.handleMouseUp);
        window.removeEventListener("mousemove", this.handleMouseMove);
        window.addEventListener("mouseup", this.handleMouseUp, true);
        window.addEventListener("mousemove", this.handleMouseMove, true);
        this.stopPropagation(e);
    }

    handleMouseMove(e) {
        if (!this.state.direction) return;
        this.clearSelect();
        e = e || event;
        let target = e.target || e.srcElement;
        let curPosition = this.getMousePosition(e);
        let startPosition = this.state.startPosition;
        let dx = curPosition.x - startPosition.x;
        let dy = curPosition.y - startPosition.y;
        let width = this.state.width;
        let height = this.state.height;

        switch (this.state.direction) {
            case "nw-resize":
                width -= dx;
                height -= dy;
                break;
            case "ne-resize":
                width += dx;
                height -= dy;
                break;
            case "sw-resize":
                width -= dx;
                height += dy;
                break;
            case "se-resize":
                width += dx;
                height += dy;
                break;
        }
        startPosition = curPosition;
        if (width < minWidth) width = minWidth;
        if (height < minHeight) height = minHeight;
        if (this.state.target) {
            this.state.target.style.width = width + "px";
            this.state.target.style.height = height + "px";
            let root = this.refs.root;
            this.state.position = this.getOffsetRootParentPosition(this.state.target, root.parentElement);
        }

        this.setState({
            startPosition: startPosition,
            width: width,
            height: height
        });
        this.stopPropagation(e);
    }

    handleMouseUp(e) {
        if (!this.state.direction) return;
        this.clearSelect();
        e = e || event;
        let target = e.target || e.srcElement;
        let curPosition = this.getMousePosition(e);
        let startPosition = this.state.startPosition;
        let dx = curPosition.x - startPosition.x;
        let dy = curPosition.y - startPosition.y;
        let width = this.state.width;
        let height = this.state.height;

        switch (this.state.direction) {
            case "nw-resize":
                width -= dx;
                height -= dy;
                break;
            case "ne-resize":
                width += dx;
                height -= dy;
                break;
            case "sw-resize":
                width -= dx;
                height += dy;
                break;
            case "se-resize":
                width += dx;
                height += dy;
                break;
        }
        startPosition = curPosition;
        if (width < minWidth) width = minWidth;
        if (height < minHeight) height = minHeight;
        window.removeEventListener("mouseup", this.handleMouseUp);
        window.removeEventListener("mousemove", this.handleMouseMove);
        if (this.state.target) {
            this.state.target.style.width = width + "px";
            this.state.target.style.height = height + "px";
        }
        this.setState({
            startPosition: startPosition,
            height: height,
            width: width,
            direction: null,
        });
        this.props.onChange(true);
        this.stopPropagation(e);
    }
}