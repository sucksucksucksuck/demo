/**
 * Created by Sun on 16/10/3.
 */

// import React from 'react';
// import Dialog from '../../util/dialog';
// import Color from './index';
// export default class extends React.Component {
//     constructor(props) {
//         super(props);
//     }
//
//     onColorClick(type, value) {
//         if (this.props.onColorClick) {
//             if (this.props.onColorClick(type, value) !== false) {
//                 this.refs["dialog"].closeDialog();
//             }
//         } else {
//             this.refs["dialog"].closeDialog();
//         }
//     }
//
//     componentWillReceiveProps() {
//         this.refs["dialog"].showDialog();
//     }
//
//
//     render() {
//         return (
//             <Dialog ref="dialog" fade={true}>
//                 <Color onClick={this.onColorClick.bind(this)}/>
//             </Dialog>
//         )
//     }
// }
import React from 'react';
import Color from './index';
export default class extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }
    onClose(){
        window.store.dispatch({
            type: "DIALOG_CLOSE",
            payload: "color"
        });
    }
    onButtonClick(type,value){
        if (this.props.onButtonClick) {
            this.props.onButtonClick(type,value);
        }
    }

    render() {
        return (
            <div className="color">
                <div className="title">颜色选择
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <Color onClick={this.onButtonClick.bind(this)}/>
            </div>);
    }
}