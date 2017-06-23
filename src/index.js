function assert (condition, msg) {
    if (!condition) throw new Error(`[jin] ${msg}`)
}
class Color {
    constructor ({r, g, b}) {
        this.rgb = {r, g, b}
        this.hsb = this.getHSB(r, g, b)
    }
    getHSB (r, g, bl) {
        let max = Math.max(r, g, bl)
        let min = Math.min(r, g, bl)
        let diff = max - min
        let b = Math.round(max / 255 * 100)
        let s = max === 0 ? 0 : (1 - min / max) * 100
        let h
        switch (max) {
            case min :
                h = null
                break
            case r :
                h = g >= bl ? 60 * (g - bl) / diff : 60 * (g - bl) / diff + 360
                break
            case g :
                h = 60 * (bl - r) / diff + 120
                break
            case bl :
                h = 60 * (r - g) / diff + 240
                break
        }
        return {h, s, b}
    }
}
function parseHex (r, g, b) {
    assert(arguments.length === 1 || arguments.length === 3, "incorrect color string")
    if (arguments.length === 3) {
        return {r, g, b}
    } else {
        (r[0] === "#") && (r = r.slice(1))
        assert(r.length === 3 || r.length === 6)
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