import { IFootpathIndex } from "../../entities/footpaths/footpath";
export default interface IFootpathsFetcher {
    prefetch: () => void;
    get: () => Promise<IFootpathIndex>;
}
