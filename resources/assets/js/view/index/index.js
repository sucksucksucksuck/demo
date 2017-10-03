/**
 * Created by bang on 2017/3/1.
 */
import React from 'react';
import {connect} from 'react-redux';
import Menu from './menu';
import TabContent from './tab_content';
// import Header from './header';
import Dialog from '../../modules/dialog';
import {BrowserRouter} from 'react-router-dom'

class Index extends React.Component {
    constructor(props) {
        super(props);
        //通过属性传递state过来

    };

    render() {
        return (
            <BrowserRouter>
                <div className="index-panel">
                    <div className="content">
                        <Menu menu={this.props.menu} auth={this.props.auth}/>
                        <TabContent/>
                    </div>
                    <Dialog/>
                </div>
            </BrowserRouter>
        )
    }
}

export default connect(({menu, auth}) => ({menu, auth}))(Index);
// connect(({menu}) => ({menu}))(Index);