import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

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
}
