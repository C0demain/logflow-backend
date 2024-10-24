import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { AddressDto } from 'src/modules/client/dto/address.dto';
import { Sector } from 'src/modules/service-order/enums/sector.enum';

export class UpdateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsUUID()
    @IsNotEmpty()
    orderId: string;

    @IsEnum(Sector)
    sector: Sector;

    @IsOptional()
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @IsBoolean()
    completed: boolean;

    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;
}
