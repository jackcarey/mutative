class mutative {
    static #observerList;
    static #mutationFn = (mutationList) => {
        Object.entries(mutative.#observerList).forEach(([selector, callback]) => {
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
    };
    static #bodyObserver = new MutationObserver(mutative.#mutationFn);
    selectorList;
    static addSelectorObj(newObj) {
        Object.assign(mutative.#observerList, newObj);
    }
    addSelectorFnPair(name, fn) {
        const obj = {};
        obj[name] = fn;
        mutative.addSelectorObj(obj);
        this.selectorList.push(name);
    }
    constructor(selectorDict, callback) {
        if (!mutative.#observerList) {
            mutative.#observerList = {};
            mutative.#bodyObserver.observe(document.body, {
                attributes: true,
                subtree: true,
                childList: true,
                characterData: true,
                attributeOldValue: true,
                characterDataOldValue: true,
            });
        }
        this.selectorList = [];
        const isString = typeof selectorDict === "string";
        const isArray = Array.isArray(selectorDict);
        if (!isString && !isArray && !(typeof selectorDict === "object")) {
            throw new Error("selectorDict must be string, array, or object");
        }
        if (isString || isArray) {
            if (typeof callback !== "function") {
                throw new Error("callback must be a function");
            }
            if (isArray) {
                selectorDict.forEach((name) => {
                    this.addSelectorFnPair(name, callback);
                });
            }
            else {
                this.addSelectorFnPair(selectorDict, callback);
            }
        }
        else {
            if (Object.entries(selectorDict).some(([key, fn]) => typeof key !== "string" || typeof fn !== "function")) {
                throw new Error("Must be string-function pairs");
            }
            mutative.addSelectorObj(selectorDict);
            this.selectorList = Object.keys(selectorDict);
        }
    }
    disconnect = () => {
        mutative.#mutationFn(mutative.#bodyObserver.takeRecords());
        this.selectorList
            .filter((k) => Object.keys(mutative.#observerList).includes(k))
            .forEach((k) => {
            delete mutative.#observerList[k];
        });
    };
    toString = () => this.selectorList.join(", ");
}
export default mutative;
