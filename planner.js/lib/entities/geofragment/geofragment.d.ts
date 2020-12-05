import { MultiPolygon, Polygon } from "@turf/turf";
import ILocation from "../../interfaces/ILocation";
export default class GeoFragment {
    static create(id?: string): GeoFragment;
    id: string;
    area: Polygon | MultiPolygon;
    constructor(id?: string);
    contains(location: ILocation): boolean;
}
