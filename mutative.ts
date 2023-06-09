export default class Mutative {
    static #isObserving = false;
    static #observerList: Record<string, Function> = {};
    static #mutationFn = (mutationList: MutationRecord[]): void => {
        if (Mutative.#isObserving) {
            Object.entries(Mutative.#observerList).forEach(([selector, callback]) => {
                mutationList.forEach((mutationRecord: MutationRecord) => {
                    [
                        ...Array.from(mutationRecord?.addedNodes),
                        ...Array.from(mutationRecord?.removedNodes),
                        mutationRecord?.target,
                    ].forEach((el: Node) => {
                        if (el instanceof Element && el.matches(selector)) {
                            callback(mutationRecord);
                        }
                    });
                });
            });
        }
    };
    static #bodyObserver = new MutationObserver(Mutative.#mutationFn);
    static #addSelectorObj(newObj): void {
        // const obj = Object.create(mutative.#observerList);
        // mutative.#observerList = { ...obj, ...newObj };
        Object.assign(Mutative.#observerList, newObj);
    }
    static #addSelectorFnPair(name, fn): void {
        const obj = {};
        obj[name] = fn;
        Mutative.#addSelectorObj(obj);
    }
    static observe(selectors, callback): void {
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
                } else {
                    Mutative.#addSelectorFnPair(selectors, callback);
                }
            } else {
                if (
                    Object.entries(selectors).some(
                        ([key, fn]) => typeof key !== "string" || typeof fn !== "function"
                    )
                ) {
                    throw new Error("Must be string-function pairs");
                }
                Mutative.#addSelectorObj(selectors);
            }
        }
    }
    static disconnect(...selectors): void {
        //finish mutation callbacks before removing selectors
        Mutative.#mutationFn(Mutative.#bodyObserver.takeRecords());
        if (selectors) {
            let items = [];
            //allow many types of selectors to be passed to this function
            const addItems = (selectorQueries) => {
                selectorQueries.forEach((s) => {
                    if (s) {
                        if (Array.isArray(s)) {
                            s.forEach((i) => addItems(i));
                        } else if (typeof s === "string") {
                            items.push(s);
                        } else {
                            addItems(Object.keys(s));
                        }
                    }
                });
            };
            addItems(selectors);
            //only try to remove items that are actually part of the observer list
            const observerKeys = Object.keys(Object.create(Mutative.#observerList));
            items
                .filter((k) => observerKeys.includes(k))
                .forEach((k) => {
                    delete Mutative.#observerList[k];
                });
        }
        //if there are no selectors left or this is a full pause, stop observing anything at all
        if (!selectors?.length || !Object.keys(Mutative.#observerList)?.length) {
            Mutative.#isObserving = false;
            Mutative.#bodyObserver.disconnect();
        }
    }
    static takeRecords(): MutationRecord[] {
        return Array.from(Mutative.#bodyObserver.takeRecords());
    }
    static get isObserving(): Boolean {
        return Mutative.#isObserving;
    }
}
