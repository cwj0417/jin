import jin from "../src/index.js"

const $ = function (selector, className, type) {
    if (className || type) {
        let dom = document.createElement(selector)
        dom.className = className
        if (type) {
            dom.setAttribute("type", type)
            if (type === "range") {
                dom.setAttribute("max", 255)
            }
        }
        return dom
    }
    let results = document.querySelectorAll(selector)
    return results.length === 1 ? results[0] : results
}

const main = $("#display")

class ColorBlock {
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
        this.dom_code.appendChild(this.dom_g)
        this.dom_code.appendChild(this.dom_b)
        this.dom_code.appendChild(this.dom_hex)
        // ---
        // color init
        this.jin = jin(r, g, b)
        this.setColor()
    }

    setColor() {
        this.dom_color_board.style.backgroundColor = this.jin.toString()
        this.setCodeStatus()
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

    destroy() {
        main.removeChild(this.dom_wrapper)
    }
}

let colorBlocks = []

for (let tmp of [1, 2, 3, 4, 5]) {
    colorBlocks.push(new ColorBlock(255, 0, 0))
}
for (let index = 0; index < colorBlocks.length; index++) {
    colorBlocks[index].addHue(20 * index)
}

// let tmp = 1
// setInterval(function () {
//     for (let index = 0; index < colorBlocks.length; index++) {
//         colorBlocks[index].addHue(+index * tmp++ * 0.1)
//     }
// }, 100)