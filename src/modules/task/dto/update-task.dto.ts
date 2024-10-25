import { Type } from 'class-transformer';
import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf, ValidateNested } from 'class-validator';
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

    @IsOptional()
    @IsDateString()
    @ValidateIf((object, value) => value !== null)
    startedAt: Date | null;

    @IsOptional()
    @IsDateString()
    @ValidateIf((object, value) => value !== null)
    completedAt: Date | null;

    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;
}
