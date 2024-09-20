import { Sector } from "../enums/sector.enum";
import { Status } from "../enums/status.enum";

export class ListServiceOrderDto{
    constructor(
        readonly id: string,
        readonly title: string,
        readonly clientRelated: string,
        readonly status: Status,
        readonly sector: Sector,
        readonly user: {
            id: string,
            name: string,
            email: string,
            role: string,
        }
    ){};
}