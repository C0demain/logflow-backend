import { Sector } from "../enums/sector.enum";
import { Status } from "../enums/status.enum";

export class ListServiceOrderDto{
    constructor(
        readonly id: string,
        readonly title: string,
        readonly client:{
            clientName: string,
            clientEmail: string,
            clientCnpj: string
        },
        readonly status: Status,
        readonly sector: Sector,
        readonly user: {
            userId: string,
            userName: string,
            userEmail: string,
            userRole: string,
        }
    ){};
}