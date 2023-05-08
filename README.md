# mutative

Inspired by [ArrowJS](https://www.arrow-js.com/)'s `reactive` function that converts regular data objects into observed data objects, this class aims to do the same with DOM elements so that all mutations can trigger callbacks, whether they are part of ArrowJS or not.

Essentially a wrapper for a global MutationObserver that filters records to specific callbacks.

### **1.22kb minified, 800 bytes g-zipped.**

## Use

Import the package by using a CDN or saving it locally.

```javascript
// esm.sh
import mutative from "https://esm.sh/@jackcarey/mutative";
// jsdelivr (with ESM)
import mutative from "https://cdn.jsdelivr.net/npm/@jackcarey/mutative/+esm";
//jsDelivr (with version)
import mutative from "https://cdn.jsdelivr.net/npm/@jackcarey/mutative@1.1.0/mutative.min.js";
//GitHub (always latest code, possibly unstable)
import mutative from "https://cdn.jsdelivr.net/gh/jackcarey/mutative/mutative.min.js";
// local file
import mutative from "./mutative.min.js";
```

Then call it in a script tag:

```javascript
<script type="module">
import mutative from "https://esm.sh/@jackcarey/mutative"

const singleQuery = new mutative("p",(record)=>console.log(record));

const multipleQueries = new mutative(["p",".text","*[data-text]"],(record)=>console.log("text mutated",record));

const objectQueries = new mutative({
    "*[data-text]": (rec)=>console.log(rec),
    "p":(rec)=>alert("paragraph edited"),
    "output":(rec)=>console.log("calculation updated",rec)
});
</script>
```

Each callback is passed one argument, a [MutationRecord](https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord).

## How it works

A global [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) is created with the first instance of `mutative`. It observes the `body` of the document and [MutationRecords](https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord) are only passed to callbacks that have a matching [selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) for at least one of `target`, `addedNodes`, or `removedNodes`.