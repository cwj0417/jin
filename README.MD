# jinjin

# installation
use npm or yarn

```bash
npm i jinjin -S // use npm
yarn add jinjin // use yarn
```

in es6

```js
import jin from "jinjin"
```

use script

```html
<script src="./node_modules/jin/jin.js" />
```

# api

## jin
you can import from "jinjin" in common js , for use script tag and `jin` have already explored to `window`.
`type` function
`input` (String) color code of hex / (Number, Number, Number) r, g, b
 `return` Color instance
usage
```js
let white = jin("#fff")
let black = jin(0, 0, 0)
```

## setHSB
`type` function
`input` Object ({h, s, b})
`return` Color instance

## (class) Color
properties:
`rgb` Object ({r, g, b})
`hsb` Object ({h, s, b})