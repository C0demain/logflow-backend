import { ApiProperty } from "@nestjs/swagger"
import { IsUUID, IsString, IsEmail, IsDateString, IsOptional } from "class-validator"

export class CreateEventDTO{
    @ApiProperty({name: 'title', required: true})
    @IsString()
    title: string

    @ApiProperty({name: 'description', required: true})
    @IsString()
    @IsOptional()
    description?: string

    @ApiProperty({name: 'start', required: true})
    @IsDateString()
    start: string

    @ApiProperty({name: 'end', required: true})
    @IsDateString()
    end: string
}