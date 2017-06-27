import jin from "../src/index.js"
import {parseHex} from "../src/index.js"
import {$} from "./util"
const main = $("#display")
export default class ColorBlock {
    constructor(r = 255, g = 255, b = 255) {
        // dom init
        this.dom_wrapper = $("div", "wrapper")
        main.appendChild(this.dom_wrapper)
        // ---
        this.dom_color_board = $("div", "color-board")
        this.dom_wrapper.appendChild(this.dom_color_board)
        // ---
        this.dom_code = $("div", "code")
        this.dom_wrapper.appendChild(this.dom_code)
        // ---
        this.dom_r = $("div", "code-child r")
        this.dom_r.appendChild($("input", "", "range"))
        this.dom_g = $("div", "code-child g")
        this.dom_g.appendChild($("input", "", "range"))
        this.dom_b = $("div", "code-child b")
        this.dom_b.appendChild($("input", "", "range"))
        this.dom_hex = $("div", "code-child hex")
        this.dom_hex.appendChild($("input", "", "text"))
        this.dom_code.appendChild(this.dom_r)
        this.listenChange(this.dom_r, "r")
        this.dom_code.appendChild(this.dom_g)
        this.listenChange(this.dom_g, "g")
        this.dom_code.appendChild(this.dom_b)
        this.listenChange(this.dom_b, "b")
        this.dom_code.appendChild(this.dom_hex)
        this.dom_hex.addEventListener("change", () =>{
            let rgb = parseHex(this.dom_hex.firstElementChild.value)
            this.jin.setRGB(rgb)
            this.setColor()
        })
        // ---
        // color init
        this.jin = jin(r, g, b)
        this.setColor()
    }

    enableEdit() {
        this.editabble = true
        this.dom_r.firstElementChild.removeAttribute("disabled")
        this.dom_g.firstElementChild.removeAttribute("disabled")
        this.dom_b.firstElementChild.removeAttribute("disabled")
        this.dom_hex.firstElementChild.removeAttribute("readonly")
    }

    listenChange(dom, key) {
        let emit = (value) => {
            this.jin.setRGB({[key]: value})
            this.setColor()
        }
        let moveListener = function () {
            emit(this.firstElementChild.value)
        }
        dom.addEventListener("mousedown", function () {
            setTimeout(() => {
                emit(this.firstElementChild.value)
            })
            dom.addEventListener("mousemove", moveListener)
            dom.addEventListener("mouseup", function () {
                dom.removeEventListener("mousemove", moveListener)
            })
        })
    }

    setColor() {
        this.dom_color_board.style.backgroundColor = this.jin.toString()
        this.setCodeStatus()
        if (this.hook) {
            this.hook()
        }
    }

    setCodeStatus() {
        this.dom_hex.firstElementChild.value = this.jin.toString()
        this.dom_r.firstElementChild.value = this.jin.rgb.r
        this.renderGradient(this.dom_r, "r", this.jin.rgb)
        this.dom_g.firstElementChild.value = this.jin.rgb.g
        this.renderGradient(this.dom_g, "g", this.jin.rgb)
        this.dom_b.firstElementChild.value = this.jin.rgb.b
        this.renderGradient(this.dom_b, "b", this.jin.rgb)
    }

    renderGradient(dom, which, {r, g, b}) {
        let from = {r, g, b}
        let to = {r, g, b}
        let transferToCss = function (color) {
            return "rgb(" + color.r + ", " + color.g + ", " + color.b + ")"
        }
        from[which] = 0
        to[which] = 255
        dom.style.background = `linear-gradient(to right, ${transferToCss(from)}, ${transferToCss(to)})`
    }

    addHue(number) {
        let hue = this.jin.hsb.h
        let added = hue + number
        if (added >= 360) {
            added %= 360
        }
        if (added < 0) {
            added += 360
        }
        this.jin.setHSB({h: added})
        this.setColor()
    }

    setHSB({h, s, b}) {
        if (s > 100) {
            s = 100
        }
        if (s < 0) {
            s = 0
        }
        if (b > 100) {
            b = 100
        }
        if (b < 0) {
            b = 0
        }
        if (h >= 360) {
            h %= 360
        }
        if (h < 0) {
            h += 360
        }
        this.jin.setHSB({h, s, b})
        this.setColor()
    }

    addHook(hook) {
        this.hook = hook
    }

    destroy() {
        main.removeChild(this.dom_wrapper)
    }
}