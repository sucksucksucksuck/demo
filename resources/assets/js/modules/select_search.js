/**
 * Created by sucksuck on 2017/7/31.
 */
import React from 'react';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            list: this.props.list,
            show: this.props.show,
            select: "",
            hover: "",
            filter: false,
            filter_list: [],
            hover_index: -1,
            move: false,
            search: {
                option: this.props.defaultValue
            }
        };
    }

    componentWillMount() {
        // this.initState(this.props.promoter_list);
    }

    componentDidMount() {

    }

    componentWillReceiveProps(props) {
        this.state.show = props.show;
        this.state.list = props.list;
        this.state.search.option = props.defaultValue;
        this.forceUpdate();
    }

    render() {
        return (
            <div className="select-item">
                <input type="text" id="select" name="option" value={this.state.search.option || ""}
                       autoComplete="off"
                       onBlur={() => {
                           this.forceUpdate();
                       }}

                       onKeyDown={(e) => {
                           if (e.keyCode == 13) {//enter
                               e.preventDefault();
                               this.state.show = false;
                               this.forceUpdate();
                           }
                           if (e.keyCode == 40) {//下
                               let length = 0;
                               if (this.state.filter) {
                                   length = this.state.filter_list.length;
                               } else {
                                   length = this.state.list.length;
                               }
                               if (length - 1 > this.state.hover_index) {
                                   ++this.state.hover_index;
                               }
                               if (this.state.filter) {
                                   for (let c in this.state.filter_list[this.state.hover_index]) {
                                       this.state.hover = c;
                                   }
                               } else {
                                   for (let c in this.state.list[this.state.hover_index]) {
                                       this.state.hover = c;
                                   }
                               }
                               if (this.state.hover_index > 1) {
                                   this.refs.select.scrollTop += 20;
                               }
                               this.state.search.option = this.state.hover;
                               this.props.onHandleChange(this.state.hover);
                               this.state.move = true;
                               this.forceUpdate();
                           }
                           if (e.keyCode == 38) {//上
                               if (this.state.hover_index > 0) {
                                   --this.state.hover_index;
                               }
                               if (this.state.filter) {
                                   for (let c in this.state.filter_list[this.state.hover_index]) {
                                       this.state.hover = c;
                                   }
                               } else {
                                   for (let c in this.state.list[this.state.hover_index]) {
                                       this.state.hover = c;
                                   }
                               }
                               if (this.state.hover_index > -1) {
                                   this.refs.select.scrollTop -= 20;
                               }
                               this.state.move = true;
                               this.props.onHandleChange(this.state.hover);
                               this.state.search.option = this.state.hover;
                               this.forceUpdate();
                           }
                       }}
                       onFocus={() => {
                           this.state.show = true;
                           this.state.filter = false;
                           // this.state.hover_index = -1;
                           this.state.list.map(function (item, index) {
                               for (let c in item) {
                                   if (c == this.state.search.option) {
                                       this.state.hover_index = index;
                                       this.refs.select.scrollTop = 20 * index;
                                       this.forceUpdate();
                                   }
                               }
                           }.bind(this));
                           this.forceUpdate();
                       }}
                       onKeyUp={(e) => {
                           if (e.keyCode == 13) {
                               e.preventDefault();
                           }
                           this.forceUpdate();
                       }}
                       onChange={(e) => {
                           if (e.target.value.length > 1) {
                               if(!this.state.show){
                                   this.state.show = true;
                                   this.forceUpdate();
                               }
                               this.state.hover_index = -1;
                               this.state.filter = true;
                               this.state.filter_list = [];
                               this.refs.select.scrollTop = 0;
                               this.forceUpdate();
                               var reg = new RegExp(e.target.value);
                               for (let c in this.props.promoter_list) {
                                   if (c.match(reg)) {
                                       let temp = {};
                                       temp[c] = this.props.promoter_list[c];
                                       this.state.filter_list.push(temp);
                                   }
                               }
                           } else {
                               this.state.filter = false;
                           }
                           this.forceUpdate();
                           this.state.search.option = e.target.value;
                           this.props.onHandleChange(e.target.value);
                       }}
                />
                <span id="span"
                      onClick={() => {
                          this.state.show = !this.state.show;
                          if (!this.state.hover) {
                              for (let c in this.state.list[0]) {
                                  this.state.hover = c;
                              }
                          } else {
                              this.state.list.map(function (item, index) {
                                  for (let c in item) {
                                      if (c == this.state.search.option) {
                                          this.state.hover_index = index;
                                          this.refs.select.scrollTop = 20 * index;
                                          this.forceUpdate();
                                      }
                                  }
                              }.bind(this));
                          }
                          this.forceUpdate();
                      }}/>
                <div ref="select" className={this.state.show ? "select" : "select hide"} tabIndex={1}
                     onBlur={() => {
                         this.state.show = false;
                     }
                     }>
                    {this.state.filter ? null : <div className={this.state.hover == "全部" ? "hover" : null}
                                                     onMouseMove={() => {
                                                         if (this.state.move) {
                                                             this.state.move = false;
                                                             this.forceUpdate();
                                                         }
                                                     }
                                                     }
                                                     onClick={() => {
                                                         this.state.search.option = this.state.hover;
                                                         this.props.onHandleChange(this.state.hover);
                                                         this.state.show = false;
                                                         this.forceUpdate();
                                                     }
                                                     }
                                                     onMouseOver={(e) => {
                                                         if (!this.state.move) {
                                                             this.state.hover = e.target.innerHTML;
                                                             this.forceUpdate();
                                                         }
                                                     }}>全部</div>}
                    {this.state.filter ? this.state.filter_list.map(function (item, index) {
                        for (let c in item) {
                            return <div className={this.state.hover == c ? "hover" : null}
                                        onMouseMove={() => {
                                            if (this.state.move) {
                                                this.state.move = false;
                                                this.forceUpdate();
                                            }
                                        }
                                        }
                                        onClick={() => {
                                            this.state.search.option = this.state.hover;
                                            this.props.onHandleChange(this.state.hover);
                                            this.state.show = false;
                                            this.forceUpdate();
                                        }
                                        }
                                        onMouseOver={(e) => {
                                            if (!this.state.move) {
                                                this.state.hover = e.target.innerHTML;
                                                this.forceUpdate();
                                            }
                                        }} key={index}>{c}</div>;
                        }
                    }.bind(this)) : this.state.list.map(function (item, index) {
                        for (let c in item) {
                            return <div className={this.state.hover == c ? "hover" : null}
                                        onMouseMove={() => {
                                            if (this.state.move) {
                                                this.state.move = false;
                                                this.forceUpdate();
                                            }
                                        }
                                        }
                                        onClick={() => {
                                            this.state.search.option = this.state.hover;
                                            this.props.onHandleChange(this.state.hover);
                                            this.state.show = false;
                                            this.forceUpdate();
                                        }}
                                        onMouseOver={(e) => {
                                            if (!this.state.move) {
                                                this.state.hover = e.target.innerHTML;
                                                this.forceUpdate();
                                            }
                                        }} key={index}>{c}</div>;
                        }
                    }.bind(this))}
                </div>


            </div>
        );
    }
}