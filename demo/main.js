import jin, {harmony, random} from "/src/index.js"

const HARMONIES = [
    {id: "analogous", label: "Analogous"},
    {id: "complementary", label: "Complement"},
    {id: "triadic", label: "Triadic"},
    {id: "split-complementary", label: "Split"},
    {id: "tetradic", label: "Tetradic"},
    {id: "monochrome", label: "Mono"},
]

const ICONS = {
    unlock: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    copy: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
}

const EXAMPLE = `import jin, { harmony } from "jinjin"

const base = jin("#ff5470")

harmony(base, "triadic").map(c => c.hex)
// ["#ff5470", "#71ff54", "#5471ff"]

base.clone().lighten(12).hex
// "#ffa1a8"

base.contrast("#0d0d12").toFixed(1)
// "6.2"

jin("oklch(65% 0.2 12)").hex
// "#ef4a6e"`

const state = {
    base: "#ff5470",
    harmony: "analogous",
    count: 5,
    locked: new Map(),
}

let exportFormat = "css"
let currentColors = []
let scheduledFrame = 0
let toastTimer = 0

const el = (tag, className, text) => {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (text !== undefined) node.textContent = text
    return node
}

const $ = selector => document.querySelector(selector)

const els = {
    palette: $("#palette"),
    harmony: $("#harmony"),
    count: $("#count"),
    countValue: $("#countValue"),
    baseColor: $("#baseColor"),
    baseHex: $("#baseHex"),
    colorWell: $("#colorWell"),
    shuffle: $("#shuffle"),
    exportCode: $("#exportCode"),
    copyExport: $("#copyExport"),
    copyInstall: $("#copyInstall"),
    copyExample: $("#copyExample"),
    exampleCode: $("#exampleCode"),
    toast: $("#toast"),
    status: $("#status"),
}

function buildHarmonyButtons() {
    for (const {id, label} of HARMONIES) {
        const button = el("button", "segmented__item", label)
        button.type = "button"
        button.dataset.harmony = id
        button.setAttribute("aria-pressed", String(id === state.harmony))
        button.addEventListener("click", () => {
            if (state.harmony === id) return
            state.harmony = id
            syncHarmony()
            render()
        })
        els.harmony.append(button)
    }
}

function accessibleAccent(color) {
    const accent = color.clone()
    let guard = 0
    while (accent.contrast("#0d0d12") < 3 && guard < 24) {
        accent.lighten(5)
        guard++
    }
    return accent
}

function buildPalette() {
    const base = jin(state.base)
    const harmonic = harmony(base, state.harmony)
    const colors = []
    for (let index = 0; index < state.count; index++) {
        if (state.locked.has(index)) {
            colors.push(jin(state.locked.get(index)))
            continue
        }
        const cycle = Math.floor(index / harmonic.length)
        const color = harmonic[index % harmonic.length].clone()
        if (cycle > 0) {
            const shift = Math.ceil(cycle / 2) * 16
            color.lighten(cycle % 2 === 1 ? shift : -shift)
        }
        colors.push(color)
    }
    return colors
}

