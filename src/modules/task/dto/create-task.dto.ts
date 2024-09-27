import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { Sector } from "src/modules/service-order/enums/sector.enum";

export class CreateTaskDto {

    @IsString()
    @IsNotEmpty()
    title: string

    @IsUUID()
    @IsNotEmpty()
    orderId: string

    @IsOptional()
    @IsUUID()
    userId: string

    @IsEnum(Sector)
    sector: Sector
}
