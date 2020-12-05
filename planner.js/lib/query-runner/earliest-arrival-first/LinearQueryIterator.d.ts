import { AsyncIterator } from "asynciterator";
import { DurationMs } from "../../interfaces/units";
import IResolvedQuery from "../IResolvedQuery";
/**
 * This AsyncIterator emits [[IResolvedQuery]] instances with linear increasing `maximumArrivalTime`.
 */
export default class LinearQueryIterator extends AsyncIterator<IResolvedQuery> {
    private readonly baseQuery;
    private timespan;
    private index;
    private readonly a;
    private readonly b;
    constructor(baseQuery: IResolvedQuery, a: DurationMs, b: DurationMs);
    read(): IResolvedQuery;
}
