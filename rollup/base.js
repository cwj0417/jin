import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs"
import path from "path"

export default {
    entry: path.resolve(__dirname, "../src/index.js"),
    dest: path.resolve(__dirname, "../jin.js"),
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
    moduleName: "jin"
};