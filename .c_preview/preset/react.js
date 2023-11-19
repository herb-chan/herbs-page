import { createElement, Component, version } from "react";
import * as ReactDOM from "react-dom";
import { createPage } from "./comm/comm";
import { bridgeData } from "../bridge/bridgeFile";
/** 简单判断一个变量是否是组件 */
function isCpn(P) {
    let type = typeof P;
    return type === "function" || type === "object";
}
export async function render(getMod) {
    const [root, App] = await createPage(getMod(), bridgeData, {
        Component,
        createElement,
        isCpn,
    });
    document.body.appendChild(root);
    const flag = parseInt(version.slice(0, version.indexOf(".")));
    if (flag >= 18) {
        ReactDOM.createRoot(root).render(App);
    }
    else {
        ReactDOM.render(App, root);
    }
}
