export async function createPage(getMod, bridgeData, jsxTool) {
    let mod;
    const root = document.createElement("div");
    root.style.height = "100%";
    try {
        mod = await getMod;
    }
    catch (error) {
        console.error(error);
        mod = error;
    }
    let fileInfo = { fileUrl: bridgeData.activeFileRelPath, mapUrl: bridgeData.mapFileRelPath };
    return [root, createComponent(fileInfo, jsxTool, mod).App];
}
/** 设置JSX Factory, 返回公共组件
 *  @param parent React是React.Component, Vue是模拟的Component类
 */
export function createComponent(fileInfo, jsxTool, mod) {
    const { Component, createElement: h, isCpn } = jsxTool;
    /** 筛选组件 */
    function getVDOMList(mod, isCpn) {
        var Components = [];
        for (const name of Object.keys(mod)) {
            let val = mod[name];
            if (!isCpn(val))
                continue;
            let obj = { name, cpn: val };
            if (name === "default")
                Components.unshift(obj);
            else
                Components.push(obj);
        }
        return Components;
    }
    const template = {
        Null(props) {
            const {} = props;
            var children = ["The file does not export components", h("br", null)];
            return h("div", { style: { width: "100%", margin: "8px" } }, children);
        },
        Error(props) {
            const { msg, error } = props;
            return (h("div", { style: { width: "100%", margin: "8px", whiteSpace: "pre" } },
                msg,
                h("div", { style: { color: "red", fontSize: "12px", marginTop: "8px" } }, error.stack)));
        },
    };
    function FileInfo(props) {
        const { info } = props;
        return (h("div", null,
            "preview: " + info.fileUrl,
            h("br", null),
            "mapPreview: " + info.mapUrl));
    }
    class Selector extends Component {
        constructor(p) {
            super(p);
        }
        /** 组件类别被点击 */
        select(index) {
            if (this.props.index === index)
                return;
            var fx = this.props.onSelect;
            fx ? fx(index) : null;
        }
        /**  */
        onMouseOver(e) {
            var style = e.target.style;
            style.color = "#7E9178";
            style.backgroundColor = "#FAE7D9";
        }
        onMouseOut(e) {
            var style = e.target.style;
            style.backgroundColor = "inherit";
            style.color = "#FFF";
        }
        render() {
            let props = this.props;
            return (h("div", { style: {
                    display: "flex",
                    width: "100%",
                    height: "25px",
                    backgroundColor: "#7E9178",
                } }, props.names.map((val, index) => {
                if (val.length > 26)
                    val = val.slice(0, 23) + "..";
                return (h("div", { onMouseOver: props.index === index ? undefined : this.onMouseOver, onMouseOut: props.index === index ? undefined : this.onMouseOut, onClick: this.select.bind(this, index), key: val, style: {
                        padding: "0 5px",
                        flex: "1 1",
                        color: index === props.index ? "#7E9178" : "#FFF",
                        backgroundColor: index === props.index ? "#FAE7D9" : "inherit",
                        fontSize: "11px",
                        height: "100%",
                        textAlign: "center",
                        lineHeight: "25px",
                        display: "inline-block",
                        fontWeight: "bold",
                    } }, val));
            })));
        }
    }
    class HOME extends Component {
        nameList;
        cpnList;
        constructor(props) {
            super(props);
            let nameList = [];
            let cpnList = [];
            this.nameList = nameList;
            this.cpnList = cpnList;
            for (const item of props.CPN_List) {
                nameList.push(item.name);
                cpnList.push(item.cpn);
            }
            this.state = {
                index: 0,
                ActiveCPN: cpnList[0],
            };
        }
        componentDidCatch(e) {
            //组件可能存在错误无法渲染
            this.setState({
                ActiveCPN: () => h(template.Error, { msg: "Component render error: ", error: e }),
            });
        }
        change(index) {
            this.setState({ ActiveCPN: this.cpnList[index], index });
        }
        render() {
            const { ActiveCPN, index } = this.state;
            const props = this.props;
            var nameList = props.CPN_List.map((val) => val.name);
            return (h("div", { style: { height: "100%", display: "flex", flexDirection: "column" } },
                h(Selector, { names: nameList, index: index, onSelect: this.change.bind(this) }),
                h("div", { style: { flex: "1 1", width: "100%" } },
                    h(ActiveCPN, null))));
        }
    }
    let cpnList = getVDOMList(mod, isCpn);
    let App;
    if (mod instanceof Error) {
        App = h(template.Error, { error: mod, msg: "File error:" });
    }
    else if (cpnList.length) {
        App = h(HOME, { CPN_List: cpnList, fileInfo: fileInfo });
    }
    else {
        App = h(template.Null, null);
    }
    return {
        App,
        template,
    };
}
