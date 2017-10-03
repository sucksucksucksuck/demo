/**
 * Created by sucksuck on 2017/6/5.
 */
import * as utilAction from '../util';
import * as eventAction from './display';

//获取关联信息
export function getAssociateInfo(id) {
    window.ajax.post(window.config.root + '/event_manage/display_info', id, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "ASSOCIATED_INFO_INIT",
                payload: ret.data
            });
        }
    });
}

//保存关联专栏
export function setAssociatecontent(form, search) {
    window.ajax.post(window.config.root + '/event_manage/display_info/edit_content', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            utilAction.close("associate_content");
            eventAction.getEventDisplayList(search);

        }
    });
}