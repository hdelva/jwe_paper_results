import GeoFragmentTree from "../../entities/geofragment/geotree";
export default interface IGeoFragmentFetcher {
    get(url: string): Promise<GeoFragmentTree>;
}
