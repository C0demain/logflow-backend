import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string

    @IsNotEmpty()
    @IsUUID()
    userId: string
}
