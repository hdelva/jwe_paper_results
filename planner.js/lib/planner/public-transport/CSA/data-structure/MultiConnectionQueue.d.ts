import { AsyncIterator } from "asynciterator";
import IConnection from "../../../../entities/connections/connections";
export default class MultiConnectionQueue {
    private closed;
    private asyncIterator;
    private queue;
    private next;
    constructor(asyncIterator: AsyncIterator<IConnection>);
    close(): void;
    isClosed(): boolean;
    push(connection: IConnection): void;
    pop(): IConnection;
}
