import * as vue from "vue";
const vueVersion = parseInt(vue.version.slice(0, vue.version.indexOf(".")));
export class Component {
    constructor(props) {
        this.props = props;
        var methods = {};
        for (const key in this) {
            let fx = this[key];
            if (typeof fx === "function")
                methods[key] = fx;
        }
        this.setState = this.setState.bind(this);
    }
    context;
    refs = {};
    forceUpdate() { }
    props;
    state = vue.reactive({});
    setState(data) {
        Object.assign(this.state, data);
    }
    render() {
        return;
    }
}
const vue2ElementIdentity = Symbol("vue2.JSX");
export const createElement = (function () {
    function createVnode(cpn, props) {
        if (typeof cpn === "function") {
            var reactProps = {};
            if (props) {
                reactProps = Object.assign({}, props);
                if (props.style)
                    reactProps.style = Object.assign({}, props.style);
            }
            if (cpn.prototype instanceof Component) {
                var ReactInstance;
                var renderFx;
                var proxyCPN = {
                    data() {
                        reactProps.children = this.$slots;
                        ReactInstance = new cpn(reactProps);
                        renderFx = ReactInstance.render.bind(ReactInstance);
                        return ReactInstance.state;
                    },
                    created() {
                        ReactInstance.state = this.$data;
                    },
                    render() {
                        reactProps.children = this.$slots;
                        return renderFx(this.$attrs);
                    },
                };
                return proxyCPN;
            }
            else {
                if (vueVersion === 2)
                    return {
                        created() {
                            reactProps.children = this.$slots;
                        },
                        render() {
                            return cpn(reactProps);
                        },
                    };
                else
                    return function FxProxCPN(props, { slots }) {
                        if (!reactProps.children) {
                            reactProps.children = slots;
                            Object.freeze(reactProps);
                        }
                        return cpn(reactProps);
                    };
            }
        }
        else
            return cpn;
    }
    function Vue3createElement(cpn, props, ...children) {
        if (typeof cpn === "string" && props) {
            // 将React的onMouseOut写法改成vue的onMouseout
            for (const key of Object.keys(props)) {
                if (key.search(/^on[A-Z]\w+[A-Z]\w+$/) === 0) {
                    let vueEventName = "on" + key.toLowerCase().slice(2);
                    let val = props[key];
                    delete props[key];
                    props[vueEventName] = val;
                }
            }
        }
        var proxyCPN = createVnode(cpn, props);
        return vue.h.apply(undefined, [proxyCPN, props, ...children]);
    }
    if (vueVersion >= 3)
        return Vue3createElement;
    /** vue2使用 */
    function handelChildren(cpns) {
        return cpns.map(function (cpn) {
            var unk_val = cpn;
            var data = unk_val[vue2ElementIdentity];
            if (data) {
                let [props, childs] = data;
                delete unk_val[vue2ElementIdentity];
                // let proxyCPN = createVnode(unk_val, props);
                return vue.h(unk_val, props, handelChildren(childs));
            }
            else
                return unk_val;
        });
    }
    function Vue2CreateElement(cpn, props, ...children) {
        var transProps = {};
        //将React props转换成vue2的props
        if (props) {
            transProps.style = props.style;
            transProps.key = props.key;
            transProps.ref = props.ref;
            let atts = { ...props };
            delete atts.style;
            delete atts.key;
            delete atts.ref;
            transProps.attrs = atts;
            //处理原生dom的事件和属性
            //todo 属性需要处理
            if (typeof cpn === "string" && props) {
                transProps.class = props.className;
                delete atts.class;
                let on = {};
                transProps.on = on;
                for (const key of Object.keys(atts)) {
                    if (key.search(/^on[A-Z]\w+[A-Z]?\w*$/) === 0) {
                        let handel = atts[key];
                        if (typeof handel === "function") {
                            let evName = key.slice(2).toLowerCase();
                            on[evName] = handel;
                            delete atts[key];
                        }
                        //todo 如果handel不是函数
                    }
                }
            }
        }
        if (vue.getCurrentInstance()) {
            let knownChildren = undefined;
            if (children.length > 0)
                knownChildren = handelChildren(children);
            let proxyCPN = createVnode(cpn, props);
            return vue.h(proxyCPN, transProps, knownChildren);
        }
        else {
            let proxyCPN = createVnode(cpn, props);
            //todo 如果是组件是非class或function组件?
            proxyCPN[vue2ElementIdentity] = [transProps, children];
            return proxyCPN;
        }
    }
    Vue2CreateElement.handelChildren = handelChildren;
    return Vue2CreateElement;
})();
class App {
    constructor(root) {
        if (!(root instanceof HTMLElement))
            throw "目标必须是一个HTML元素";
        this.#root = root;
    }
    #root;
    render(node) {
        let version = vueVersion;
        if (version >= 3)
            vue.createApp(node).mount(this.#root);
        else {
            var myVNode = node;
            if (myVNode[vue2ElementIdentity]) {
                new vue.default({
                    el: this.#root,
                    render(h) {
                        var [props, childs] = myVNode[vue2ElementIdentity];
                        return h(myVNode, props, createElement.handelChildren(childs));
                    },
                });
            }
            else {
                throw "错误的组件";
            }
        }
    }
}
export function createRoot(root) {
    return new App(root);
}
export function isValidElement(e) {
    if (typeof e === "function" && e[vue2ElementIdentity])
        return true;
    return vue.isVNode(e);
}
export const version = "18.0.0";
