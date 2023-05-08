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
    selectorList = [];
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
        const isString = typeof selectorDict === "string";
        const isArray = Array.isArray(selectorDict);
        if (!isString && !isArray && !(typeof selectorDict === "object")) {
            throw new Error("selectorDict must be string, array, or object");
        }
        if (isString || isArray) {
            if (typeof callback !== "function") {
                throw new Error("callback must be a function");
            }
            (isArray ? selectorDict : [selectorDict]).forEach((query) => {
                mutative.#observerList[query] == callback;
                this.selectorList.push(query);
            });
        }
        else {
            if (Object.entries(selectorDict).some(([key, fn]) => typeof key !== "string" || typeof fn !== "function")) {
                throw new Error("All entries must be string-function pairs");
            }
            const obj = Object.create(mutative.#observerList);
            mutative.#observerList = { obj, ...selectorDict };
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
