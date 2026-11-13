import {describe, expect, it} from "vitest"
import jin, {Color, harmony, parseHex, random} from "../src/index.js"

describe("construction", () => {
    it("parses 6-digit hex", () => {
        expect(jin("#ff00ff").rgb).toEqual({r: 255, g: 0, b: 255})
    })

    it("parses short hex", () => {
        expect(jin("#fff").rgb).toEqual({r: 255, g: 255, b: 255})
    })

    it("parses bare hex", () => {
        expect(jin("00ff00").rgb).toEqual({r: 0, g: 255, b: 0})
    })

    it("parses rgb channels", () => {
        expect(jin(0, 255, 0).rgb).toEqual({r: 0, g: 255, b: 0})
    })

    it("parses rgb() strings", () => {
        expect(jin("rgb(255, 0, 128)").rgb).toEqual({r: 255, g: 0, b: 128})
        expect(jin("rgb(100% 0% 50%)").rgb).toEqual({r: 255, g: 0, b: 128})
    })

    it("parses hsl() strings", () => {
        expect(jin("hsl(120 100% 50%)").rgb).toEqual({r: 0, g: 255, b: 0})
        expect(jin("hsl(0deg, 100%, 50%)").rgb).toEqual({r: 255, g: 0, b: 0})
    })

    it("parses oklch() strings", () => {
        const color = jin("oklch(62.8% 0.258 29)")
        expect(color.rgb.r).toBeGreaterThan(250)
        expect(color.rgb.g).toBeLessThan(6)
        expect(color.rgb.b).toBeLessThan(6)
    })

    it("parses alpha", () => {
        const color = jin("#ff000080")
        expect(color.alpha).toBeCloseTo(0.5, 1)
        expect(color.toRgbString()).toBe("rgba(255, 0, 0, 0.5)")
        expect(jin("rgba(0, 0, 0, 0.25)").hex8).toBe("#00000040")
    })

    it("parses object inputs", () => {
        expect(jin({r: 0, g: 0, b: 255}).hex).toBe("#0000ff")
        expect(jin({h: 0, s: 100, l: 50}).hex).toBe("#ff0000")
        expect(jin({h: 120, s: 100, b: 100}).hex).toBe("#00ff00")
    })

    it("clones Color instances", () => {
        const source = jin("#123456")
        const copy = jin(source)
        expect(copy).not.toBe(source)
        expect(copy.hex).toBe(source.hex)
    })

    it("rejects invalid input", () => {
        expect(() => jin("#ff000")).toThrow(/invalid hex/)
        expect(() => jin("nope")).toThrow(/invalid hex/)
        expect(() => jin()).toThrow(/incorrect color input/)
        expect(() => jin(300, 0, 0)).toThrow(/invalid red/)
        expect(() => jin("rgb(1, 2)")).toThrow(/invalid rgb/)
    })

    it("keeps parseHex backward compatible", () => {
        expect(parseHex("#fff")).toEqual({r: 255, g: 255, b: 255})
        expect(parseHex(1, 2, 3)).toEqual({r: 1, g: 2, b: 3})
    })
})

describe("formats", () => {
    it("prints hex", () => {
        expect(jin(0, 255, 0).toString()).toBe("#00ff00")
        expect(jin(0, 255, 0).hex).toBe("#00ff00")
    })

    it("prints css values", () => {
        const red = jin("#ff0000")
        expect(red.toRgbString()).toBe("rgb(255 0 0)")
        expect(red.toHslString()).toBe("hsl(0 100% 50%)")
        expect(red.toOklchString()).toMatch(/^oklch\(6[0-9.]*% 0\.2[0-9]+ 29\)$/)
        expect(red.css).toBe("rgb(255 0 0)")
    })
})

describe("hsb", () => {
    it("converts primaries", () => {
        expect(jin(255, 0, 0).hsb).toEqual({h: 0, s: 100, b: 100})
        expect(jin(0, 255, 0).hsb).toEqual({h: 120, s: 100, b: 100})
        expect(jin(0, 0, 255).hsb).toEqual({h: 240, s: 100, b: 100})
    })

    it("converts mixed colors", () => {
        expect(jin(52, 133, 255).hsb).toEqual({h: 216, s: 80, b: 100})
        expect(jin(54, 178, 92).hsb).toEqual({h: 138, s: 70, b: 70})
    })

    it("sets hue", () => {
        expect(jin(255, 0, 0).setHSB({h: 120}).rgb).toEqual({r: 0, g: 255, b: 0})
    })

    it("sets hsb directly", () => {
        expect(jin(55, 31, 116).setHSB({h: 54, s: 22, b: 87}).rgb).toEqual({r: 222, g: 217, b: 173})
    })

    it("never reports a rounded hue of 360", () => {
        const {h} = jin("#ff0001").hsb
        expect(h).toBeGreaterThanOrEqual(0)
        expect(h).toBeLessThan(360)
    })
})

