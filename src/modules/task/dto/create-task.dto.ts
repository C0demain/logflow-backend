import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { Sector } from "src/modules/service-order/enums/sector.enum";

export class CreateTaskDto {

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsUUID()
    @IsNotEmpty()
    orderId: string;

    @IsOptional()
    @IsUUID()
    userId: string;

    @IsEnum(Sector)
    sector: Sector;

    @IsOptional()
    @IsUUID()
    clientId: string

    @IsOptional()
    @IsUUID()
    driverId: string;

    @IsOptional()
    @IsBoolean()
    collectProduct: boolean;

    @IsOptional()
    @IsBoolean()
    departureForDelivery: boolean;

    @IsOptional()
    @IsBoolean()
    arrival: boolean;

    @IsOptional()
    @IsBoolean()
    collectSignature: boolean;
}
