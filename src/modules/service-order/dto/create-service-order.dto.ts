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
  @IsNotEmpty({ message: "O campo 'Título' não pode estar vazio." })
  title: string;

  @IsUUID()
  @IsNotEmpty({ message: "O campo com o ID do Cliente é obrigatório." })
  clientId: string;

  @IsUUID()
  @IsNotEmpty({ message: "O campo com o ID do Processo é obrigatório." })
  processId: string;

  @IsOptional()
  @IsEnum(Status, { message: "O campo 'Status' precisa estar dentro dos padrões pré-definidos."})
  status: Status;

  @IsEnum(Sector, { message: "O campo 'Setor' precisa estar dentro dos padrões pré-definidos."})
  sector: Sector;

  @IsUUID()
  @IsNotEmpty({ message: "O campo com o ID do Usuário é obrigatório." })
  userId: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  description: string;

  @IsOptional()
  @IsNumber()
  value: number;
}
