import React from 'react';
import {connect} from 'react-redux';
import * as platformAction from "../../action/platform"
import * as utilAction from '../../action/util';

class ChangePassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = props['auth'];
      this.state.oldWord="";
      this.state.newWord="";
      this.state.sureWord="";
  }

  onChange(e){
    // e.preventDefault()
    this.state[e.target.name] = e.target.value;
    this.forceUpdate();
  }
  onClose(){
      window.store.dispatch({
        type: "DIALOG_CLOSE",
        payload: "changePwd"
    });
  }
  onFocus(){
      this.state.newWord="";
      this.state.sureWord="";
      this.forceUpdate();
  }
  render() {
    return (
        <div className="changePwd">
          <div className="title">修改密码<div className="close" onClick={this.onClose.bind(this)}/></div>
          <form method="post" className="wordList" onSubmit={
              (e)=>{
                  e.preventDefault();
                  if(this.state.sureWord!==this.state.newWord){
                      alert("两次输入密码不一致");
                      this.onFocus()
                  }
                  else{
                      utilAction.confirm("确定要修改吗",()=>{
                          platformAction.changePwd({new_password:this.state.newWord,password:this.state.oldWord});
                          this.onClose();
                          return true;//弹框需返回true
                      })
                  }
              }
          }>
            <div className="Word">
              <span>原密码</span>
              <input type="password" name="oldWord" placeholder="请输入原密码" value={this.state.oldWord} onChange={this.onChange.bind(this)}/>
            </div>
            <div className="Word">
              <span>新密码</span>
              <input type="password" name="newWord" placeholder="请输入新密码"  value={this.state.newWord} onChange={this.onChange.bind(this)}/>
            </div>
            <div className="Word">
              <span>确认密码</span>
              <input type="password" name="sureWord" placeholder="请确认密码" value={this.state.sureWord} onChange={this.onChange.bind(this)}/>
            </div>
            <div className="btn">
                <button className="active" >保存</button>
                {/*<button type="button" onClick={this.onClose.bind(this)*/}
                {/*}>取消</button>*/}
            </div>
          </form>
        </div>
    )
  }
}
export default connect(({auth}) => ({auth}))(ChangePassword);