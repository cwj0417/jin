const HEX_RE = /^#?([0-9a-f]{3,8})$/i
const FUNCTION_RE = /^(rgba?|hsla?|oklch)\((.+)\)$/i

function assert(condition, message) {
    if (!condition) throw new Error(`[jin] ${message}`)
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const round = value => Math.round(value)

function normalizeHue(hue) {
    return ((hue % 360) + 360) % 360
}

function checkRange(value, min, max, name) {
    const number = Number(value)
    assert(Number.isFinite(number) && number >= min && number <= max, `invalid ${name}: ${value}`)
    return number
}

function parseAlpha(token) {
    if (token === undefined) return 1
    const text = String(token).trim()
    const value = text.endsWith("%") ? parseFloat(text) / 100 : parseFloat(text)
    assert(Number.isFinite(value), `invalid alpha: ${token}`)
    return clamp(value, 0, 1)
}

function readHex(input) {
    const match = String(input).trim().match(HEX_RE)
    assert(match, `invalid hex color: ${input}`)
    let hex = match[1]
    assert([3, 4, 6, 8].includes(hex.length), `invalid hex color: ${input}`)
    if (hex.length === 3 || hex.length === 4) {
        hex = hex.split("").map(char => char + char).join("")
    }
    return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
    }
}

function parseRgbFunction(body) {
    const parts = body.replace(/\//g, " ").split(/[\s,]+/).filter(Boolean)
    assert(parts.length === 3 || parts.length === 4, "invalid rgb() color")
    const [r, g, b] = parts.slice(0, 3).map(token => {
        const value = parseFloat(token)
        assert(Number.isFinite(value), `invalid rgb channel: ${token}`)
        return clamp(token.trim().endsWith("%") ? value / 100 * 255 : value, 0, 255)
    })
    return {r, g, b, a: parseAlpha(parts[3])}
}

function parseHslFunction(body) {
    const parts = body.replace(/\//g, " ").split(/[\s,]+/).filter(Boolean)
    assert(parts.length === 3 || parts.length === 4, "invalid hsl() color")
    const h = parseFloat(parts[0])
    const s = parseFloat(parts[1])
    const l = parseFloat(parts[2])
    assert([h, s, l].every(Number.isFinite), "invalid hsl() color")
    const rgb = hslToRgb(normalizeHue(h), clamp(s, 0, 100), clamp(l, 0, 100))
    return {...rgb, a: parseAlpha(parts[3])}
}

function parseOklchFunction(body) {
    const parts = body.replace(/\//g, " ").split(/[\s,]+/).filter(Boolean)
    assert(parts.length === 3 || parts.length === 4, "invalid oklch() color")
    const [lToken, cToken, hToken] = parts
    let l = parseFloat(lToken)
    const c = parseFloat(cToken)
    const h = parseFloat(hToken)
    assert([l, c, h].every(Number.isFinite), "invalid oklch() color")
    if (!lToken.endsWith("%") && l <= 1) l *= 100
    const rgb = oklchToRgb(clamp(l, 0, 100), clamp(c, 0, 0.5), normalizeHue(h))
    return {...rgb, a: parseAlpha(parts[3])}
}

function rgbToHsv(r, g, b) {
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min
    const s = max === 0 ? 0 : (1 - min / max) * 100
    let h = 0
    if (diff !== 0) {
        if (max === r) h = 60 * (g - b) / diff
        else if (max === g) h = 60 * (b - r) / diff + 120
        else h = 60 * (r - g) / diff + 240
    }
    return {h: normalizeHue(h), s, b: max / 255 * 100}
}

function hsvToRgb(h, s, v) {
    const saturation = s / 100
    const brightness = v * 255 / 100
    const hi = Math.floor((h / 60) % 6)
    const f = (h / 60) - hi
    const p = brightness * (1 - saturation)
    const q = brightness * (1 - f * saturation)
    const t = brightness * (1 - (1 - f) * saturation)
    switch (hi) {
        case 0: return {r: brightness, g: t, b: p}
        case 1: return {r: q, g: brightness, b: p}
        case 2: return {r: p, g: brightness, b: t}
        case 3: return {r: p, g: q, b: brightness}
        case 4: return {r: t, g: p, b: brightness}
        default: return {r: brightness, g: p, b: q}
    }
}

function rgbToHsl(r, g, b) {
    const red = r / 255
    const green = g / 255
    const blue = b / 255
    const max = Math.max(red, green, blue)
    const min = Math.min(red, green, blue)
    const l = (max + min) / 2
    let h = 0
    let s = 0
    if (max !== min) {
        const diff = max - min
        s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)
        if (max === red) h = (green - blue) / diff + (green < blue ? 6 : 0)
        else if (max === green) h = (blue - red) / diff + 2
        else h = (red - green) / diff + 4
        h *= 60
    }
    return {h: normalizeHue(h), s: s * 100, l: l * 100}
}

function hslToRgb(h, s, l) {
    const saturation = s / 100
    const lightness = l / 100
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
    const x = chroma * (1 - Math.abs((h / 60) % 2 - 1))
    const m = lightness - chroma / 2
    let rgb
    if (h < 60) rgb = [chroma, x, 0]
    else if (h < 120) rgb = [x, chroma, 0]
    else if (h < 180) rgb = [0, chroma, x]
    else if (h < 240) rgb = [0, x, chroma]
    else if (h < 300) rgb = [x, 0, chroma]
    else rgb = [chroma, 0, x]
    return {
        r: (rgb[0] + m) * 255,
        g: (rgb[1] + m) * 255,
        b: (rgb[2] + m) * 255,
    }
}

function srgbToLinear(channel) {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function linearToSrgbRaw(channel) {
    const value = channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055
    return value * 255
}

function rgbToOklab(r, g, b) {
    const red = srgbToLinear(r)
    const green = srgbToLinear(g)
    const blue = srgbToLinear(b)
    const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue)
    const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue)
    const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue)
    return {
        L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
        a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
        b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
    }
}

