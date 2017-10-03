/**
 * Created by lrx on 2017/5/19.
 */

import React from 'react'
import MonitorHidden from '../../view/index/tab_content/system/monitor_hidden'

export function monitorHidden() {
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "monitorHidden",
            fade: true,
            view: <MonitorHidden/>
        }
    });
}
/*关窗*/
export function monitorHiddenClose() {
    window.store.dispatch({
        type: "DIALOG_CLOSE",
        payload: "monitorHidden"
    });
}