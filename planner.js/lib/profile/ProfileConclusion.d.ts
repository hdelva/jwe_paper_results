import { IEntity } from "../loader/common";
import ProfileValueReference from "./ProfileValueReference";
export default class ProfileConclusion implements IEntity {
    static create(id: string): ProfileConclusion;
    id: string;
    hasccess?: boolean;
    isOneway?: boolean;
    isReversed?: boolean;
    speed?: number | ProfileValueReference;
    isPriority?: boolean;
    priority?: number;
    constructor(id: string);
    getID(): string;
}
