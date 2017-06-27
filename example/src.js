import {$} from "./util"

import ColorBlocks from "./color-blocks"

const blocks = new ColorBlocks()

const formatOption = function (option, length) {
    let result = Array.from({length}).map(_ => 0)
    if (!isNaN(+option) || option.split(" ").reduce((l, f) => l && !isNaN(f), true)) {
        if (!isNaN(+option)) {
            result = result.map(_ => option)
        } else {
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
    blocks.blocks[0].enableEdit()
    blocks.blocks[0].addHook(blocks.render.bind(blocks))
}

$("#count").addEventListener("change", changeOptions)
$("#hue").addEventListener("change", changeOptions)
$("#saturation").addEventListener("change", changeOptions)
$("#brightness").addEventListener("change", changeOptions)

