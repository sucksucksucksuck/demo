/**
 * Created by sun_3211 on 2017/4/1.
 */
import React from 'react';
import Confirm from '../modules/dialog/confirm';
import Prompt from '../modules/dialog/prompt';
import Permission from '../modules/dialog/permission';
import Toast from '../modules/dialog/toast';
import Load from '../modules/dialog/load';
import ViewServer from '../modules/image/view_server';


export function confirm(content, callback) {
    let call = function (type) {
        if (type === "cancel") {
            close("confirm");
        }
        if (type === "ok" && callback) {
            if (callback(type) === true) {
                close("confirm");
            }
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "confirm",
            fade: true,
            view: <Confirm content={content} onClick={call} />
        }
    });
}

export function prompt(content,callback,text) {
    let call = function (type) {
        if (type === "cancel") {
            close("prompt");
        }
        if(callback){
            if(callback(type)===true){
                close("prompt");
            }
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "prompt",
            fade: true,
            view: <Prompt content={content} onClick={call} text={text}/>
        }
    });
}

export function permission(content) {
    let call = function (type) {
        if (type === "cancel") {
            close("permission");
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "permission",
            fade: true,
            view: <Permission content={content} onClick={call}/>
        }
    });
}

export function load(content) {
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "load",
            fade: false,
            view: <Load content={content}/>
        }
    });
}

export function toast(content,type) {
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "toast",
            fade: false,
            view: <Toast content={content} type={type}/>
        }
    });
}



export function viewServer() {
    let call = function (type) {
        if (type === "cancel") {
            close("viewServer");
        }
        if (type === "ok" && callback) {
            if (callback(type) === true) {
                close("viewServer");
            }
        }
    };
    window.store.dispatch({
        type: "DIALOG_OPEN",
        payload: {
            key: "viewServer",
            fade: true,
            view: <ViewServer onClick={call} />
        }
    });

}

export function close(key) {
    window.store.dispatch({
        type: "DIALOG_CLOSE",
        payload: key
    });
}

export function closeAll() {
    window.store.dispatch({
        type: "DIALOG_CLOSE_ALL"
    });
}



