import { IsDateString, IsEnum, IsOptional } from "class-validator";
import { Sector } from "src/modules/service-order/enums/sector.enum";

export class FilterTasksDto {

    @IsOptional()
    @IsDateString()
    startedAt?: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsEnum(Sector)
    sector?: Sector;
}