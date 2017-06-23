let assert = require("chai").assert
let jin = require("../jin")

describe("construct", function () {
    it("hex", function () {
        assert.deepEqual(jin("#ff00ff").rgb, {r: 255, g: 0, b: 255})
    })
    it("shorthex", function () {
        assert.deepEqual(jin("#fff").rgb, {r: 255, g: 255, b: 255})
    })
    it("rgb", function () {
        assert.deepEqual(jin(0, 255, 0).rgb, {r: 0, g: 255, b: 0})
    })
})
describe("hsi", function () {
    it("red", function () {
        assert.deepEqual(jin(255, 0, 0).hsb, {h: 0, s: 100, b: 100})
    })
    it("green", function () {
        assert.deepEqual(jin(0, 255, 0).hsb, {h: 120, s: 100, b: 100})
    })
    it("blue", function () {
        assert.deepEqual(jin(0, 0, 255).hsb, {h: 240, s: 100, b: 100})
    })
})