/**
 * Created by sucksuck on 2017/7/11.
 * 晒单列表
 */

import React from 'react';
import Form from'../../../../modules/form';
import Input from '../../../../modules/input';
import {connect} from 'react-redux';
import * as robotAction from '../../../../action/share_order/robot';
import * as shareAction from '../../../../action/share_order/share_order_list';

import * as utilAction from '../../../../action/util';
import CountDown from '../../../../modules/count_down';
import Button from '../../../../modules/button';

class CreateShareOrder extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来
        this.state = props['shareInfo'];
        this.reader = new FileReader();
        this.callback = false;
        this.reader.onload = function () {
            this.state.image.push(this.reader.result);
            if (this.callback) {
                this.callback();
            }
        }.bind(this);
    }

    componentWillReceiveProps(props) {
        this.state = props['shareInfo'];
        this.forceUpdate();
    }

    componentWillMount() {  //render前
        if(this.props.item.periods_id){
            //要请求
            shareAction.getShareInfo({id:this.props.item.id});
        }
    }

    componentWillUnmount() {
        shareAction.clearShareInfo();
    }

    onClick(type) {
        if (this.props.onClick) {
            this.props.onClick(type);
        }
    }


    doImageDel(index, isDel, isRaw) {
        if (isDel) {
            let i = this.state.form['delete'].indexOf(index);
            this.state.form['delete'].splice(i, 1);
        } else if (isRaw) {
            this.state.form['delete'].push(index);
        } else {
            this.state['image'].splice(index, 1);
            this.state['form']['image'].splice(index - this.state.init_length, 1);
            if (this.state.form.main > index) {
                this.state.form.main--;
                this.forceUpdate();
                return;
            }
        }
        if (this.state.form.main === index) {
            this.state.form.main = -1;
        }
        this.forceUpdate()
    }

    doImageAdd(e) {
        let f = e.target.files;
        let length = f.length;
        for (let i = 0; i < length; i++) {
            this.state.form.image.push(f[i]);
        }
        this.loadFile(f, this.forceUpdate.bind(this));

    }

    loadFile(files, callback, index = 0) {
        if (files.length > index) {
            this.reader.readAsDataURL(files[index]);
            this.callback = this.loadFile.bind(this, files, callback, ++index);
        } else {
            this.callback = false;
            callback();
        }
    }

    render() {
        return (
            <div className="share-order">
                <div className="title">晒单分享
                    <div className="close" onClick={this.onClick.bind(this, 'cancel')}/>
                </div>
                <div className="goods-title">
                    <div>{this.props.item.title}</div>
                    <div>
                        <div>购买时间：{this.props.item.o_create_at}</div>
                        <div>揭晓时间：{this.props.item.lottery_show_at}</div>
                        {this.props.item.periods_id?<div>晒单时间：{this.state.data.s_create_at}</div>:null}
                    </div>
                </div>
                <div className="info">
                    <div>
                        <img src={this.props.item.icon} onError={(e) => {
                            e.target.src = window.config.root + "/image/index/index_user.png";
                        }}/>
                    </div>
                    <div>
                        <div>期数</div>
                        <div>{this.props.item.periods}</div>
                    </div>
                    <div>
                        <div>产品ID</div>
                        <div>{this.props.item.goods_id}</div>
                    </div>
                    <div>
                        <div>购买人次</div>
                        <div>{this.props.item.num}</div>
                    </div>
                </div>
                <div className="wrap">
                    <div className="item-title">晒单内容</div>
                    <textarea name="content" cols="300" rows="5" value={this.state.content} onChange={(e) => {
                        this.state.content = e.target.value;
                        this.forceUpdate();
                    }}/>
                    <div className="item-title">晒单图片（仅可以上传JPG、GIF或PNG格式的文件，图片大小不能超过2M）</div>
                    <div className="edit-img">
                        {this.state.image.map(function (img, index) {
                            let itemClass = ['item'];
                            let isDel = false;
                            let isRaw = false;
                            if (img.indexOf('data:images') !== 0) {
                                isRaw = true;
                            }
                            if (this.state.form["delete"].indexOf(index) > -1) {
                                if (this.state.form.main === index) {
                                    this.state.form.main = -1;
                                }
                                isDel = true;
                                itemClass.push('delete');
                            }
                            if (this.state.form.main === index) {
                                itemClass.push('main');
                            }
                            return (
                                <div className={itemClass.join(' ')} key={index}>
                                    <img src={img}/>
                                    <div className="operation">
                                        <div
                                            onClick={this.doImageDel.bind(this, index, isDel, isRaw)}>
                                            {isDel ? "取消" : "删除"}
                                        </div>

                                    </div>
                                </div>
                            );
                        }, this)}
                        <div className="item add">
                            <input type="file"
                                   multiple
                                   className="file"
                                   onChange={this.doImageAdd.bind(this)}/>
                        </div>
                    </div>
                </div>
                <div className="button">
                    <button type="button" onClick={() => {
                        if(this.props.item.periods_id){
                            shareAction.editShareInfo({
                                content: this.state.content,
                                image: this.state.form.image,
                                periods_id: this.props.item.periods_id,
                                img_del:this.state.form.delete
                            }, this.props.search)
                        }else {
                            robotAction.createShare({
                                content: this.state.content,
                                image: this.state.form.image,
                                periods_id: this.props.item.id
                            }, this.props.search);

                        }

                    }}>保存
                    </button>
                    <button type="button" onClick={this.onClick.bind(this, 'cancel')}>取消</button>
                </div>
            </div>
        )

    }
}
export default connect(({shareInfo}) => ({shareInfo}))(CreateShareOrder);
