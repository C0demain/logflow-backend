import { IsNotEmpty } from 'class-validator';
import { Role } from '../enums/roles.enum';

export class CreateRoleDTO {
  @IsNotEmpty()
  name: Role;
}
