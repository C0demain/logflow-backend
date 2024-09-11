import { Status } from "../enums/status.enum";

export class ListServiceOrderDto{
    constructor(
        readonly titulo: string,
        readonly cliente: string,
        readonly dataDeExpiração: string,
        readonly status: Status
    ){};
}