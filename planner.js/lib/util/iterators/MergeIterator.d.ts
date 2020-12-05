import { AsyncIterator } from "asynciterator";
declare type Selector<T> = (values: Array<T | undefined | null>) => number;
export default class MergeIterator<T> extends AsyncIterator<T> {
    values: T[];
    private readonly sourceIterators;
    private readonly selector;
    constructor(sourceIterators: Array<AsyncIterator<T>>, selector: Selector<T>);
    appendIterator(iterator: AsyncIterator<T>): void;
    read(): T;
    close(): void;
    private addListeners;
}
export {};
