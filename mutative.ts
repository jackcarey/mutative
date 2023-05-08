export default class Mutative {
    static #observerList: Record<string, Function> = {};
    static #mutationFn = (mutationList: MutationRecord[]): void => {
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
    static observe(selectorDict, callback): void {
        if (!Mutative.#observerList) {
            Mutative.#bodyObserver.observe(document.body, {
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
            if (isArray) {
                selectorDict.forEach((name) => {
                    Mutative.#addSelectorFnPair(name, callback);
                });
            } else {
                Mutative.#addSelectorFnPair(selectorDict, callback);
            }
        } else {
            if (
                Object.entries(selectorDict).some(
                    ([key, fn]) => typeof key !== "string" || typeof fn !== "function"
                )
            ) {
                throw new Error("Must be string-function pairs");
            }
            Mutative.#addSelectorObj(selectorDict);
        }
    }
    static disconnect(...selectors): void {
        //finish mutation callbacks before removing selectors
        Mutative.#mutationFn(Mutative.#bodyObserver.takeRecords());
        if (!selectors?.length) {
            Mutative.#bodyObserver.disconnect();
        } else {
            let items = [];
            //allow many types of selectors to be passed to this function
            const addItems = (selectorQueries) => {
                selectorQueries.forEach((s) => {
                    if (Array.isArray(s)) {
                        s.forEach((i) => addItems(i));
                    } else if (typeof s === "string") {
                        items.push(s);
                    } else {
                        Object.keys(s).forEach((k) => items.push(k));
                    }
                });
            };
            addItems(selectors);
            //only try to remove items that are actually part of the observer list
            items
                .filter((k) => Object.keys(Mutative.#observerList).includes(k))
                .forEach((k) => {
                    delete Mutative.#observerList[k];
                });
        }
    }
    static takeRecords(): MutationRecord[] {
        return Array.from(Mutative.#bodyObserver.takeRecords());
    }
}
