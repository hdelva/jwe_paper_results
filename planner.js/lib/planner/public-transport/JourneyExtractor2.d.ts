import { AsyncIterator } from "asynciterator";
import Context from "../../Context";
import IPath from "../../interfaces/IPath";
import ILocationResolver from "../../query-runner/ILocationResolver";
import IResolvedQuery from "../../query-runner/IResolvedQuery";
import IProfileByStop from "./CSA/data-structure/stops/IProfileByStop";
import IJourneyExtractor from "./IJourneyExtractor";
export default class JourneyExtractor2 implements IJourneyExtractor {
    private readonly locationResolver;
    private context;
    constructor(locationResolver: ILocationResolver, context?: Context);
    extractJourneys(profilesByStop: IProfileByStop, query: IResolvedQuery): Promise<AsyncIterator<IPath>>;
}
