/**
 * Created by sucksuck on 2017/3/24.
 */
import React from 'react';
import ReactDOM from "react-dom";
import ajax from '../ajax';
import * as utilAction from '../../action/util';

export function open() {
    let win = window.open();
    win.document.body.innerHTML = '<div id="react_root"></div>';
    return {win: win, root: win.document.getElementById('react_root')};
}

export function post(url, data) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.responseType = 'blob';
    utilAction.toast("正在下载...", true);
    xhr.onload = function () {
        if (this.status === 200) {
            let type = xhr.getResponseHeader('Content-Type');
            if (type.indexOf("application/json") > -1) {
                let reader = new FileReader();
                reader.onload = function () {
                    // console.log(reader.result);
                    let ret = JSON.parse(reader.result);
                    utilAction.prompt(ret.msg);
                    if(ret.errcode){
                        utilAction.close("toast",true);
                    }
                };
                reader.readAsText(xhr.response);
            } else {
                let filename = "";
                let disposition = xhr.getResponseHeader('Content-Disposition').toLowerCase();
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    let matches = filenameRegex.exec(disposition);
                    if (matches && matches[1]) filename = matches[1].replace(/['"]/g, '');
                }
                if (typeof window.navigator.msSaveBlob !== 'undefined') {
                    window.navigator.msSaveBlob(xhr.response, filename);
                } else {
                    let downloadUrl = window.URL.createObjectURL(xhr.response);
                    let a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = filename;
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function () {
                        URL.revokeObjectURL(downloadUrl);
                        document.body.removeChild(a);
                        utilAction.close("toast");
                    }, 100); // cleanup
                }
            }
        }
    };
    // xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(ajax.param(data, 'POST'));
}

export function pop() {
    let fulls = "left=300,top=200,location=no,resizable=yes";
    let ah = screen.availHeight - 300;
    let aw = screen.availWidth - 400;
    fulls += ",height=" + ah;
    fulls += ",width=" + aw;
    let pop = window.open('', '', fulls);
    let fileref = document.createElement('link');
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", window.config.root + "/css/index.css");
    pop.document.getElementsByTagName("head")[0].appendChild(fileref);
    pop.document.body.innerHTML = '<div id="react_root"></div>';
    return {pop: pop, root: pop.document.getElementById('react_root')};
}

export function popOne() {
    let fulls = "left=300,top=200,location=no,resizable=yes";
    let ah = screen.availHeight - 300;
    let aw = screen.availWidth - 400;
    fulls += ",height=" + ah;
    fulls += ",width=" + aw;
    let pop = window.open('', 'pop', fulls);
    let fileref = document.createElement('link');
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", window.config.root + "/css/index.css");
    pop.document.getElementsByTagName("head")[0].appendChild(fileref);
    pop.document.body.innerHTML = '<div id="react_root"></div>';
    return {pop: pop, root: pop.document.getElementById('react_root')};
}
