import { Role } from 'src/modules/roles/enums/roles.enum';

export class ListUsersDTO {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly role: Role,
  ) {}
}
