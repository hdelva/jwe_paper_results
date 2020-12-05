import { BufferedIterator } from "asynciterator";
import LdFetch from "ldfetch";
import IHydraPage from "./IHydraPage";
import IHydraPageIteratorConfig from "./IHydraPageIteratorConfig";
export default class HydraPageIterator extends BufferedIterator<IHydraPage> {
    private readonly baseUrl;
    private readonly ldFetch;
    private readonly config;
    private currentPage;
    constructor(baseUrl: string, ldFetch: LdFetch, config: IHydraPageIteratorConfig);
    _begin(done: () => void): void;
    _read(count: number, done: () => void): void;
    private loadPage;
}
