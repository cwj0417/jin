import {fileURLToPath, URL} from "node:url"
import {defineConfig} from "vite"

export default defineConfig({
    build: {
        copyPublicDir: false,
        lib: {
            entry: fileURLToPath(new URL("./src/umd.js", import.meta.url)),
            name: "jin",
            formats: ["umd"],
            fileName: () => "jin.umd.cjs",
        },
        rollupOptions: {
            output: {
                exports: "default",
            },
        },
        sourcemap: true,
        emptyOutDir: false,
    },
})
