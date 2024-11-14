import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { Sector } from "src/modules/service-order/enums/sector.enum";

export class UserQueryFilters{

    @ApiProperty({name: 'sector', enum: Sector, required: false})
    @IsOptional()
    @IsEnum(Sector)
    sector?: Sector

    @ApiProperty({name: 'activeUsers', type: 'boolean', required: false})
    @IsOptional()
    @IsBoolean()
    @Transform(({value}) => {
        if(value === 'true') return true
        if(value === 'false') return false
    })
    activeUsers?: boolean
}