/**
 * Created by sucksuck on 2017/6/13.
 */
import React from 'react';


export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {button: []};
        this.initState(props);
    }


    componentWillReceiveProps(props) {
        this.initState(props);
        this.getNavButton(props.item);
        this.forceUpdate();
    }

    initState(props) {
        if (props.children) {
            this.state.button = [];
            this.state.item = props.item;
            // console.log(this.state.item);
            if (props.children instanceof Array) {
                this.state.button.push(...props.children);
            } else {
                this.state.button.push(props.children);
            }
        }
    }

    getNavButton(item) {
        let button = [];
        for (let btn of this.state.button) {
            if (btn.props.compare) {
                let compare = btn.props.compare.replace(/\$\{([\w\d]*)\}/g, function (m1, m2) {
                    if (item[m2] !== "") {
                        return item[m2];
                    }
                });
                let result = eval(compare);
                if (!result) {
                    continue;
                }
            }
            if (btn.props.action !== undefined && btn.props.module) {
                if (!window.hasPermission(btn.props.module, btn.props.action)) {
                    continue;
                }
            }
            if (btn.type === 'button') {
                let props = {
                    key: btn.props.name,
                    name: btn.props.name,
                    onClick: btn.props.onClick,
                    className: btn.props.className,
                    type: btn.props.type
                };
                // console.log(btn.type,props,btn.props.children)
                button.push(React.createElement(btn.type, props, btn.props.children));
            } else {
                let props = {
                    key: btn.props.name,
                    className: btn.props.className,
                    to: window.caseUrl(btn.props.to.replace(/\$\{([\w\d]*)\}/g, function (m1, m2) {
                        return item[m2];
                    }))
                };
                button.push(React.createElement(btn.type, props, btn.props.children));
            }
        }
        return button;
    }

    render() {
        return (
            <div className="button">{this.getNavButton(this.props.item)}</div>

        );
    }
}