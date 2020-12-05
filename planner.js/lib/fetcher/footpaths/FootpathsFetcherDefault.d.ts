import LDFetch from "ldfetch";
import { LDLoader } from "../../loader/ldloader";
import { IndexThingView } from "../../loader/views";
import IFootpathsFetcher from "./IFootpathsFetcher";
import { IFootpathIndex, Footpath } from "../../entities/footpaths/footpath";
export default class FootpathsFetcherDefault implements IFootpathsFetcher {
    protected ldFetch: LDFetch;
    protected ldLoader: LDLoader;
    protected paths: IFootpathIndex;
    constructor(ldFetch: LDFetch);
    prefetch(): Promise<void>;
    get(): Promise<IFootpathIndex>;
    protected getPathsView(): IndexThingView<Footpath>;
}
