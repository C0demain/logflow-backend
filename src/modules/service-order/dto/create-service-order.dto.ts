import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  Length,
} from 'class-validator';
import { Status } from '../enums/status.enum';
import { Sector } from '../enums/sector.enum';

export class CreateServiceOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'o campo `title` não pode estar vazio' })
  title: string;

  @IsUUID()
  @IsNotEmpty({ message: 'o campo `clientId`é obrigatorio' })
  clientId: string;

  @IsOptional()
  @IsEnum(Status, { message: 'o campo `status` precisa estar dentro dos padrões pré-definidos'})
  status: Status;

  @IsEnum(Sector, { message: 'o campo `sector` precisa estar dentro dos padrões pré-definidos'})
  sector: Sector;

  @IsUUID()
  @IsNotEmpty({ message: 'O campo `userId` é obrigatório' })
  userId: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  description: string;

  @IsOptional()
  @IsNumber()
  value: number;
}
