function assert(condition, msg) {
    if (!condition) throw new Error(`[jin] ${msg}`)
}
function checkRGB (...args) {
    args.forEach(each => checkRange(each, 0, 255, "rgb"))
}
function checkRange (target, min, max, msg) {
    assert(+target < max + 1 && +target > min - 1, `invalid ${msg}: ${target}`)
}
class Color {
    constructor({r, g, b}) {
        checkRGB(r, g, b)
        this.rgb = {r, g, b}
        this.hsb = this.getHSB(r, g, b)
    }

    set rgb(rgb) {
        this._rgb = rgb
    }

    set hsb(hsb) {
        this._hsb = hsb
    }

    get rgb() {
        return {
            r: Math.round(this._rgb.r),
            g: Math.round(this._rgb.g),
            b: Math.round(this._rgb.b),
        }
    }

    get hsb() {
        return {
            h: Math.round(this._hsb.h),
            s: Math.round(this._hsb.s),
            b: Math.round(this._hsb.b),
        }
    }

    getHSB(r, g, bl) {
        r = +r
        g = +g
        bl = +bl
        let max = Math.max(r, g, bl)
        let min = Math.min(r, g, bl)
        let diff = max - min
        let b = max / 255 * 100
        let s = max === 0 ? 0 : (1 - min / max) * 100
        let h
        switch (max) {
            case min:
                h = 0
                break
            case r:
                h = g >= bl ? 60 * (g - bl) / diff : 60 * (g - bl) / diff + 360
                break
            case g:
                h = 60 * (bl - r) / diff + 120
                break
            case bl:
                h = 60 * (r - g) / diff + 240
                break
        }
        return {h, s, b}
    }

    getRGB(h, s, br) {
        h = +h
        s = +s
        br = +br
        s = s / 100
        br = br * 255 / 100
        let hi = Math.floor((h / 60) % 6)
        let f = (h / 60) - hi
        let p = br * (1 - s)
        let q = br * (1 - f * s)
        let t = br * (1 - (1 - f) * s)
        let r, g, b
        switch (hi) {
            case 0:
                [r, g, b] = [br, t, p]
                break
            case 1:
                [r, g, b] = [q, br, p]
                break
            case 2:
                [r, g, b] = [p, br, t]
                break
            case 3:
                [r, g, b] = [p, q, br]
                break
            case 4:
                [r, g, b] = [t, p, br]
                break
            case 5:
                [r, g, b] = [br, p, q]
                break
        }
        return {r, g, b}
    }

    setHSB ({h = this.hsb.h, s = this.hsb.s, b = this.hsb.b} = {}) {
        checkRange(h, 0, 359, "hue")
        checkRange(s, 0, 100, "saturation")
        checkRange(b, 0, 100, "brightness")
        this.hsb = {h, s, b}
        this.rgb = this.getRGB(h, s, b)
        return this
    }

    setRGB ({r = this.rgb.r, g = this.rgb.g, b = this.rgb.b} = {}) {
        checkRGB(r, g, b)
        this.rgb = {r, g, b}
        this.hsb = this.getHSB(r, g, b)
        return this
    }

    toString () {
        return `#${padDigit(this.rgb.r.toString(16))}${padDigit(this.rgb.g.toString(16))}${padDigit(this.rgb.b.toString(16))}`
    }
}
function padDigit (origin) {
    return origin.length === 1 ? "0" + origin : origin
}
export function parseHex(r, g, b) {
    assert(arguments.length === 1 || arguments.length === 3, "incorrect color string")
    if (arguments.length === 3) {
        return {r, g, b}
    } else {
        (r[0] === "#") && (r = r.slice(1))
        assert((/^[0-9a-f]{3}$/).test(r) || (/^[0-9a-f]{6}$/).test(r), "incorrect color string")
        if (r.length === 3) {
            r = `${r[0]}${r[0]}${r[1]}${r[1]}${r[2]}${r[2]}`
        }
        r = [`${r[0]}${r[1]}`, `${r[2]}${r[3]}`, `${r[4]}${r[5]}`]
        let [red, g, b] = r.map(hex => parseInt(hex, 16))
        return {r: red, g, b}
    }
}
export default function (...params) {
    return new Color(parseHex(...params))
}