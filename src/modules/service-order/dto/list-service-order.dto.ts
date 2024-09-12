import { Status } from "../enums/status.enum";

export class ListServiceOrderDto{
    constructor(
        readonly id: string,
        readonly title: string,
        readonly clientRelated: string,
        readonly expirationDate: Date,
        readonly status: Status
    ){};
}