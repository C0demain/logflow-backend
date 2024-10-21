import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsBoolean,
  IsString,
} from 'class-validator';
import { UniqueEmail } from '../validation/UniqueEmail.validation';
import { Sector } from 'src/modules/service-order/enums/sector.enum';

export class CreateUserDTO {
  @IsNotEmpty({ message: 'O campo `name` não pode ser vazio.' })
  name: string;

  @IsEmail(undefined, {
    message: 'O campo `email` informado é inválido ou não foi informado.',
  })
  @UniqueEmail({ message: 'Já existe um usuário ou cliente com este email.' })
  email: string;

  @MinLength(6, {
    message: 'O campo `password` precisa ter pelo menos 6 caracteres.',
  })
  password: string;

  @IsOptional()
  @IsString({
    message: 'O campo `role` precisa estar dentro dos padrôes estabelecidos.',
  })
  role: string

  @IsEnum(Sector, {
    message: 'O campo `sector` precisa estar dentro dos padrôes estabelecidos.',
  })
  sector: Sector;

  @IsOptional()
  @IsBoolean({ message: 'O campo `isActive` precisa ser `true` ou `false`.' })
  isActive: boolean;
}
