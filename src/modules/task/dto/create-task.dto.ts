import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf } from "class-validator";
import { Sector } from "src/modules/service-order/enums/sector.enum";
import { TaskStage } from "../enums/task.stage.enum";

export class CreateTaskDto {

    @IsString()
    @IsNotEmpty({ message: "O campo com o título da tarefa é obrigatório." })
    title: string;

    @IsUUID()
    @IsNotEmpty({ message: "O campo com o ID da ordem de serviço é obrigatório." })
    orderId: string;

    @IsEnum(Sector, { message: "O campo 'Setor' precisa estar dentro dos padrões pré-definidos."})
    @IsNotEmpty()
    sector: Sector;

    @IsEnum(TaskStage, { message: "O campo 'Etapa' precisa estar dentro dos padrões pré-definidos."})
    @IsNotEmpty()
    stage: TaskStage;

    @IsString()
    @IsOptional()
    role: string;

    @IsUUID()
    @IsOptional()
    userId: string;

    @IsOptional()
    @IsDateString()
    @ValidateIf((object, value) => value !== null)
    completedAt: Date | null;
}
