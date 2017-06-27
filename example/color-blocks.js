import ColorBlock from "./color-block"
export default class ColorBlocks {
    constructor() {
        this.blocks = []
    }

    amendLength(count) {
        count = +count
        if (isNaN(count) || count < 0) {
            return
        }
        if (count < this.blocks.length) {
            for (let _count = this.blocks.length - count; _count > 0; _count--) {
                this.blocks[this.blocks.length - 1].destroy()
                this.blocks.pop()
            }
        }
        if (count > this.blocks.length) {
            for (let _count = count - this.blocks.length; _count > 0; _count--) {
                this.blocks.push(new ColorBlock())
            }
        }
    }

    setOptions(options) {
        this.options = options
    }

    render() {
        for (let i = 1; i < this.blocks.length; i++) {
            if (isNaN(this.blocks[i - 1].jin.hsb.h + this.options.h[i - 1])) {
                console.log(this.blocks[i - 1].jin.hsb)
            }
            this.blocks[i].setHSB({
                h: this.blocks[i - 1].jin.hsb.h + this.options.h[i - 1],
                s: this.blocks[i - 1].jin.hsb.s + this.options.s[i - 1],
                b: this.blocks[i - 1].jin.hsb.b + this.options.b[i - 1],
            })
        }
    }
}