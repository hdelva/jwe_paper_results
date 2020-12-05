import { IEntity } from "../loader/common";
export default class ProfileRule implements IEntity {
    static create(id: string): ProfileRule;
    id: string;
    conclusion: object;
    match: object;
    order: number;
    constructor(url: string);
    getID(): string;
}
