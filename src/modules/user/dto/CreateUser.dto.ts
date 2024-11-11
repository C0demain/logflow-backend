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
  @IsNotEmpty({ message: "O campo 'Nome' não pode ser vazio." })
  name: string;

  @IsEmail(undefined, {
    message: "O campo 'email' informado é inválido ou não foi informado.",
  })
  @UniqueEmail({ message: "Email já associado a um usuário ou cliente." })
  email: string;

  @MinLength(6, {
    message: "O campo 'senha' precisa ter pelo menos 6 caracteres.",
  })
  password: string;

  @IsOptional()
  @IsString({
    message: "O campo 'Função' precisa estar dentro dos padrôes estabelecidos.",
  })
  role: string

  @IsEnum(Sector, {
    message: "O campo 'Setor' precisa estar dentro dos padrôes estabelecidos.",
  })
  sector: Sector;

  @IsOptional()
  @IsBoolean({ message: "O campo 'Ativo' precisa ser Verdadeiro ou Falso." })
  isActive: boolean;
}
