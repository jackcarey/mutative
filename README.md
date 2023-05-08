# mutative

Persistent DOM mutation observations based on CSS query [selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors). It's essentially a wrapper for a global [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) that filters records to specific callbacks. The API is _similar_ to MutationObserver, but not the same.

The advantage is that observers can be set up ahead of the existence of matching DOM elements, which is useful when working with SPAs or other reactive content.

### **~1.3kb minified, ~800 bytes gzipped.**

## Use

Import the package by using a CDN or saving it locally.

```javascript
// esm.sh
import mutative from "https://esm.sh/@jackcarey/mutative";
// jsdelivr (with ESM)
import mutative from "https://cdn.jsdelivr.net/npm/@jackcarey/mutative/+esm";
//jsDelivr (with version)
import mutative from "https://cdn.jsdelivr.net/npm/@jackcarey/mutative@1.2.0/mutative.min.js";
//GitHub (always latest code, possibly unstable)
import mutative from "https://cdn.jsdelivr.net/gh/jackcarey/mutative/mutative.min.js";
// local file
import mutative from "./mutative.min.js";
```

Then call it in a script tag:

```javascript
<script type="module">
import mutative from "https://esm.sh/@jackcarey/mutative"

// pass a single selector and callback
Mutative.observe("p",(record)=>console.log(record));

//pass multiple selectors with the same callback
Mutative.observe(["p",".text","*[data-text]"],(record)=>console.log("text mutated",record));

//pass multiple selectors at once with different callbacks
Mutative.observe({
    "*[data-text]": (rec)=>console.log(rec),
    "p":(rec)=>alert("paragraph edited"),
    "output":(rec)=>console.log("calculation updated",rec)
});
</script>
```

Each callback is passed one argument, a [MutationRecord](https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord).

### observe()

The parameters here differ from the MutationObserver implementation. Instead of a `target` and `options` there is `selectors` and `callback`.

* `selectors` - Several types are allowed:
    * `string` - a single CSS query selector.
    * `string[]` - multiple CSS query selectors that use the same `callback`.
    * `object` - CSS query selectors strings as keys, callbacks as values.
* `callback` - Only required when `selectors` is a string or array of strings. A function that accepts a MutationRecord as it's only parameter.

### disconnect()

Mutations that have been detected but not yet reported to observers are _not_ discarded. Observer callbacks are triggered before disconnection.

-   **When called with no arguments:** acts the same as [disconnect()](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/disconnect), cancelling **all** *future* observations.
-   **When passed with an argument:** The arguments follow the same formats as `observe()`'s `selectors` parameter. Only observers with the passed selectors are cancelled.

### takeRecords()

Takes all records from the Mutative object, use carefully. See: [takeRecords()](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/takeRecords).

## How it works

A single MutationObserver is created on the document `body` with the first call of `mutative.observe()`. MutatioNrecords are only passed to callbacks that have a matching selector for at least one of `target`, `addedNodes`, or `removedNodes`.
