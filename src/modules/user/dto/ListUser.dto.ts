import { Role } from 'src/modules/roles/enums/roles.enum';
import { ServiceOrder } from 'src/modules/service-order/entities/service-order.entity';

export class ListUsersDTO {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly role: Role,
    readonly isActive: boolean,
    readonly email: string,
    readonly sector: string
  ) {}
}
