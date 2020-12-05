import GeoFragment from "./geofragment";
export default class GeoFragmentTree {
    static create(id?: string): GeoFragmentTree;
    id?: string;
    fragments: GeoFragment[];
    constructor(id?: string);
}
