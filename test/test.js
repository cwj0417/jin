let assert = require("chai").assert
let jin = require("../jin").default


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
    it("tostring", function () {
        assert.equal(jin(0, 255, 0).toString(), "#00ff00")
    })
})
describe("hsb", function () {
    it("red", function () {
        assert.deepEqual(jin(255, 0, 0).hsb, {h: 0, s: 100, b: 100})
    })
    it("green", function () {
        assert.deepEqual(jin(0, 255, 0).hsb, {h: 120, s: 100, b: 100})
    })
    it("blue", function () {
        assert.deepEqual(jin(0, 0, 255).hsb, {h: 240, s: 100, b: 100})
    })
    it("random1", function () {
        assert.deepEqual(jin(52, 133, 255).hsb, {h: 216, s: 80, b: 100})
    })
    it("random2", function () {
        assert.deepEqual(jin(54, 178, 92).hsb, {h: 138, s: 70, b: 70})
    })
})
describe("set hsb", function () {
    it("set h from 0 to 120 and check if it becomes green", function () {
        assert.deepEqual(jin(255, 0, 0).setHSB({h: 120}).rgb, {r: 0, g: 255, b: 0})
    })
    it("random1", function () {
        assert.deepEqual(jin(55, 31, 116).setHSB({h: 54, s: 22, b: 87}).rgb, {r: 222, g: 217, b: 173})
    })
})