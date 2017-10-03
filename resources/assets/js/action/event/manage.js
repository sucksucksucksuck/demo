/**
 * Created by sucksuck on 2017/5/25.
 */
import * as utilAction from '../util';

//活动配置
export function getEventManageList(form) {
    window.ajax.post(window.config.root + '/event_manage/manage', form, function (ret) {
        if (ret.errcode) {
            utilAction.prompt(ret.msg);
        } else {
            window.store.dispatch({
                type: "EVENT_MANAGE_LIST_INIT",
                payload: ret.data
            });
        }
    });
}