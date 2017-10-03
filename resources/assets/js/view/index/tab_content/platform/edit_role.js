
/**
 * Created by lrx on 2017/4/24.
 */
import React from 'react';
import {connect} from 'react-redux';
import * as platformAction from '../../../../action/platform';
import * as utilAction from '../../../../action/util';

class EditRole extends React.Component {
    constructor(props) {
        super(props);
        this.state = props["platformRole"];
        this.state.type = this.props.type;
    }

    componentWillMount() {
        // platformAction.editNow();
    }

    componentWillReceiveProps(props) {
        // this.forceUpdate();
    }
    onChange(e) {
        e.preventDefault();
        this.state.roleName = e.target.value;
        this.forceUpdate();
    }
    emptyClick(){
        this.state.roleName = '';
        this.forceUpdate();
    }
    render() {
        return (
            <div className="roles">
                <div className="title">编辑角色<div className="close" onClick={platformAction.editClose.bind(this)}/></div>
                <div className="role-name">
                    <div>角色名称</div>
                    <div className="input">
                        <input type="text" value={this.state.roleName} onChange={this.onChange.bind(this)}/>
                        <div onClick={this.emptyClick.bind(this)}>&times;</div>
                    </div>
                </div>
                <div className="role-name">
                    <div>角色类型</div>
                    <div className="input">
                        <label onClick={() => {
                            this.state.type = "1";
                            this.forceUpdate();
                        }}>
                            <input name="type" type="radio" value="1" onChange={(e)=>{
                                this.state.type = "1";
                            }} checked={this.state.type == 1}/>
                            其他
                        </label>
                        <label onClick={() => {
                            this.state.type = "2";
                            this.forceUpdate();
                        }}>
                            <input name="type" type="radio" value="2" onChange={(e)=>{
                                this.state.type = "2";
                            }} checked={this.state.type == 2}/>
                            市场
                        </label>
                    </div>
                </div>
                <div className="button">
                    <button type="button"
                            className="blue"
                            onClick={utilAction.confirm.bind(this, "确认保存吗", platformAction.saveEdit.bind(this, {
                                pid:this.state.pid,
                                id: this.state.id,
                                title: this.state.roleName,
                                type:this.state.type
                            }))}
                    >保存
                    </button>
                    <button type="button" onClick={platformAction.editClose.bind(this)}>取消</button>
                </div>

            </div>);
    }
}
export default connect(({platformRole}) => ({platformRole}))(EditRole);