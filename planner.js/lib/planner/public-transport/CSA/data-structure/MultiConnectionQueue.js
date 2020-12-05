"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tinyqueue_1 = __importDefault(require("tinyqueue"));
class MultiConnectionQueue {
    constructor(asyncIterator) {
        this.closed = false;
        this.asyncIterator = asyncIterator;
        this.queue = new tinyqueue_1.default([], (a, b) => {
            return a.departureTime - b.departureTime;
        });
    }
    close() {
        this.asyncIterator.close();
        this.closed = true;
    }
    isClosed() {
        return this.closed || this.asyncIterator.closed;
    }
    push(connection) {
        this.queue.push(connection);
    }
    pop() {
        if (!this.asyncIterator.readable) {
            return;
        }
        if (!this.next) {
            this.next = this.asyncIterator.read();
        }
        if (!this.next) {
            return this.queue.pop();
        }
        if (this.queue.peek() && this.queue.peek().departureTime < this.next.departureTime) {
            return this.queue.pop();
        }
        const result = this.next;
        this.next = undefined;
        return result;
    }
}
exports.default = MultiConnectionQueue;
//# sourceMappingURL=MultiConnectionQueue.js.map