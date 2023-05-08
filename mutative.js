class Mutative {
    static #isObserving = false;
    static #observerList = {};
    static #mutationFn = (mutationList) => {
        if (Mutative.#isObserving) {
            Object.entries(Mutative.#observerList).forEach(([selector, callback]) => {
                mutationList.forEach((mutationRecord) => {
                    [
                        ...Array.from(mutationRecord?.addedNodes),
                        ...Array.from(mutationRecord?.removedNodes),
                        mutationRecord?.target,
                    ].forEach((el) => {
                        if (el instanceof Element && el.matches(selector)) {
                            callback(mutationRecord);
                        }
                    });
                });
            });
        }
    };
    static #bodyObserver = new MutationObserver(Mutative.#mutationFn);
    static #addSelectorObj(newObj) {
        Object.assign(Mutative.#observerList, newObj);
    }
    static #addSelectorFnPair(name, fn) {
        const obj = {};
        obj[name] = fn;
        Mutative.#addSelectorObj(obj);
    }
    static observe(selectors, callback) {
        if (!Mutative.#isObserving) {
            Mutative.#isObserving = true;
            Mutative.#bodyObserver.observe(document.body, {
                attributes: true,
                subtree: true,
                childList: true,
                characterData: true,
                attributeOldValue: true,
                characterDataOldValue: true,
            });
        }
        if (selectors) {
            const isString = typeof selectors === "string";
            const isArray = Array.isArray(selectors);
            if (!isString && !isArray && !(typeof selectors === "object")) {
                throw new Error("selectorDict must be string, array, or object");
            }
            if (isString || isArray) {
                if (typeof callback !== "function") {
                    throw new Error("callback must be a function");
                }
                if (isArray) {
                    selectors.forEach((name) => {
                        Mutative.#addSelectorFnPair(name, callback);
                    });
                }
                else {
                    Mutative.#addSelectorFnPair(selectors, callback);
                }
            }
            else {
                if (Object.entries(selectors).some(([key, fn]) => typeof key !== "string" || typeof fn !== "function")) {
                    throw new Error("Must be string-function pairs");
                }
                Mutative.#addSelectorObj(selectors);
            }
        }
    }
    static disconnect(...selectors) {
        Mutative.#mutationFn(Mutative.#bodyObserver.takeRecords());
        if (selectors) {
            let items = [];
            const addItems = (selectorQueries) => {
                selectorQueries.forEach((s) => {
                    if (s) {
                        if (Array.isArray(s)) {
                            s.forEach((i) => addItems(i));
                        }
                        else if (typeof s === "string") {
                            items.push(s);
                        }
                        else {
                            addItems(Object.keys(s));
                        }
                    }
                });
            };
            addItems(selectors);
            const observerKeys = Object.keys(Object.create(Mutative.#observerList));
            items
                .filter((k) => observerKeys.includes(k))
                .forEach((k) => {
                    delete Mutative.#observerList[k];
                });
        }
        if (!selectors?.length || !Object.keys(Mutative.#observerList)?.length) {
            Mutative.#isObserving = false;
            Mutative.#bodyObserver.disconnect();
        }
    }
    static takeRecords() {
        return Array.from(Mutative.#bodyObserver.takeRecords());
    }
    static get isObserving() {
        return Mutative.#isObserving;
    }
}
export default Mutative;
