import { ServiceOrder } from 'src/modules/service-order/entities/service-order.entity';

export class ListUsersDTO {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly role: string,
    readonly deactivatedAt: Date | null,
    readonly email: string,
    readonly sector: string
  ) {}
}
