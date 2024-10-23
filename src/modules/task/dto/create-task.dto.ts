import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { Sector } from "src/modules/service-order/enums/sector.enum";
import { TaskStage } from "../enums/task.stage.enum";

export class CreateTaskDto {

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsUUID()
    @IsNotEmpty()
    orderId: string;

    @IsEnum(Sector)
    @IsNotEmpty()
    sector: Sector;

    @IsEnum(TaskStage)
    @IsNotEmpty()
    stage: TaskStage;

    @IsString()
    @IsOptional()
    role: string;

    @IsOptional()
    @IsUUID()
    userId: string;

    @IsOptional()
    @IsBoolean()
    completed: boolean;
}