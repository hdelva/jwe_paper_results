"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asynciterator_1 = require("asynciterator");
class MergeIterator extends asynciterator_1.AsyncIterator {
    constructor(sourceIterators, selector) {
        super();
        this.sourceIterators = sourceIterators;
        this.selector = selector;
        this.setMaxListeners(1000);
        this.values = Array(this.sourceIterators.length).fill(undefined);
        this.readable = true;
        for (const iterator of this.sourceIterators) {
            this.addListeners(iterator);
        }
    }
    appendIterator(iterator) {
        this.sourceIterators.push(iterator);
        this.values.push(undefined);
        this.addListeners(iterator);
    }
    read() {
        for (let i = 0; i < this.sourceIterators.length; i++) {
            if (this.values[i] === undefined || this.values[i] === null) {
                const iterator = this.sourceIterators[i];
                if (!iterator.ended) {
                    const value = iterator.read();
                    if (value === undefined) {
                        this.readable = false;
                        return undefined;
                    }
                    this.values[i] = value;
                }
            }
        }
        const selectedIndex = this.selector(this.values);
        const item = this.values[selectedIndex];
        this.values[selectedIndex] = undefined;
        return item;
    }
    close() {
        for (const iterator of this.sourceIterators) {
            iterator.close();
        }
        super.close();
    }
    addListeners(iterator) {
        iterator.on("end", () => {
            const allEnded = this.sourceIterators.every((iter) => iter.ended);
            if (allEnded) {
                this.close();
            }
            else if (!this.readable) {
                // everything that's still open is readable
                const allReadable = this.sourceIterators.every((iter) => iter.closed || iter.readable);
                if (allReadable) {
                    this.readable = true;
                }
            }
        });
        iterator.on("readable", () => {
            if (!this.readable) {
                // everything that's still open is readable
                const allReadable = this.sourceIterators.every((iter) => iter.ended || iter.readable);
                if (allReadable) {
                    this.readable = true;
                }
            }
        });
    }
}
exports.default = MergeIterator;
//# sourceMappingURL=MergeIterator.js.map