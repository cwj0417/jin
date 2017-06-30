import {$, $o} from "./util"

import ColorBlocks from "./color-blocks"

import config from "./scheme"

import {parseHex} from "../src/index.js"

const blocks = new ColorBlocks()

const formatOption = function (option, length) {
    let result = Array.from({length}).map(_ => 0)
    if (!isNaN(+option) || option.split(" ").reduce((l, f) => l && !isNaN(f), true)) {
        if (!isNaN(+option)) {
            result = result.map(_ => option)
        } else {
            result = option.split(" ")
            let padding = function (result, length) {
                return result.length >= length ? result : padding(result.concat(result), length)
            }
            result = padding(result, length)
        }
    }
    return result.map(_ => +_)
}

const changeOptions = function () {
    let count = $("#count").value
    let h = $("#hue").value
    let s = $("#saturation").value
    let b = $("#brightness").value
    blocks.amendLength(count)
    blocks.setOptions({
        h: formatOption(h, count),
        s: formatOption(s, count),
        b: formatOption(b, count)
    })
    blocks.render()
    if (blocks.blocks.length) {
        blocks.blocks[0].enableEdit()
        blocks.blocks[0].addHook(blocks.render.bind(blocks))
    }
    if (blocks.blocks.length > 1) {
        setTimeout(function () {
            document.body.style.background = `-webkit-linear-gradient(right,${blocks.blocks.map(_=>_.jin.toString()).join(",")})`
            document.body.style.background = `linear-gradient(right,${blocks.blocks.map(_=>_.jin.toString()).join(",")})`
        })
    }
}

$("#count").addEventListener("change", changeOptions)
$("#hue").addEventListener("change", changeOptions)
$("#saturation").addEventListener("change", changeOptions)
$("#brightness").addEventListener("change", changeOptions)

$("#scheme").appendChild($o("###", "select an scheme"))
for (let scheme of config) {
    $("#scheme").appendChild($o(scheme.name, scheme.name))
}
let isSchemeSelected = false
$("#scheme").addEventListener("change", function () {
    if (!isSchemeSelected) {
        isSchemeSelected = true
        $("#scheme").removeChild($("#scheme").firstElementChild)
    }
    let matched = config.filter(_ => _.name == this.value)
    if (matched) {
        let s = matched[0]
        $("#count").value = s.c
        $("#hue").value = s.h
        $("#saturation").value = s.s
        $("#brightness").value = s.b
        changeOptions()
        if (blocks.blocks.length) {
            blocks.blocks[0].jin.setRGB(parseHex(s.base))
            blocks.blocks[0].setColor()
        }
    }
})

document.title = "Jin - a professional color scheme generator"