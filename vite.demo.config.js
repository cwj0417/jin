import {defineConfig} from "vite"

// Static build of the palette studio demo, published by GitHub Pages from /docs.
export default defineConfig({
    base: "./",
    build: {
        outDir: "docs",
        emptyOutDir: true
    }
})
