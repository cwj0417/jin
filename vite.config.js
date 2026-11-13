import {fileURLToPath, URL} from "node:url"
import {defineConfig} from "vite"

export default defineConfig({
    publicDir: "public",
    build: {
        copyPublicDir: false,
        lib: {
            entry: fileURLToPath(new URL("./src/index.js", import.meta.url)),
            name: "jin",
            formats: ["es"],
            fileName: () => "jin.js",
        },
        sourcemap: true,
    },
    test: {
        environment: "node",
        include: ["test/**/*.test.js"],
    },
})
