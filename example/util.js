export const $ = function (selector, className, type) {
    if (className || type) {
        let dom = document.createElement(selector)
        dom.className = className
        if (type) {
            dom.setAttribute("type", type)
            if (type === "range") {
                dom.setAttribute("max", 255)
                dom.setAttribute("disabled", "disabled")
            } else {
                dom.setAttribute("readonly", "readonly")
            }
        }
        return dom
    }
    let results = document.querySelectorAll(selector)
    return results.length === 1 ? results[0] : results
}
export const $o = function (value, label) {
    let dom = document.createElement("option")
    dom.setAttribute("value", value)
    dom.innerText = label
    return dom
}

export const throttle = function(fn, timeout = 200) {
    let timer
    return function () {
        if (!timer) {
            fn && fn()
            timer = setTimeout(function () {
                timer = null
            }, timeout)
        }
    }
}