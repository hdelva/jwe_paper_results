import { SemiEntity, EntityMap, Entity } from "./common";
interface ThingViewResult<T extends SemiEntity> {
    addEntity(entity: T): any;
    getContents(): T | EntityMap<T>;
}
export declare class ThingView<T extends SemiEntity> {
    private entityType;
    private filters;
    private mappings;
    private nestedViews;
    private showId;
    private resultObject;
    constructor(entityType: (id?: string) => T);
    reset(): void;
    addEntity(entity: T): void;
    getContents(): any;
    hideId(): void;
    addFilter(fn: (Entity: any) => boolean): void;
    addMapping(from: any, to: any, view?: ThingView<any>): void;
    private _filter;
    private _makeList;
    private _flattenLists;
    private _map;
    process(entity: Entity): T;
    createResultObject(): ThingViewResult<SemiEntity>;
}
export declare class IndexThingView<T extends Entity> extends ThingView<T> {
    createResultObject(): ThingViewResult<SemiEntity>;
}
export {};