function oklabToRgb({L, a, b}) {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
    return {
        r: linearToSrgbRaw(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
        g: linearToSrgbRaw(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
        b: linearToSrgbRaw(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
    }
}

function rgbToOklch(r, g, b) {
    const {L, a, b: labB} = rgbToOklab(r, g, b)
    const c = Math.sqrt(a * a + labB * labB)
    const h = c < 0.0001 ? 0 : normalizeHue(Math.atan2(labB, a) * 180 / Math.PI)
    return {l: L * 100, c, h}
}

function isInGamut({r, g, b}) {
    return [r, g, b].every(channel => channel >= -0.01 && channel <= 255.01)
}

function clampRgb({r, g, b}) {
    return {
        r: clamp(r, 0, 255),
        g: clamp(g, 0, 255),
        b: clamp(b, 0, 255),
    }
}

function oklchToRgb(l, c, h) {
    const convert = chroma => {
        const radians = h * Math.PI / 180
        return oklabToRgb({
            L: l / 100,
            a: chroma * Math.cos(radians),
            b: chroma * Math.sin(radians),
        })
    }
    let rgb = convert(c)
    if (isInGamut(rgb)) return clampRgb(rgb)
    // Reduce chroma until the color fits in sRGB, keeping lightness and hue.
    let low = 0
    let high = c
    for (let step = 0; step < 18; step++) {
        const mid = (low + high) / 2
        if (isInGamut(convert(mid))) low = mid
        else high = mid
    }
    rgb = convert(low)
    return clampRgb(rgb)
}

function toRgba(input) {
    if (input instanceof Color) {
        return {r: input._rgb.r, g: input._rgb.g, b: input._rgb.b, a: input.alpha}
    }
    if (typeof input === "string") {
        const text = input.trim()
        const fnMatch = text.match(FUNCTION_RE)
        if (fnMatch) {
            const name = fnMatch[1].toLowerCase()
            if (name === "oklch") return parseOklchFunction(fnMatch[2])
            return name.startsWith("rgb") ? parseRgbFunction(fnMatch[2]) : parseHslFunction(fnMatch[2])
        }
        return readHex(text)
    }
    if (input && typeof input === "object") {
        if ("r" in input && "g" in input && "b" in input) {
            return {
                r: checkRange(input.r, 0, 255, "red"),
                g: checkRange(input.g, 0, 255, "green"),
                b: checkRange(input.b, 0, 255, "blue"),
                a: input.a === undefined ? 1 : clamp(+input.a, 0, 1),
            }
        }
        if ("h" in input) {
            const h = checkRange(input.h, 0, 360, "hue")
            const s = checkRange(input.s, 0, 100, "saturation")
            if ("l" in input) {
                return {...hslToRgb(normalizeHue(h), s, checkRange(input.l, 0, 100, "lightness")), a: 1}
            }
            if ("b" in input) {
                return {...hsvToRgb(normalizeHue(h), s, checkRange(input.b, 0, 100, "brightness")), a: 1}
            }
        }
    }
    assert(false, `invalid color: ${String(input)}`)
}

const HARMONY_OFFSETS = {
    complementary: [0, 180],
    analogous: [0, -30, 30],
    triadic: [0, 120, 240],
    "split-complementary": [0, 150, 210],
    tetradic: [0, 90, 180, 270],
    monochrome: null,
}

export class Color {
    constructor({r, g, b, a = 1}) {
        this._rgb = {
            r: checkRange(r, 0, 255, "red"),
            g: checkRange(g, 0, 255, "green"),
            b: checkRange(b, 0, 255, "blue"),
        }
        this.alpha = clamp(Number(a), 0, 1)
    }

    set rgb(rgb) {
        this.setRGB(rgb)
    }

    set hsb(hsb) {
        this.setHSB(hsb)
    }

    set hsl(hsl) {
        this.setHSL(hsl)
    }

    set oklch(oklch) {
        this.setOklch(oklch)
    }

    get rgb() {
        return {
            r: round(this._rgb.r),
            g: round(this._rgb.g),
            b: round(this._rgb.b),
        }
    }

    get hsb() {
        const {h, s, b} = rgbToHsv(this._rgb.r, this._rgb.g, this._rgb.b)
        return {h: round(h) % 360, s: round(s), b: round(b)}
    }

    get hsl() {
        const {h, s, l} = rgbToHsl(this._rgb.r, this._rgb.g, this._rgb.b)
        return {h: round(h) % 360, s: round(s), l: round(l)}
    }

    get oklch() {
        const {l, c, h} = rgbToOklch(this._rgb.r, this._rgb.g, this._rgb.b)
        return {
            l: Math.round(l * 10) / 10,
            c: Math.round(c * 1000) / 1000,
            h: round(h) % 360,
        }
    }

    get hex() {
        return this.toString()
    }

    get hex8() {
        return `${this.toString()}${Math.round(this.alpha * 255).toString(16).padStart(2, "0")}`
    }

    get css() {
        return this.toRgbString()
    }

    get luminance() {
        return 0.2126 * srgbToLinear(this._rgb.r)
            + 0.7152 * srgbToLinear(this._rgb.g)
            + 0.0722 * srgbToLinear(this._rgb.b)
    }

    get textColor() {
        return this.contrast("#000000") >= this.contrast("#ffffff") ? "#000000" : "#ffffff"
    }

    setRGB({r = this._rgb.r, g = this._rgb.g, b = this._rgb.b} = {}) {
        this._rgb = {
            r: checkRange(r, 0, 255, "red"),
            g: checkRange(g, 0, 255, "green"),
            b: checkRange(b, 0, 255, "blue"),
        }
        return this
    }

    setHSB({h = this.hsb.h, s = this.hsb.s, b = this.hsb.b} = {}) {
        const hue = checkRange(h, 0, 359, "hue")
        const saturation = checkRange(s, 0, 100, "saturation")
        const brightness = checkRange(b, 0, 100, "brightness")
        this._rgb = hsvToRgb(hue, saturation, brightness)
        return this
    }

    setHSL({h = this.hsl.h, s = this.hsl.s, l = this.hsl.l} = {}) {
        const hue = checkRange(h, 0, 360, "hue")
        const saturation = checkRange(s, 0, 100, "saturation")
        const lightness = checkRange(l, 0, 100, "lightness")
        this._rgb = hslToRgb(normalizeHue(hue), saturation, lightness)
        return this
    }

    setOklch({l = this.oklch.l, c = this.oklch.c, h = this.oklch.h} = {}) {
        const lightness = checkRange(l, 0, 100, "lightness")
        const chroma = checkRange(c, 0, 0.5, "chroma")
        this._rgb = oklchToRgb(lightness, chroma, normalizeHue(checkRange(h, 0, 360, "hue")))
        return this
    }

    rotate(degrees = 180) {
        const {h, s, b} = this.hsb
        return this.setHSB({h: normalizeHue(h + Number(degrees)), s, b})
    }

    lighten(amount = 10) {
        const {l, c, h} = this.oklch
        const lightness = clamp(l + Number(amount), 0, 100)
        const edge = Math.min(1, Math.min(lightness, 100 - lightness) / 12)
        return this.setOklch({l: lightness, c: c * edge, h})
    }

    darken(amount = 10) {
        return this.lighten(-Number(amount))
    }

    mix(color, weight = 0.5) {
        const other = color instanceof Color ? color : jin(color)
        const ratio = clamp(Number(weight), 0, 1)
        const from = rgbToOklab(this._rgb.r, this._rgb.g, this._rgb.b)
        const to = rgbToOklab(other._rgb.r, other._rgb.g, other._rgb.b)
        this._rgb = oklabToRgb({
            L: from.L + (to.L - from.L) * ratio,
            a: from.a + (to.a - from.a) * ratio,
            b: from.b + (to.b - from.b) * ratio,
        })
        this.alpha += (other.alpha - this.alpha) * ratio
        return this
    }

    contrast(color) {
        const other = color instanceof Color ? color : jin(color)
        const first = this.luminance
        const second = other.luminance
        return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
    }

    harmony(type = "analogous") {
        return harmony(this, type)
    }

    clone() {
        return new Color({...this._rgb, a: this.alpha})
    }

    toString() {
        const {r, g, b} = this.rgb
        return `#${[r, g, b].map(channel => channel.toString(16).padStart(2, "0")).join("")}`
    }

    toRgbString() {
        const {r, g, b} = this.rgb
        if (this.alpha >= 1) return `rgb(${r} ${g} ${b})`
        return `rgba(${r}, ${g}, ${b}, ${Math.round(this.alpha * 100) / 100})`
    }

    toHslString() {
        const {h, s, l} = this.hsl
        if (this.alpha >= 1) return `hsl(${h} ${s}% ${l}%)`
        return `hsl(${h} ${s}% ${l}% / ${Math.round(this.alpha * 100) / 100})`
    }

    toOklchString() {
        const {l, c, h} = this.oklch
        if (this.alpha >= 1) return `oklch(${l}% ${c} ${h})`
        return `oklch(${l}% ${c} ${h} / ${Math.round(this.alpha * 100) / 100})`
    }
}

export function parseHex(...args) {
    assert(args.length === 1 || args.length === 3, "incorrect color string")
    if (args.length === 3) {
        const [r, g, b] = args
        return {
            r: checkRange(r, 0, 255, "red"),
            g: checkRange(g, 0, 255, "green"),
            b: checkRange(b, 0, 255, "blue"),
        }
    }
    const {r, g, b} = readHex(args[0])
    return {r, g, b}
}

export function harmony(color, type = "analogous") {
    assert(type in HARMONY_OFFSETS, `unknown harmony: ${type}`)
    const base = color instanceof Color ? color.clone() : jin(color)
    if (type === "monochrome") {
        return [0, 16, 32, -16, -32].map(offset => {
            const {l, c, h} = base.oklch
            const lightness = clamp(l + offset, 6, 94)
            const edge = Math.min(1, Math.min(lightness, 100 - lightness) / 12)
            return base.clone().setOklch({l: lightness, c: c * edge, h})
        })
    }
    return HARMONY_OFFSETS[type].map(offset => offset === 0 ? base.clone() : base.clone().rotate(offset))
}

export function random() {
    return new Color(hsvToRgb(Math.random() * 360, 58 + Math.random() * 32, 62 + Math.random() * 33))
}

export default function jin(...params) {
    if (params.length === 3 || params.length === 4) {
        const [r, g, b, a] = params
        return new Color({r, g, b, a})
    }
    assert(params.length === 1, "incorrect color input")
    const [input] = params
    return new Color(toRgba(input))
}
