import { RoutableTileNode } from "../entities/tiles/node";
import { RoutableTileWay } from "../entities/tiles/way";
import { IEntity } from "../loader/common";
export default class ProfileValueReference implements IEntity {
    static create(id: string): ProfileValueReference;
    id: string;
    from: string;
    constructor(id: string);
    getID(): string;
    resolve(element: RoutableTileNode | RoutableTileWay): any;
}
