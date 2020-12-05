import LDFetch from "ldfetch";
import { LDLoader } from "../../loader/ldloader";
import { ThingView } from "../../loader/views/single";
import GeoFragment from "../../entities/geofragment/geofragment";
import IGeoFragmentFetcher from "./IGeoFragmentFetcher";
import GeoFragmentTree from "../../entities/geofragment/geotree";
export default class GeoFragmentFetcherDefault implements IGeoFragmentFetcher {
    protected ldFetch: LDFetch;
    protected ldLoader: LDLoader;
    constructor(ldFetch: LDFetch);
    get(url: string): Promise<GeoFragmentTree>;
    protected getView(): ThingView<GeoFragmentTree>;
    protected getFragmentView(): ThingView<GeoFragment>;
}
