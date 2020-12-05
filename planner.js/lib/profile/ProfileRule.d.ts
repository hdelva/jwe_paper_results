import { IEntity } from "../loader/common";
import ProfileCondition from "./ProfileCondition";
export default class ProfileRule implements IEntity {
    static create(id: string): ProfileRule;
    id: string;
    conclusion: object;
    condition: ProfileCondition;
    order: number;
    constructor(id: string);
    getID(): string;
}
