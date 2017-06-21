import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs"

export default {
    entry: "./src/index.js",
    dest: "jin.js",
    plugins: [
        resolve(),
        babel({
            exclude: "node_modules/**",
            presets: ["es2015-rollup"]
        }),
        commonjs({
            namedExports: {
                "node_modules/lodash.throttle/index.js": ["throttle"]
            }
        })
    ],
    format: "umd",
    moduleName: "shiny-scroll"
};