# jinjin

A tiny, dependency-free color engine for the modern web. Parse colors, convert between RGB / HSV / HSL / OKLCH, edit perceptually, build harmonies, and check WCAG contrast.

- **Zero runtime dependencies** — one small ESM/UMD bundle
- **Modern color spaces** — OKLCH and OKLab alongside RGB / HSV / HSL
- **Perceptual edits** — `lighten`, `darken` and `mix` stay clean instead of turning muddy
- **Accessible by default** — WCAG contrast ratios and a readable text color
- **Harmonies** — six schemes, base-first and gamut-mapped back to sRGB
- **Typed** — TypeScript declarations included

## Install

```bash
npm i jinjin
```

```js
import jin, {harmony, random} from "jinjin"
```

UMD builds are available too:

```html
<script src="https://unpkg.com/jinjin/dist/jin.umd.cjs"></script>
<script>
  const color = jin("#ff5470")
</script>
```

## Quick start

```js
import jin, {harmony} from "jinjin"

const base = jin("#ff5470")

base.rgb                          // {r: 255, g: 84, b: 112}
base.hsl                          // {h: 350, s: 100, l: 66}
base.oklch                        // {l: 68.6, c: 0.206, h: 15}
base.hex                          // "#ff5470"
base.textColor                    // "#000000"

base.clone().lighten(12).hex      // "#ffa1a8"
base.clone().rotate(120).hex      // "#71ff54"
base.contrast("#ffffff")          // 3.11

harmony(base, "triadic").map(c => c.hex)
// ["#ff5470", "#71ff54", "#5471ff"]
```

Methods mutate and return the same `Color` instance, so calls chain. Use `clone()` whenever the original should stay untouched.

## Inputs

`jin()` accepts:

| Input | Example |
| --- | --- |
| hex (3, 4, 6 or 8 digits) | `jin("#ff5470")`, `jin("#ff547080")` |
| `rgb()` / `rgba()` | `jin("rgb(255 84 112)")`, `jin("rgba(255 84 112 / 0.5)")` |
| `hsl()` / `hsla()` | `jin("hsl(350 100% 66%)")` |
| `oklch()` | `jin("oklch(68.6% 0.206 15)")` |
| RGB channels | `jin(255, 84, 112)`, `jin(255, 84, 112, 0.5)` |
| Objects | `jin({r: 255, g: 84, b: 112})`, `jin({h: 350, s: 100, l: 66})`, `jin({h: 350, s: 100, b: 100})` |
| Another `Color` | `jin(base)` (returns a clone) |

## Color

### Properties

| Property | Description |
| --- | --- |
| `rgb` | `{r, g, b}` channels (0–255) |
| `hsb` | `{h, s, b}` — HSV with percentage saturation/brightness |
| `hsl` | `{h, s, l}` |
| `oklch` | `{l, c, h}` — perceptual lightness 0–100, chroma, hue |
| `alpha` | Alpha, 0–1 |
| `hex` / `hex8` | `#rrggbb` / `#rrggbbaa` |
| `css` | The same value as `toRgbString()` |
| `luminance` | Relative WCAG luminance |
| `textColor` | `#000000` or `#ffffff`, whichever has more contrast |

### Methods

| Method | Description |
| --- | --- |
| `setRGB(rgb)` | Set channels; accepts a partial object |
| `setHSB(hsb)` | Set HSV; accepts a partial object |
| `setHSL(hsl)` | Set HSL; accepts a partial object |
| `setOklch(oklch)` | Set OKLCH; accepts a partial object, gamut-mapped |
| `rotate(degrees)` | Rotate the HSV hue |
| `lighten(amount)` / `darken(amount)` | Change OKLCH lightness by percentage points |
| `mix(color, weight)` | Blend in OKLab (`weight` = amount of the other color) |
| `contrast(color)` | WCAG contrast ratio against any color input |
| `harmony(type)` | Generate a harmony from this color |
| `clone()` | Copy the color |
| `toString()` / `toRgbString()` / `toHslString()` / `toOklchString()` | Formatted output |

## Harmonies

```js
import {harmony} from "jinjin"

harmony("#ff5470", "analogous")          // 3 colors
harmony("#ff5470", "complementary")      // 2 colors
harmony("#ff5470", "triadic")            // 3 colors
harmony("#ff5470", "split-complementary")// 3 colors
harmony("#ff5470", "tetradic")           // 4 colors
harmony("#ff5470", "monochrome")         // 5 colors
```

Every scheme starts with the base color. Extra-tight colors are gamut-mapped into sRGB by reducing chroma while keeping lightness and hue.

## Other exports

```js
import {parseHex, random} from "jinjin"

parseHex("#ff5470")        // {r: 255, g: 84, b: 112}
parseHex(255, 84, 112)     // {r: 255, g: 84, b: 112}
random().hex               // a vivid random color
```

`parseHex` is kept for backward compatibility with earlier versions.

## Development

```bash
npm install
npm run dev      # palette studio demo at http://localhost:5173
npm test         # Vitest
npm run build    # ESM + UMD bundles in dist/
```

The demo lives in `index.html` + `demo/` and imports the library source directly.

## License

MIT
