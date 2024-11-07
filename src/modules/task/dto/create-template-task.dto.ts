import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateIf, ValidateNested } from "class-validator";
import { Sector } from "src/modules/service-order/enums/sector.enum";
import { TaskStage } from "../enums/task.stage.enum";
import { Address } from "src/modules/client/entities/address.entity";
import { Type } from "class-transformer";
import { AddressDto } from "src/modules/client/dto/address.dto";

export class CreateTemplateTaskDto {

    @IsString()
    @IsNotEmpty({ message: "O campo com o título da tarefa é obrigatório." })
    title: string;

    @IsUUID()
    processId: string

    @IsEnum(Sector, { message: "O campo 'Setor' precisa estar dentro dos padrões pré-definidos."})
    @IsNotEmpty()
    sector: Sector;

    @IsEnum(TaskStage, { message: "O campo 'Etapa' precisa estar dentro dos padrões pré-definidos."})
    @IsNotEmpty()
    stage: TaskStage;

    @IsUUID()
    roleId: string;

    @IsOptional()
    @IsNumber()
    taskCost?: number

    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
    address?: Address
}
