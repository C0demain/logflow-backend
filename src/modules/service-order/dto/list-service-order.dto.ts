import { Sector } from '../enums/sector.enum';
import { Status } from '../enums/status.enum';

export class ListServiceOrderDto {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly client: {
      clientId: string;
      clientName: string;
      clientEmail: string;
      clientCnpj: string;
    },
    readonly status: Status,
    readonly sector: Sector,
    readonly logs?: {
      changedTo?: Sector;
      atDate?: Date;
    }[],
    readonly description?: string,
    readonly value?: Number,
  ) {}
}