function createCard(color, index, animate) {
    const locked = state.locked.has(index)
    const card = el("article", `swatch${locked ? " is-locked" : ""}`)
    card.setAttribute("role", "listitem")
    card.dataset.index = String(index)
    card.style.setProperty("--bg", color.hex)
    card.style.setProperty("--fg", color.textColor)
    card.style.setProperty("--i", String(index))
    if (!animate) card.style.animation = "none"

    const top = el("div", "swatch__top")
    top.append(el("span", "swatch__index", String(index + 1).padStart(2, "0")))
    const lockButton = el("button", "swatch__lock")
    lockButton.type = "button"
    lockButton.setAttribute("aria-pressed", String(locked))
    lockButton.setAttribute("aria-label", `${locked ? "Unlock" : "Lock"} color ${index + 1}`)
    lockButton.title = locked ? "Unlock color" : "Lock color"
    lockButton.innerHTML = locked ? ICONS.lock : ICONS.unlock
    lockButton.addEventListener("click", () => {
        if (state.locked.has(index)) state.locked.delete(index)
        else state.locked.set(index, color.hex)
        render({animate: false})
        const nextLock = els.palette.querySelector(`.swatch[data-index="${index}"] .swatch__lock`)
        nextLock?.focus()
    })
    top.append(lockButton)

    const body = el("div", "swatch__body")
    body.append(el("span", "swatch__role", index === 0 ? "Base" : `Tone ${String(index + 1).padStart(2, "0")}`))
    body.append(el("strong", "swatch__hex", color.hex.toUpperCase()))
    const compactChroma = color.oklch.c.toFixed(3).replace(/^0/, "")
    body.append(el("span", "swatch__oklch", `oklch(${color.oklch.l}% ${compactChroma} ${color.oklch.h})`))

    const foot = el("div", "swatch__foot")
    const ratio = color.contrast(color.textColor)
    const level = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "—"
    const badge = el("span", "swatch__badge", `${level} ${ratio.toFixed(1)}`)
    badge.title = `${ratio.toFixed(2)}:1 contrast for ${color.textColor === "#000000" ? "black" : "white"} text`
    const copyButton = el("button", "swatch__copy")
    copyButton.type = "button"
    copyButton.setAttribute("aria-label", `Copy ${color.hex}`)
    copyButton.title = "Copy hex"
    copyButton.innerHTML = ICONS.copy
    copyButton.addEventListener("click", () => copy(color.hex, `Copied ${color.hex.toUpperCase()}`))
    foot.append(badge, copyButton)

    card.append(top, body, foot)

    card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect()
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`)
        card.style.setProperty("--my", `${event.clientY - rect.top}px`)
    })

    return card
}

function render({animate = true} = {}) {
    currentColors = buildPalette()

    const fragment = document.createDocumentFragment()
    currentColors.forEach((color, index) => fragment.append(createCard(color, index, animate)))
    els.palette.replaceChildren(fragment)
    els.palette.style.setProperty("--count", String(state.count))

    const accent = accessibleAccent(jin(state.base))
    const root = document.documentElement
    root.style.setProperty("--accent", state.base)
    root.style.setProperty("--accent-ui", accent.hex)
    root.style.setProperty("--accent-fg", accent.textColor)
    currentColors.slice(0, 3).forEach((color, index) => {
        root.style.setProperty(`--glow-${index + 1}`, color.hex)
    })

    syncControls()
    renderExport()
    els.status.textContent = `Generated ${state.count} ${harmonyLabel(state.harmony)} colors from ${state.base}.`
}

function harmonyLabel(id) {
    return HARMONIES.find(item => item.id === id)?.label ?? id
}

function syncHarmony() {
    els.harmony.querySelectorAll("[data-harmony]").forEach(button => {
        const active = button.dataset.harmony === state.harmony
        button.classList.toggle("is-active", active)
        button.setAttribute("aria-pressed", String(active))
    })
}

function syncControls() {
    els.baseColor.value = state.base
    els.baseHex.value = state.base.toUpperCase()
    els.colorWell.style.setProperty("--well", state.base)
    els.count.value = String(state.count)
    els.countValue.textContent = String(state.count)
    const min = Number(els.count.min)
    const max = Number(els.count.max)
    els.count.style.setProperty("--fill", `${(state.count - min) / (max - min) * 100}%`)
    syncHarmony()
}

function renderExport() {
    els.exportCode.textContent = exportText()
}

function exportText() {
    const label = harmonyLabel(state.harmony)
    if (exportFormat === "css") {
        const lines = currentColors.map((color, index) =>
            `  --color-${index + 1}: ${color.hex}; /* ${color.toOklchString()} */`)
        return `/* jin · ${label.toLowerCase()} · base ${currentColors[0].hex} */\n:root {\n${lines.join("\n")}\n}`
    }
    if (exportFormat === "tailwind") {
        const lines = currentColors.map((color, index) => `  --color-jin-${index + 1}: ${color.hex};`)
        return `@import "tailwindcss";\n\n@theme {\n${lines.join("\n")}\n}`
    }
    return JSON.stringify({
        harmony: state.harmony,
        base: currentColors[0].hex,
        colors: currentColors.map(color => ({
            hex: color.hex,
            oklch: color.toOklchString(),
        })),
    }, null, 2)
}

async function copy(text, message) {
    try {
        await navigator.clipboard.writeText(text)
    } catch {
        const area = el("textarea")
        area.value = text
        area.setAttribute("readonly", "")
        area.style.position = "fixed"
        area.style.opacity = "0"
        document.body.append(area)
        area.select()
        document.execCommand("copy")
        area.remove()
    }
    toast(message)
}

function toast(message) {
    els.toast.textContent = message
    els.toast.classList.add("is-visible")
    clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => els.toast.classList.remove("is-visible"), 1800)
}

function shuffle() {
    state.base = random().hex
    render()
    els.shuffle.classList.remove("is-shuffling")
    void els.shuffle.offsetWidth
    els.shuffle.classList.add("is-shuffling")
    window.setTimeout(() => els.shuffle.classList.remove("is-shuffling"), 420)
}

function scheduleRender() {
    if (scheduledFrame) cancelAnimationFrame(scheduledFrame)
    scheduledFrame = requestAnimationFrame(() => {
        scheduledFrame = 0
        render()
    })
}

els.baseColor.addEventListener("input", event => {
    state.base = event.target.value
    els.baseHex.value = state.base.toUpperCase()
    els.colorWell.style.setProperty("--well", state.base)
    els.baseHex.removeAttribute("aria-invalid")
    scheduleRender()
})

els.baseHex.addEventListener("change", () => {
    try {
        state.base = jin(els.baseHex.value).hex
        els.baseHex.removeAttribute("aria-invalid")
        render()
    } catch {
        els.baseHex.setAttribute("aria-invalid", "true")
        els.baseHex.value = state.base.toUpperCase()
    }
})

els.baseHex.addEventListener("keydown", event => {
    if (event.key === "Enter") els.baseHex.blur()
})

els.baseHex.addEventListener("focus", () => els.baseHex.select())

els.count.addEventListener("input", () => {
    state.count = Number(els.count.value)
    for (const index of [...state.locked.keys()]) {
        if (index >= state.count) state.locked.delete(index)
    }
    els.countValue.textContent = String(state.count)
    const min = Number(els.count.min)
    const max = Number(els.count.max)
    els.count.style.setProperty("--fill", `${(state.count - min) / (max - min) * 100}%`)
    scheduleRender()
})

els.shuffle.addEventListener("click", shuffle)

document.querySelectorAll(".export-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        exportFormat = tab.dataset.format
        document.querySelectorAll(".export-tab").forEach(item => {
            const active = item === tab
            item.classList.toggle("is-active", active)
            item.setAttribute("aria-pressed", String(active))
        })
        renderExport()
    })
})

els.copyExport.addEventListener("click", () => {
    copy(exportText(), `Copied ${exportFormat === "tailwind" ? "Tailwind theme" : exportFormat.toUpperCase()}`)
})

els.copyInstall.addEventListener("click", () => copy("npm i jinjin", "Copied install command"))

els.copyExample.addEventListener("click", () => copy(EXAMPLE, "Copied example"))

document.addEventListener("keydown", event => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const target = event.target
    const isTyping = target instanceof HTMLElement
        && (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable)
    if (isTyping) return
    if (event.key.toLowerCase() === "r") {
        event.preventDefault()
        shuffle()
    }
})

els.exampleCode.textContent = EXAMPLE
buildHarmonyButtons()
render()
