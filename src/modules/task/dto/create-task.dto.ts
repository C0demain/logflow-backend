import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf } from "class-validator";
import { Sector } from "src/modules/service-order/enums/sector.enum";

export class CreateTaskDto {

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsUUID()
    @IsNotEmpty()
    orderId: string;

    @IsEnum(Sector)
    sector: Sector;

    @IsString()
    @IsOptional()
    role: string;

    @IsOptional()
    @IsUUID()
    userId: string;

    @IsOptional()
    @IsDateString()
    @ValidateIf((object, value) => value !== null)
    completedAt: Date | null;
}
