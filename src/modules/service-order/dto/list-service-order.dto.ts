import { Status } from "../enums/status.enum";

export class ListServiceOrderDto{
    constructor(
        readonly id: string,
        readonly title: string,
        readonly clientRelated: string,
        readonly status: Status,
        readonly user: {
            id: string,
            name: string,
            email: string
        }
    ){};
}