export interface RGB {
    r: number
    g: number
    b: number
}

export interface HSB {
    h: number
    s: number
    b: number
}

export interface HSL {
    h: number
    s: number
    l: number
}

export interface OKLCH {
    l: number
    c: number
    h: number
}

export type ColorInput = string | Color | (RGB & {a?: number}) | HSL | HSB

export type HarmonyType =
    | "complementary"
    | "analogous"
    | "triadic"
    | "split-complementary"
    | "tetradic"
    | "monochrome"

export declare class Color {
    constructor(rgb: RGB & {a?: number})

    alpha: number
    rgb: RGB
    hsb: HSB
    hsl: HSL
    oklch: OKLCH

    readonly hex: string
    readonly hex8: string
    readonly css: string
    readonly luminance: number
    readonly textColor: string

    setRGB(rgb?: Partial<RGB>): this
    setHSB(hsb?: Partial<HSB>): this
    setHSL(hsl?: Partial<HSL>): this
    setOklch(oklch?: Partial<OKLCH>): this

    rotate(degrees?: number): this
    lighten(amount?: number): this
    darken(amount?: number): this
    mix(color: ColorInput, weight?: number): this
    clone(): Color

    contrast(color: ColorInput): number
    harmony(type?: HarmonyType): Color[]

    toString(): string
    toRgbString(): string
    toHslString(): string
    toOklchString(): string
}

export declare function parseHex(hex: string): RGB
export declare function parseHex(r: number, g: number, b: number): RGB

export declare function harmony(color: ColorInput, type?: HarmonyType): Color[]

export declare function random(): Color

declare function jin(color: ColorInput): Color
declare function jin(r: number, g: number, b: number, a?: number): Color

export default jin
