import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string

    @IsNotEmpty()
    @IsUUID()
    userId: string

    @IsBoolean()
    completed: boolean
}