describe("color spaces", () => {
    it("converts to hsl", () => {
        expect(jin("#ff0000").hsl).toEqual({h: 0, s: 100, l: 50})
        expect(jin("#808080").hsl).toEqual({h: 0, s: 0, l: 50})
    })

    it("sets hsl", () => {
        expect(jin("#000").setHSL({h: 240, s: 100, l: 50}).hex).toBe("#0000ff")
    })

    it("reports oklch", () => {
        const {l, c, h} = jin("#ff0000").oklch
        expect(l).toBeCloseTo(62.8, 0)
        expect(c).toBeCloseTo(0.258, 2)
        expect(h).toBe(29)
    })

    it("round-trips through oklch", () => {
        const source = jin("#3366cc")
        const copy = jin("#000").setOklch(source.oklch)
        expect(copy.rgb.r).toBeCloseTo(source.rgb.r, -1)
        expect(copy.rgb.g).toBeCloseTo(source.rgb.g, -1)
        expect(copy.rgb.b).toBeCloseTo(source.rgb.b, -1)
    })
})

describe("manipulation", () => {
    it("rotates hue", () => {
        const color = jin("#ff0000").rotate(120)
        expect(color.rgb.g).toBeGreaterThan(240)
        expect(color.rgb.r).toBeLessThan(15)
    })

    it("lightens and darkens perceptually", () => {
        const base = jin("#3366cc")
        const lighter = base.clone().lighten(15)
        const darker = base.clone().darken(15)
        expect(lighter.luminance).toBeGreaterThan(base.luminance)
        expect(darker.luminance).toBeLessThan(base.luminance)
    })

    it("mixes in oklab", () => {
        const mixed = jin("#ff0000").mix("#0000ff", 0.5)
        expect(mixed.rgb.r).toBeGreaterThan(80)
        expect(mixed.rgb.b).toBeGreaterThan(80)
        expect(mixed.rgb.g).toBeLessThan(120)
    })

    it("clones without mutating the source", () => {
        const source = jin("#112233")
        const copy = source.clone().lighten(20)
        expect(copy.hex).not.toBe(source.hex)
        expect(source.hex).toBe("#112233")
    })

    it("generates random colors inside the srgb gamut", () => {
        for (let i = 0; i < 20; i++) {
            const color = random()
            expect(color).toBeInstanceOf(Color)
            Object.values(color.rgb).forEach(channel => {
                expect(channel).toBeGreaterThanOrEqual(0)
                expect(channel).toBeLessThanOrEqual(255)
            })
        }
    })
})

describe("contrast", () => {
    it("computes wcag ratios", () => {
        expect(jin("#000").contrast("#fff")).toBeCloseTo(21, 0)
        expect(jin("#777").contrast("#fff")).toBeCloseTo(4.48, 1)
    })

    it("picks a readable text color", () => {
        expect(jin("#000").textColor).toBe("#ffffff")
        expect(jin("#fff").textColor).toBe("#000000")
        expect(jin("#ffd400").textColor).toBe("#000000")
    })
})

describe("harmony", () => {
    it("returns the expected number of colors", () => {
        const base = jin("#ff5470")
        expect(harmony(base, "complementary")).toHaveLength(2)
        expect(harmony(base, "analogous")).toHaveLength(3)
        expect(harmony(base, "triadic")).toHaveLength(3)
        expect(harmony(base, "split-complementary")).toHaveLength(3)
        expect(harmony(base, "tetradic")).toHaveLength(4)
        expect(harmony(base, "monochrome")).toHaveLength(5)
    })

    it("always starts with the base color", () => {
        const base = jin("#ff5470")
        expect(harmony(base, "triadic")[0].hex).toBe(base.hex)
        expect(harmony(base, "monochrome")[0].hex).toBe(base.hex)
    })

    it("does not mutate the base color", () => {
        const base = jin("#ff5470")
        harmony(base, "tetradic")
        expect(base.hex).toBe("#ff5470")
    })

    it("rejects unknown harmonies", () => {
        expect(() => harmony(jin("#fff"), "nope")).toThrow(/unknown harmony/)
    })
})
